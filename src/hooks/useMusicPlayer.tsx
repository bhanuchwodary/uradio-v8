import { useState, useEffect, useCallback, useRef } from "react";
import { Track } from "@/types/track";
import { Howl } from 'howler';

import { supabaseStationsService } from "@/services/supabaseStationsService";

export const useMusicPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sound, setSound] = useState<Howl | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const prevVolume = useRef(volume);

  // Track analytics when song starts playing
  const trackStationPlay = useCallback(async (track: Track) => {
    if (track?.isPrebuilt && track.url) {
      try {
        await supabaseStationsService.trackStationPlay(track.url, 0);
      } catch (error) {
        console.error("Failed to track station play:", error);
      }
    }
  }, []);

  // Update play time analytics periodically
  const trackPlayTime = useCallback(async (track: Track, playTime: number) => {
    if (track?.isPrebuilt && track.url && playTime > 0) {
      try {
        await supabaseStationsService.trackStationPlay(track.url, playTime);
      } catch (error) {
        console.error("Failed to track play time:", error);
      }
    }
  }, []);

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= tracks.length) return;

    const track = tracks[index];
    console.log("Playing track:", track.name);

    // Track analytics for prebuilt stations
    trackStationPlay(track);

    // Stop any currently playing sound
    if (sound) {
      sound.stop();
      sound.unload();
    }

    // Create and play the new sound
    const newSound = new Howl({
      src: [track.url],
      html5: true,
      volume: volume,
      onplay: () => {
        setIsPlaying(true);
        setCurrentTrack(track);
        console.log("Playing:", track.name);
      },
      onend: () => {
        console.log("Track ended:", track.name);
        // Play the next track if available
        if (index < tracks.length - 1) {
          playTrack(index + 1);
        } else {
          // If it's the last track, stop playing
          setIsPlaying(false);
          setCurrentIndex(0);
          setCurrentTrack(null);
        }
      },
      onloaderror: () => {
        console.error("Failed to load:", track.name);
        // Handle the error, possibly by playing the next track
        if (index < tracks.length - 1) {
          playTrack(index + 1);
        } else {
          setIsPlaying(false);
          setCurrentIndex(0);
          setCurrentTrack(null);
        }
      }
    });

    setSound(newSound);
    setCurrentIndex(index);
    newSound.play();
  }, [tracks, volume, trackStationPlay]);

  const togglePlayPause = useCallback(() => {
    if (!sound) return;

    if (isPlaying) {
      sound.pause();
      setIsPlaying(false);
      console.log("Paused:", tracks[currentIndex].name);
    } else {
      sound.play();
      setIsPlaying(true);
      console.log("Resumed:", tracks[currentIndex].name);
    }
  }, [isPlaying, sound, tracks, currentIndex]);

  const playPrevious = useCallback(() => {
    playTrack((currentIndex - 1 + tracks.length) % tracks.length);
  }, [currentIndex, tracks, playTrack]);

  const playNext = useCallback(() => {
    playTrack((currentIndex + 1) % tracks.length);
  }, [currentIndex, tracks, playTrack]);

  const adjustVolume = useCallback((newVolume: number) => {
    if (newVolume < 0) newVolume = 0;
    if (newVolume > 1) newVolume = 1;

    setVolume(newVolume);
    if (sound) {
      sound.volume(newVolume);
    }
  }, [sound]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      // Unmute: Restore volume to the previous value
      adjustVolume(prevVolume.current);
      setIsMuted(false);
    } else {
      // Mute: Store current volume and set volume to 0
      prevVolume.current = volume;
      adjustVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, adjustVolume]);

  // Add periodic tracking of play time (every 30 seconds)
  useEffect(() => {
    if (isPlaying && currentTrack) {
      const interval = setInterval(() => {
        trackPlayTime(currentTrack, 30); // Track 30 seconds of play time
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTrack, trackPlayTime]);

  return {
    tracks,
    setTracks,
    currentIndex,
    isPlaying,
    playTrack,
    togglePlayPause,
    playPrevious,
    playNext,
    volume,
    adjustVolume,
    isMuted,
    toggleMute,
    currentTrack
  };
};
