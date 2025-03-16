
import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Hls from "hls.js";

interface MusicPlayerProps {
  urls: string[];
  tracks?: Array<{ name: string; url: string; isFavorite: boolean }>;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  getAudioElement?: () => HTMLAudioElement | null;
  updateTrackProgress?: (duration: number, position: number) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  urls,
  tracks,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  getAudioElement,
  updateTrackProgress,
}) => {
  const hlsRef = useRef<Hls | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks && tracks[currentIndex];
  const trackName = currentTrack ? currentTrack.name : `Track ${currentIndex + 1}`;
  const trackUrl = urls[currentIndex] || '';

  // Use the shared audio element if provided, otherwise use the local ref
  useEffect(() => {
    const audio = getAudioElement ? getAudioElement() : null;
    
    // Only create a new audio element if one doesn't already exist
    if (!audio && !audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const currentAudio = audio || audioRef.current;
    if (!currentAudio) return;
    
    currentAudio.volume = volume;
    
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', handlePrevious);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackName,
        artist: 'Streamify Jukebox',
        album: trackUrl.startsWith('file:') || trackUrl.startsWith('blob:') ? 'Local Files' : 'My Stations',
      });
    }
    
    const handleTimeUpdate = () => {
      setCurrentTime(currentAudio.currentTime);
      if (updateTrackProgress) {
        updateTrackProgress(currentAudio.duration || 0, currentAudio.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(currentAudio.duration);
      setLoading(false);
      if (updateTrackProgress) {
        updateTrackProgress(currentAudio.duration || 0, currentAudio.currentTime);
      }
    };
    
    const handleEnded = () => {
      handleNext();
    };

    const handleCanPlay = () => {
      setLoading(false);
    };
    
    currentAudio.addEventListener("timeupdate", handleTimeUpdate);
    currentAudio.addEventListener("loadedmetadata", handleLoadedMetadata);
    currentAudio.addEventListener("ended", handleEnded);
    currentAudio.addEventListener("canplay", handleCanPlay);
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Only remove listeners, don't destroy the audio element
      currentAudio.removeEventListener("timeupdate", handleTimeUpdate);
      currentAudio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      currentAudio.removeEventListener("ended", handleEnded);
      currentAudio.removeEventListener("canplay", handleCanPlay);
    };
  }, [trackName, trackUrl, volume, updateTrackProgress]);

  const loadMedia = (url: string) => {
    const audio = getAudioElement ? getAudioElement() : audioRef.current;
    if (!audio) return;
    
    setLoading(true);
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    const isHLS = url.includes('.m3u8');
    const isLocalFile = url.startsWith('file:') || url.startsWith('blob:');
    
    if (isHLS && Hls.isSupported() && !isLocalFile) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.loadSource(url);
      hls.attachMedia(audio);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          audio.play().catch(error => {
            console.error("Error playing HLS stream:", error);
            toast({
              title: "Playback Error",
              description: "Could not play this stream. Please try another URL.",
              variant: "destructive",
            });
            setIsPlaying(false);
            setLoading(false);
          });
        }
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("HLS fatal error:", data);
          toast({
            title: "Stream Error",
            description: "Error loading the stream. Please try another URL.",
            variant: "destructive",
          });
          setIsPlaying(false);
          setLoading(false);
          hls.destroy();
        }
      });
      
      hlsRef.current = hls;
    } else {
      audio.src = url;
      if (isPlaying) {
        audio.play().catch(error => {
          console.error("Error playing audio:", error);
          toast({
            title: "Playback Error",
            description: "Could not play this track. Please try another URL.",
            variant: "destructive",
          });
          setIsPlaying(false);
          setLoading(false);
        });
      }
    }
  };

  useEffect(() => {
    if (urls.length > 0 && currentIndex >= 0 && currentIndex < urls.length) {
      loadMedia(urls[currentIndex]);
      
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: trackName,
          artist: 'Streamify Jukebox',
          album: trackUrl.startsWith('file:') || trackUrl.startsWith('blob:') ? 'Local Files' : 'My Stations',
        });
      }
    }
  }, [currentIndex, urls, trackName]);

  useEffect(() => {
    const audio = getAudioElement ? getAudioElement() : audioRef.current;
    if (audio) {
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            setLoading(false);
          });
        }
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, getAudioElement]);

  useEffect(() => {
    const audio = getAudioElement ? getAudioElement() : audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume, getAudioElement]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (urls.length > 0) {
      setCurrentIndex((currentIndex + 1) % urls.length);
    }
  };

  const handlePrevious = () => {
    if (urls.length > 0) {
      setCurrentIndex((currentIndex - 1 + urls.length) % urls.length);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = getAudioElement ? getAudioElement() : audioRef.current;
    if (audio && !isNaN(value[0])) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-white/20 border-none shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h3 className="font-bold text-lg truncate">
              {trackName}
            </h3>
            {trackUrl && (
              <p className="text-xs text-gray-500 truncate">
                {(() => {
                  try {
                    return trackUrl.startsWith('file:') || trackUrl.startsWith('blob:')
                      ? 'Local File' 
                      : (new URL(trackUrl)).hostname;
                  } catch (error) {
                    return trackUrl;
                  }
                })()}
              </p>
            )}
            {loading && (
              <p className="text-xs text-blue-400 animate-pulse mt-1">Loading stream...</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime || 0]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
              disabled={!duration || duration === Infinity}
            />
            <span className="text-xs">{duration ? formatTime(duration) : "∞"}</span>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={urls.length === 0}
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-primary text-primary-foreground"
              onClick={handlePlayPause}
              disabled={urls.length === 0}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={urls.length === 0}
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <Slider 
              value={[volume * 100]} 
              max={100}
              step={1}
              onValueChange={(values) => setVolume(values[0] / 100)}
              className="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicPlayer;
