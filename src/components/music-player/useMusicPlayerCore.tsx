
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useToast } from "@/hooks/use-toast";
import { globalAudioRef } from "./audioInstance";

export function useMusicPlayerCore({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying
}: {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (n: number) => void;
  isPlaying: boolean;
  setIsPlaying: (b: boolean) => void;
}) {
  const playerInstanceRef = useRef(Symbol("player-instance"));
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVisibilityChange = () => {
    if (
      document.visibilityState === "visible" &&
      isPlaying &&
      globalAudioRef.activePlayerInstance === playerInstanceRef &&
      globalAudioRef.element &&
      globalAudioRef.element.paused
    ) {
      globalAudioRef.element.play().catch((err) => console.warn("Resume error:", err));
    }
  };

  useEffect(() => {
    if (!globalAudioRef.activePlayerInstance) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
  }, []);

  useEffect(() => {
    if (!globalAudioRef.element) {
      const audio = new Audio();
      audio.setAttribute("playsinline", "");
      audio.setAttribute("webkit-playsinline", "");
      audio.setAttribute("preload", "auto");
      if ("mozAudioChannelType" in audio) (audio as any).mozAudioChannelType = "content";
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
    document.addEventListener("visibilitychange", handleVisibilityChange);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("pause", (e) => {
      if (
        isPlaying &&
        !document.hasFocus() &&
        globalAudioRef.activePlayerInstance === playerInstanceRef
      ) {
        audio.play().catch((err) => console.warn("Resume error:", err));
      }
    });
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
    };
    // eslint-disable-next-line
  }, [isPlaying, volume]);

  useEffect(() => {
    if (isPlaying) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
  }, [isPlaying]);

  useEffect(() => {
    if (
      globalAudioRef.activePlayerInstance === playerInstanceRef &&
      globalAudioRef.element
    ) {
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
    const isHLS = url.includes(".m3u8");
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
        if (
          isPlaying &&
          globalAudioRef.activePlayerInstance === playerInstanceRef
        ) {
          globalAudioRef.element
            ?.play()
            .catch((error) => {
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
        globalAudioRef.element.play().catch((error) => {
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
    if (
      urls.length > 0 &&
      currentIndex >= 0 &&
      currentIndex < urls.length &&
      (isPlaying || globalAudioRef.activePlayerInstance === playerInstanceRef)
    ) {
      loadMedia(urls[currentIndex]);
    }
    // eslint-disable-next-line
  }, [currentIndex, urls, isPlaying]);

  useEffect(() => {
    if (globalAudioRef.element && globalAudioRef.activePlayerInstance === playerInstanceRef) {
      if (isPlaying) {
        const playPromise = globalAudioRef.element.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            setIsPlaying(false);
            setLoading(false);
            if (typeof document !== "undefined" && "ontouchstart" in document.documentElement) {
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
    // eslint-disable-next-line
  }, [isPlaying]);

  useEffect(() => {
    if (
      globalAudioRef.element &&
      globalAudioRef.activePlayerInstance === playerInstanceRef
    ) {
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
    if (
      globalAudioRef.element &&
      !isNaN(value[0]) &&
      globalAudioRef.activePlayerInstance === playerInstanceRef
    ) {
      globalAudioRef.element.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  useEffect(() => {
    if (
      globalAudioRef.activePlayerInstance === playerInstanceRef &&
      globalAudioRef.element
    ) {
      setCurrentTime(globalAudioRef.element.currentTime);
      setDuration(globalAudioRef.element.duration);
    }
    // eslint-disable-next-line
  }, [globalAudioRef.activePlayerInstance === playerInstanceRef]);

  return {
    duration,
    currentTime,
    volume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    setVolume,
    setCurrentTime,
  };
}
