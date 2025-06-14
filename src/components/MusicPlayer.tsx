// Completely isolated MusicPlayer that only works with playlist stations
import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import PlayerLayout from "@/components/music-player/PlayerLayout";
import PlayerTrackInfo from "@/components/music-player/PlayerTrackInfo";
import PlayerSlider from "@/components/music-player/PlayerSlider";
import PlayerControlsRow from "@/components/music-player/PlayerControlsRow";
import PlayerVolume from "@/components/music-player/PlayerVolume";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { usePhoneCallHandling } from "@/hooks/usePhoneCallHandling";
import { Track } from "@/types/track";

interface MusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  tracks?: Track[];
}

const MusicPlayer: React.FC<MusicPlayerProps> = memo(({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  tracks = [],
}) => {
  console.log("MusicPlayer - Props received:");
  console.log("- Total tracks:", tracks.length);
  console.log("- Current index:", currentIndex);
  console.log("- Is playing:", isPlaying);

  // STEP 1: Extract only playlist stations
  const playlistStations = useMemo(() => {
    const filtered = tracks.filter(track => track.inPlaylist === true);
    console.log("MusicPlayer - Filtered playlist stations:", filtered.length);
    console.log("- Playlist station names:", filtered.map(s => s.name));
    return filtered;
  }, [tracks]);

  const playlistUrls = useMemo(() => {
    return playlistStations.map(station => station.url);
  }, [playlistStations]);

  // STEP 2: Find current track in playlist (if it exists)
  const currentTrack = tracks[currentIndex];
  const playlistIndex = useMemo(() => {
    if (!currentTrack || !currentTrack.inPlaylist) {
      return -1; // Current track is not in playlist
    }
    return playlistStations.findIndex(station => station.url === currentTrack.url);
  }, [currentTrack, playlistStations]);

  console.log("MusicPlayer - Current track analysis:");
  console.log("- Current track:", currentTrack?.name);
  console.log("- Is in playlist:", currentTrack?.inPlaylist);
  console.log("- Playlist index:", playlistIndex);

  // STEP 3: Internal playlist-only state
  const [internalIndex, setInternalIndex] = useState(playlistIndex >= 0 ? playlistIndex : 0);
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);

  // STEP 4: Sync external changes to internal state (only when valid)
  useEffect(() => {
    if (playlistIndex >= 0) {
      console.log("MusicPlayer - Syncing external change to internal state:", playlistIndex);
      setInternalIndex(playlistIndex);
      setInternalIsPlaying(isPlaying);
    } else {
      console.log("MusicPlayer - External track not in playlist, stopping playback");
      setInternalIsPlaying(false);
    }
  }, [playlistIndex, isPlaying]);

  // STEP 5: Handle internal playlist navigation (NO external sync)
  const handleInternalIndexChange = useCallback((newIndex: number) => {
    console.log("MusicPlayer - Internal navigation to playlist index:", newIndex);
    console.log("- Will play:", playlistStations[newIndex]?.name);
    setInternalIndex(newIndex);
    // CRITICAL: Do NOT call setCurrentIndex here - keep it internal only
  }, [playlistStations]);

  // STEP 6: Use player core with playlist-only data
  const {
    duration,
    currentTime,
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
  } = usePlayerCore({
    urls: playlistUrls,
    currentIndex: internalIndex,
    setCurrentIndex: handleInternalIndexChange,
    isPlaying: internalIsPlaying,
    setIsPlaying: setInternalIsPlaying,
    tracks: playlistStations,
  });

  // Add phone call handling
  usePhoneCallHandling(internalIsPlaying, setInternalIsPlaying);

  // Show message if no playlist stations
  if (playlistStations.length === 0) {
    return (
      <PlayerLayout>
        <div className="text-center text-muted-foreground p-4">
          <p>No stations in playlist</p>
          <p className="text-sm mt-1">Add stations to your playlist to start playing</p>
        </div>
      </PlayerLayout>
    );
  }

  // Show message if current selection is not in playlist
  if (playlistIndex < 0) {
    return (
      <PlayerLayout>
        <div className="text-center text-muted-foreground p-4">
          <p>Select a playlist station to start playing</p>
          <p className="text-sm mt-1">Currently selected station is not in your playlist</p>
        </div>
      </PlayerLayout>
    );
  }

  const currentPlaylistStation = playlistStations[internalIndex];

  return (
    <PlayerLayout>
      <PlayerTrackInfo
        title={currentPlaylistStation?.name || `Station ${internalIndex + 1}`}
        url={playlistUrls[internalIndex]}
        loading={loading}
      />
      <PlayerSlider
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        disabled={!duration || duration === Infinity}
      />
      <PlayerControlsRow
        isPlaying={internalIsPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrevious}
        disabled={playlistUrls.length === 0}
      />
      <PlayerVolume
        volume={volume}
        setVolume={setVolume}
      />
    </PlayerLayout>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance
  return (
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.tracks?.length === nextProps.tracks?.length
  );
});

MusicPlayer.displayName = "MusicPlayer";

export default MusicPlayer;
