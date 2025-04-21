
// Refactored MusicPlayer to use subcomponents and audioInstance util.
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Hls from "hls.js";
import TrackInfo from "@/components/music-player/TrackInfo";
import SliderWithLabels from "@/components/music-player/SliderWithLabels";
import PlayerControls from "@/components/music-player/PlayerControls";
import VolumeControl from "@/components/music-player/VolumeControl";
import { globalAudioRef } from "@/components/music-player/audioInstance";

interface MusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  tracks?: { name: string; url: string }[];
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  tracks = [],
}) => {
  const playerInstanceRef = useRef(Symbol("player-instance"));
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && isPlaying &&
      globalAudioRef.activePlayerInstance === playerInstanceRef &&
      globalAudioRef.element && globalAudioRef.element.paused) {
      globalAudioRef.element.play().catch(err => console.warn('Resume error:', err));
    }
  };

  useEffect(() => {
    if (!globalAudioRef.activePlayerInstance) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
    return () => {};
  }, []);

  useEffect(() => {
    if (!globalAudioRef.element) {
      const audio = new Audio();
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      audio.setAttribute('preload', 'auto');
      if ('mozAudioChannelType' in audio) (audio as any).mozAudioChannelType = 'content';
      audio.volume = volume;
      globalAudioRef.element = audio;
    }
    const audio = globalAudioRef.element;
    const handleTimeUpdate = () => {
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        setDuration(audio.duration);
        setLoading(false);
      }
    };
    const handleEnded = () => {
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        handleNext();
      }
    };
    const handleCanPlay = () => {
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        setLoading(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("pause", (e) => {
      if (isPlaying && !document.hasFocus() &&
        globalAudioRef.activePlayerInstance === playerInstanceRef) {
        audio.play().catch(err => console.warn('Resume error:', err));
      }
    });
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [isPlaying, volume]);

  useEffect(() => {
    if (isPlaying) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
  }, [isPlaying]);

  useEffect(() => {
    if (globalAudioRef.activePlayerInstance === playerInstanceRef && globalAudioRef.element) {
      setCurrentTime(globalAudioRef.element.currentTime);
      setDuration(globalAudioRef.element.duration || 0);
      setVolume(globalAudioRef.element.volume);
    }
  }, []);

  const loadMedia = (url: string) => {
    if (!globalAudioRef.element) return;
    setLoading(true);
    globalAudioRef.activePlayerInstance = playerInstanceRef;
    if (globalAudioRef.hls) {
      globalAudioRef.hls.destroy();
      globalAudioRef.hls = null;
    }
    const isHLS = url.includes('.m3u8');
    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
      });
      hls.loadSource(url);
      hls.attachMedia(globalAudioRef.element);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying && globalAudioRef.activePlayerInstance === playerInstanceRef) {
          globalAudioRef.element?.play().catch(error => {
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
        if (data.fatal && globalAudioRef.activePlayerInstance === playerInstanceRef) {
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
      globalAudioRef.hls = hls;
    } else {
      globalAudioRef.element.src = url;
      if (isPlaying && globalAudioRef.activePlayerInstance === playerInstanceRef) {
        globalAudioRef.element.play().catch(error => {
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
    if (urls.length > 0 && currentIndex >= 0 && currentIndex < urls.length &&
      (isPlaying || globalAudioRef.activePlayerInstance === playerInstanceRef)) {
      loadMedia(urls[currentIndex]);
    }
  }, [currentIndex, urls, isPlaying]);

  useEffect(() => {
    if (globalAudioRef.element && globalAudioRef.activePlayerInstance === playerInstanceRef) {
      if (isPlaying) {
        const playPromise = globalAudioRef.element.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            setLoading(false);
            if (typeof document !== 'undefined' && 'ontouchstart' in document.documentElement) {
              toast({
                title: "Audio Playback",
                description: "Tap the play button again to start playback",
                variant: "default",
              });
            }
          });
        }
      } else {
        globalAudioRef.element.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (globalAudioRef.element && globalAudioRef.activePlayerInstance === playerInstanceRef) {
      globalAudioRef.element.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (urls.length > 0) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
      setCurrentIndex((currentIndex + 1) % urls.length);
    }
  };

  const handlePrevious = () => {
    if (urls.length > 0) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
      setCurrentIndex((currentIndex - 1 + urls.length) % urls.length);
    }
  };

  const handleSeek = (value: number[]) => {
    if (globalAudioRef.element && !isNaN(value[0]) &&
      globalAudioRef.activePlayerInstance === playerInstanceRef) {
      globalAudioRef.element.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  useEffect(() => {
    if (globalAudioRef.activePlayerInstance === playerInstanceRef && globalAudioRef.element) {
      setCurrentTime(globalAudioRef.element.currentTime);
      setDuration(globalAudioRef.element.duration);
    }
  }, [globalAudioRef.activePlayerInstance === playerInstanceRef]);

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-md bg-white/20 border-none shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <TrackInfo
            title={tracks[currentIndex]?.name || `Track ${currentIndex + 1}`}
            url={urls[currentIndex]}
            loading={loading}
          />
          <SliderWithLabels
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            disabled={!duration || duration === Infinity}
          />
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrev={handlePrevious}
            disabled={urls.length === 0}
          />
          <VolumeControl
            volume={volume}
            setVolume={setVolume}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicPlayer;
