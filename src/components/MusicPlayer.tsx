
// Streamlined MusicPlayer component that uses usePlayerCore for logic.
import React, { memo, useMemo } from "react";
import PlayerLayout from "@/components/music-player/PlayerLayout";
import PlayerTrackInfo from "@/components/music-player/PlayerTrackInfo";
import PlayerSlider from "@/components/music-player/PlayerSlider";
import PlayerControlsRow from "@/components/music-player/PlayerControlsRow";
import PlayerVolume from "@/components/music-player/PlayerVolume";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { usePhoneCallHandling } from "@/hooks/usePhoneCallHandling";

interface MusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  tracks?: { name: string; url: string; inPlaylist?: boolean }[];
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
  // CRITICAL FIX: Filter to only playlist stations
  const playlistData = useMemo(() => {
    const playlistTracks = tracks.filter(track => track.inPlaylist === true);
    const playlistUrls = playlistTracks.map(track => track.url);
    
    // Find the current track in the original array
    const currentTrack = tracks[currentIndex];
    
    // Find the index of current track in playlist array
    let playlistIndex = -1;
    if (currentTrack && currentTrack.inPlaylist) {
      playlistIndex = playlistTracks.findIndex(track => track.url === currentTrack.url);
    }
    
    console.log("MusicPlayer - Playlist filtering:");
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

  // Custom setCurrentIndex that maps playlist index back to full array index
  const handleSetCurrentIndex = (playlistIndex: number) => {
    if (playlistIndex >= 0 && playlistIndex < playlistData.tracks.length) {
      const selectedPlaylistTrack = playlistData.tracks[playlistIndex];
      // Find this track in the original full array
      const fullArrayIndex = tracks.findIndex(track => track.url === selectedPlaylistTrack.url);
      console.log("MusicPlayer - Index mapping:", playlistIndex, "->", fullArrayIndex);
      setCurrentIndex(fullArrayIndex);
    } else {
      console.log("MusicPlayer - Invalid playlist index:", playlistIndex);
      setCurrentIndex(-1);
    }
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
    currentIndex: playlistData.currentIndex,
    setCurrentIndex: handleSetCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks: playlistData.tracks,
  });

  // Add phone call handling
  usePhoneCallHandling(isPlaying, setIsPlaying);

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

  if (playlistData.currentIndex < 0) {
    return (
      <PlayerLayout>
        <div className="text-center text-muted-foreground p-4">
          <p>Select a playlist station to start playing</p>
        </div>
      </PlayerLayout>
    );
  }

  const currentPlaylistTrack = playlistData.tracks[playlistData.currentIndex];

  return (
    <PlayerLayout>
      <PlayerTrackInfo
        title={currentPlaylistTrack?.name || `Track ${playlistData.currentIndex + 1}`}
        url={playlistData.urls[playlistData.currentIndex]}
        loading={loading}
      />
      <PlayerSlider
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        disabled={!duration || duration === Infinity}
      />
      <PlayerControlsRow
        isPlaying={isPlaying}
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

MusicPlayer.displayName = "MusicPlayer"; // For better React DevTools debugging

export default MusicPlayer;
