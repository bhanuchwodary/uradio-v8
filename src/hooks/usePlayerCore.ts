import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { globalAudioRef } from "@/components/music-player/audioInstance";
import { useToast } from "@/hooks/use-toast";

/** For code splitting: expect url, tracklist, track index, player active state, set/state handlers, etc */
export function usePlayerCore({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
}) {
  const playerInstanceRef = useRef(Symbol("player-instance"));
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Visibility handler
  const handleVisibilityChange = useCallback(() => {
    if (
      document.visibilityState === "visible" &&
      isPlaying &&
      globalAudioRef.activePlayerInstance === playerInstanceRef &&
      globalAudioRef.element &&
      globalAudioRef.element.paused
    ) {
      globalAudioRef.element.play().catch((err) =>
        console.warn("Resume error:", err)
      );
    }
  }, [isPlaying]);

  // One-time initialize audio instance
  useEffect(() => {
    if (!globalAudioRef.activePlayerInstance) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
  }, []);

  // Sound instance/setup + add/remove all event listeners
  useEffect(() => {
    if (!globalAudioRef.element) {
      const audio = new window.Audio();
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
  }, [isPlaying, volume, handleVisibilityChange]);

  // Lock instance on play
  useEffect(() => {
    if (isPlaying) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
  }, [isPlaying]);

  // Sync-initialize state from global audio instance
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

  // Load a stream or track
  const loadMedia = useCallback(
    (url: string) => {
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
            globalAudioRef.element?.play().catch((error) => {
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
        if (
          isPlaying &&
          globalAudioRef.activePlayerInstance === playerInstanceRef
        ) {
          globalAudioRef.element.play().catch((error) => {
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
    },
    [isPlaying, setIsPlaying, toast]
  );

  // Reload on index or url change
  useEffect(() => {
    if (
      urls.length > 0 &&
      currentIndex >= 0 &&
      currentIndex < urls.length &&
      (isPlaying || globalAudioRef.activePlayerInstance === playerInstanceRef)
    ) {
      loadMedia(urls[currentIndex]);
    }
  }, [currentIndex, urls, isPlaying, loadMedia, playerInstanceRef]);

  // Automatic play/pause
  useEffect(() => {
    if (
      globalAudioRef.element &&
      globalAudioRef.activePlayerInstance === playerInstanceRef
    ) {
      if (isPlaying) {
        const playPromise = globalAudioRef.element.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            setLoading(false);
            if (
              typeof document !== "undefined" &&
              "ontouchstart" in document.documentElement
            ) {
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
  }, [isPlaying, setIsPlaying, toast, playerInstanceRef]);

  // Keep volume in sync
  useEffect(() => {
    if (
      globalAudioRef.element &&
      globalAudioRef.activePlayerInstance === playerInstanceRef
    ) {
      globalAudioRef.element.volume = volume;
    }
  }, [volume]);

  // UI Handlers
  const handlePlayPause = useCallback(() => {
    if (!isPlaying) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleNext = useCallback(() => {
    if (urls.length > 0) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
      setCurrentIndex((currentIndex + 1) % urls.length);
    }
  }, [setCurrentIndex, currentIndex, urls, playerInstanceRef]);

  const handlePrevious = useCallback(() => {
    if (urls.length > 0) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
      setCurrentIndex((currentIndex - 1 + urls.length) % urls.length);
    }
  }, [setCurrentIndex, currentIndex, urls, playerInstanceRef]);

  const handleSeek = useCallback(
    (value: number[]) => {
      if (
        globalAudioRef.element &&
        !isNaN(value[0]) &&
        globalAudioRef.activePlayerInstance === playerInstanceRef
      ) {
        globalAudioRef.element.currentTime = value[0];
        setCurrentTime(value[0]);
      }
    },
    [playerInstanceRef]
  );

  // Keep state in sync
  useEffect(() => {
    if (
      globalAudioRef.activePlayerInstance === playerInstanceRef &&
      globalAudioRef.element
    ) {
      setCurrentTime(globalAudioRef.element.currentTime);
      setDuration(globalAudioRef.element.duration);
    }
  }, [globalAudioRef.activePlayerInstance === playerInstanceRef]);

  return {
    duration,
    currentTime,
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    playerInstanceRef,
  };
}
