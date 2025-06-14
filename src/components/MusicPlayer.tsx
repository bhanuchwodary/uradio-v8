// Streamlined MusicPlayer component that uses usePlayerCore for logic.
import React, { memo, useMemo } from "react";
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

// Using React.memo to prevent unnecessary re-renders
const MusicPlayer: React.FC<MusicPlayerProps> = memo(({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  tracks = [],
}) => {
  // COMPLETE ISOLATION: Create playlist-only data that doesn't sync back to main array
  const playlistData = useMemo(() => {
    const playlistTracks = tracks.filter(track => track.inPlaylist === true);
    const playlistUrls = playlistTracks.map(track => track.url);
    
    // Find the current track in the original array
    const currentTrack = tracks[currentIndex];
    
    // Find the index of current track in playlist array (only if it's in playlist)
    let playlistIndex = -1;
    if (currentTrack && currentTrack.inPlaylist) {
      playlistIndex = playlistTracks.findIndex(track => track.url === currentTrack.url);
    }
    
    console.log("MusicPlayer - Playlist isolation:");
    console.log("- Total tracks:", tracks.length);
    console.log("- Playlist tracks:", playlistTracks.length);
    console.log("- Current index in full array:", currentIndex);
    console.log("- Current index in playlist array:", playlistIndex);
    console.log("- Current track is in playlist:", currentTrack?.inPlaylist);
    
    return {
      tracks: playlistTracks,
      urls: playlistUrls,
      currentIndex: playlistIndex
    };
  }, [tracks, currentIndex]);

  // ISOLATED: State management for playlist-only player
  const [internalPlaylistIndex, setInternalPlaylistIndex] = React.useState(playlistData.currentIndex);
  const [internalIsPlaying, setInternalIsPlaying] = React.useState(isPlaying);

  // Update internal state when external playlist selection changes
  React.useEffect(() => {
    if (playlistData.currentIndex >= 0) {
      setInternalPlaylistIndex(playlistData.currentIndex);
      setInternalIsPlaying(isPlaying);
    } else {
      setInternalIsPlaying(false);
    }
  }, [playlistData.currentIndex, isPlaying]);

  // ISOLATED: Handle playlist index changes (no sync back to main array)
  const handlePlaylistIndexChange = (newPlaylistIndex: number) => {
    console.log("MusicPlayer - Internal playlist index change:", newPlaylistIndex);
    setInternalPlaylistIndex(newPlaylistIndex);
    // Do NOT sync back to main array - keep player completely isolated
  };

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
    urls: playlistData.urls,
    currentIndex: internalPlaylistIndex,
    setCurrentIndex: handlePlaylistIndexChange,
    isPlaying: internalIsPlaying,
    setIsPlaying: setInternalIsPlaying,
    tracks: playlistData.tracks,
  });

  // Add phone call handling
  usePhoneCallHandling(internalIsPlaying, setInternalIsPlaying);

  // Show message if no playlist stations or invalid selection
  if (playlistData.tracks.length === 0) {
    return (
      <PlayerLayout>
        <div className="text-center text-muted-foreground p-4">
          <p>No stations in playlist</p>
          <p className="text-sm mt-1">Add stations to your playlist to start playing</p>
        </div>
      </PlayerLayout>
    );
  }

  if (internalPlaylistIndex < 0 || internalPlaylistIndex >= playlistData.tracks.length) {
    return (
      <PlayerLayout>
        <div className="text-center text-muted-foreground p-4">
          <p>Select a playlist station to start playing</p>
        </div>
      </PlayerLayout>
    );
  }

  const currentPlaylistTrack = playlistData.tracks[internalPlaylistIndex];

  return (
    <PlayerLayout>
      <PlayerTrackInfo
        title={currentPlaylistTrack?.name || `Track ${internalPlaylistIndex + 1}`}
        url={playlistData.urls[internalPlaylistIndex]}
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
        disabled={playlistData.urls.length === 0}
      />
      <PlayerVolume
        volume={volume}
        setVolume={setVolume}
      />
    </PlayerLayout>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.urls.length === nextProps.urls.length &&
    (prevProps.tracks?.length || 0) === (nextProps.tracks?.length || 0) &&
    prevProps.urls[prevProps.currentIndex] === nextProps.urls[nextProps.currentIndex]
  );
});

MusicPlayer.displayName = "MusicPlayer";

export default MusicPlayer;
