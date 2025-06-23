// src/context/AudioPlayerContext.tsx
// ... (imports and context definition remain the same)

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ 
  children, 
  tracks,
  randomMode: initialRandomMode 
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // This is the source of truth for UI state
  const [randomMode, setRandomMode] = useState(initialRandomMode);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null); // This ref will be assigned globalAudioRef.element

  // Use the global audio ref directly from the instance
  useEffect(() => {
    audioRef.current = globalAudioRef.element;
  }, []);

  // Core player logic
  const { 
    playTrack: corePlayTrack, 
    pausePlayback: corePausePlayback,
    resumePlayback: coreResumePlayback,
    togglePlayPause: coreTogglePlayPause,
    nextTrack: coreNextTrack,
    previousTrack: corePreviousTrack,
    setVolume,
    volume,
    currentTime,
    duration
  } = usePlayerCore({
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    loading,
    setLoading,
    audioRef, // Pass audioRef to usePlayerCore
    tracks,
    randomMode,
    setRandomMode
  });

  // Use the HLS handler, passing the currentTrack's URL and isPlaying state
  useHlsHandler({
    url: currentTrack?.url,
    isPlaying,
    setIsPlaying,
    setLoading,
  });

  // Other context functions...
  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    // Let useHlsHandler handle the actual play command when currentTrack changes
    setIsPlaying(true); // Desired state is playing
    logger.debug("playTrack called. Setting isPlaying to true.");
  }, [setIsPlaying]);

  const pausePlayback = useCallback(() => {
    corePausePlayback(); // This will set isPlaying to false
    logger.debug("pausePlayback called. Setting isPlaying to false.");
  }, [corePausePlayback]);

  const resumePlayback = useCallback(() => {
    coreResumePlayback(); // This will set isPlaying to true
    logger.debug("resumePlayback called. Setting isPlaying to true.");
  }, [coreResumePlayback]);

  const togglePlayPause = useCallback(() => {
    coreTogglePlayPause(); // This will toggle isPlaying
    logger.debug("togglePlayPause called.");
  }, [coreTogglePlayPause]);

  // ... rest of the context provider
}
