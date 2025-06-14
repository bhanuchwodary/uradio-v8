
import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Track } from "@/types/track";
import { saveVolumePreference, getVolumePreference } from "@/utils/volumeStorage";
import { usePlayerControls } from "@/hooks/music-player/usePlayerControls";
import Hls from "hls.js";

interface PlaylistMusicPlayerProps {
  playlistStations: Track[];
  currentPlaylistIndex: number;
  setCurrentPlaylistIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const PlaylistMusicPlayer: React.FC<PlaylistMusicPlayerProps> = ({
  playlistStations,
  currentPlaylistIndex,
  setCurrentPlaylistIndex,
  isPlaying,
  setIsPlaying
}) => {
  const [volume, setVolume] = useState(getVolumePreference());
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Get playlist URLs for strict navigation
  const playlistUrls = playlistStations.map(station => station.url);

  // Use the player controls hook with strict playlist boundaries
  const { handleNext, handlePrevious, handlePlayPause, handleSeek } = usePlayerControls({
    audioRef,
    isPlaying,
    setIsPlaying,
    urls: playlistUrls,
    currentIndex: currentPlaylistIndex,
    setCurrentIndex: setCurrentPlaylistIndex,
    volume
  });

  // Initialize audio element ONCE
  useEffect(() => {
    if (!audioRef.current) {
      console.log("PlaylistMusicPlayer - Creating single audio element");
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleCanPlay = () => setLoading(false);
    const handleWaiting = () => setLoading(true);
    const handleEnded = () => handleNext();

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [handleNext]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      saveVolumePreference(volume);
    }
  }, [volume]);

  // Handle station changes - ONLY playlist stations
  useEffect(() => {
    if (playlistStations.length === 0 || currentPlaylistIndex < 0 || currentPlaylistIndex >= playlistStations.length) {
      console.log("PlaylistMusicPlayer - No valid playlist station to load");
      return;
    }

    const currentStation = playlistStations[currentPlaylistIndex];
    if (!currentStation || !audioRef.current) {
      return;
    }

    console.log("PlaylistMusicPlayer - Loading PLAYLIST station:", currentStation.name, "at playlist index:", currentPlaylistIndex);
    console.log("PlaylistMusicPlayer - CONFIRMED: Only playing from playlist with", playlistStations.length, "stations");

    const audio = audioRef.current;
    setLoading(true);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if URL is HLS stream
    if (currentStation.url.includes('.m3u8') || Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      
      hls.loadSource(currentStation.url);
      hls.attachMedia(audio);
      hlsRef.current = hls;
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest parsed for playlist station:", currentStation.name);
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        setLoading(false);
      });
    } else {
      // Direct audio stream
      audio.src = currentStation.url;
      audio.load();
    }
  }, [playlistStations, currentPlaylistIndex]);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const getHostnameFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return "Invalid URL";
    }
  };

  // Show message if no playlist stations
  if (playlistStations.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No stations in playlist</p>
          <p className="text-sm mt-1">Add stations to your playlist to start playing</p>
        </div>
      </Card>
    );
  }

  const currentStation = playlistStations[currentPlaylistIndex] || playlistStations[0];

  return (
    <Card className="p-4 bg-surface-container-low border border-outline-variant/30 shadow-xl shadow-black/5 rounded-3xl">
      <div className="flex flex-col space-y-4">
        {/* Station info */}
        <div className="text-center px-2">
          <h2 className="text-xl font-bold truncate leading-tight text-on-surface">
            {currentStation?.name || "Unknown Station"}
          </h2>
          <p className="text-sm text-on-surface-variant truncate mt-1">
            {currentStation?.url ? getHostnameFromUrl(currentStation.url) : "No URL"}
          </p>
          {currentStation?.language && (
            <div className="flex items-center justify-center text-xs mt-2">
              <span className="bg-primary/15 text-primary px-2 py-1 rounded-full">
                {currentStation.language}
              </span>
            </div>
          )}
          {loading && (
            <p className="text-sm text-primary animate-pulse mt-2">Loading...</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Playing from playlist ({currentPlaylistIndex + 1} of {playlistStations.length})
          </p>
        </div>

        {/* Progress slider */}
        <div className="px-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            disabled={!duration || duration === Infinity}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
            <span>
              {duration && duration !== Infinity 
                ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`
                : "Live"
              }
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={playlistStations.length <= 1}
            className="h-14 w-14 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className="h-20 w-20 rounded-full shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-9 w-9" />
            ) : (
              <Play className="h-9 w-9 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={playlistStations.length <= 1}
            className="h-14 w-14 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-3 px-2">
          <Volume2 className="h-5 w-5 text-on-surface-variant flex-shrink-0" />
          <div className="flex-1 py-2">
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
