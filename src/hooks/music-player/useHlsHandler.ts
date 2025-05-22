
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { globalAudioRef } from "@/components/music-player/audioInstance";

interface UseHlsHandlerProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  url: string | undefined;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useHlsHandler = ({
  audioRef,
  url,
  isPlaying,
  setIsPlaying,
  setLoading
}: UseHlsHandlerProps) => {
  const hlsRef = useRef<Hls | null>(null);
  const lastUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!audioRef.current || !url) {
      return;
    }

    // Critical fix: Check if we're already playing this URL and don't reload
    if (url === lastUrlRef.current && audioRef.current.src && !audioRef.current.paused === isPlaying) {
      console.log("URL and playback state unchanged, maintaining current playback");
      return;
    }

    // Remember the URL for future reference
    lastUrlRef.current = url;
    
    // Only show loading if we're actually changing the URL
    if (audioRef.current.src !== url) {
      setLoading(true);
    }
    
    // Clean up previous HLS instance if exists and if URL has changed
    if (globalAudioRef.hls && audioRef.current.src !== url) {
      console.log("Destroying previous HLS instance");
      globalAudioRef.hls.destroy();
      globalAudioRef.hls = null;
    }

    // Check if the URL is an HLS stream
    if (url.includes('.m3u8') && Hls.isSupported()) {
      console.log("Loading HLS stream:", url);
      
      // Only create a new HLS instance if needed
      if (!globalAudioRef.hls) {
        const hls = new Hls({
          enableWorker: false, // Disable web workers to prevent CORS issues
          // AUDIO QUALITY ENHANCEMENTS
          maxBufferLength: 60, // Increase buffer length for smoother playback (from 30 to 60)
          maxMaxBufferLength: 90, // Maximum buffer size (from 60 to 90)
          maxBufferSize: 100 * 1000 * 1000, // 100MB buffer size (from 60MB to 100MB)
          maxBufferHole: 0.3, // Maximum buffer holes (from 0.5 to 0.3 - smaller for more precise buffering)
          highBufferWatchdogPeriod: 5, // Check buffer more frequently (added for better quality monitoring)
          // Quality selection - select highest quality audio
          startLevel: -1, // Auto select based on bandwidth
          capLevelToPlayerSize: false, // Don't limit quality
          autoStartLoad: true, // Auto start loading
          abrEwmaDefaultEstimate: 1000000, // Higher bandwidth estimate for better initial quality (doubled)
          // Error recovery improvements
          maxLoadingDelay: 4, // Allow more time for loading
          fragLoadingMaxRetry: 8, // More retries for fragment loading (increased from 6 to 8)
          manifestLoadingMaxRetry: 8, // More retries for manifest loading (increased from 6 to 8)
          levelLoadingMaxRetry: 8, // More retries for level loading (increased from 6 to 8)
          // Audio specific improvements
          audioStreamController: {
            // @ts-ignore - These are valid HLS.js options but TypeScript doesn't know about them
            audioTrackSwitchSmoothOffset: 0.05 // Smoother audio track switching
          }
        });
        
        hls.attachMedia(audioRef.current);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(url);
        });
        
        // Set audio element properties for better quality
        if (audioRef.current) {
          audioRef.current.preload = "auto"; // Preload audio data
          
          // AUDIO QUALITY ENHANCEMENT: Add high-quality playback settings
          try {
            // Setting best audio quality options
            audioRef.current.preservesPitch = false; // Better audio fidelity during rate changes
            audioRef.current.mozPreservesPitch = false; // Firefox specific
            audioRef.current.webkitPreservesPitch = false; // Safari specific
          } catch (e) {
            console.log("Advanced audio properties not supported by this browser");
          }
          
          // Set audio sample rate to high quality if possible
          try {
            // @ts-ignore - Non-standard but useful in some browsers
            if (audioRef.current.mozSampleRate) {
              // @ts-ignore - Firefox specific
              audioRef.current.mozSampleRate = 48000; // High quality sample rate
            }
          } catch (e) {
            // Silently fail if not supported
          }
        }
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log("HLS manifest loaded with levels:", data.levels?.length || 0);
          
          // AUDIO QUALITY ENHANCEMENT: Improved level selection logic
          if (data.levels && data.levels.length > 0) {
            // First look for pure audio levels (no video)
            const audioLevels = data.levels.filter(level => !level.videoCodec);
            
            if (audioLevels.length > 0) {
              // Find the highest quality audio stream
              const bestLevel = audioLevels.reduce((prev, current) => 
                (prev.bitrate > current.bitrate) ? prev : current);
                
              const bestLevelIdx = data.levels.indexOf(bestLevel);
              console.log(`Selecting best audio quality level: ${bestLevel.bitrate} bps (index: ${bestLevelIdx})`);
              hls.currentLevel = bestLevelIdx;
              
              // Lock to this level for consistent quality
              hls.autoLevelEnabled = false;
              hls.loadLevel = bestLevelIdx;
            } else if (data.audioTracks && data.audioTracks.length > 0) {
              // If no pure audio levels, look for best audio track
              const bestAudioTrack = data.audioTracks.reduce((prev, current) => 
                (prev.bitrate > current.bitrate) ? prev : current, data.audioTracks[0]);
                
              console.log(`Selecting best audio track: ${bestAudioTrack.bitrate} bps`);
              hls.audioTrack = data.audioTracks.indexOf(bestAudioTrack);
            }
          }
          
          setLoading(false);
          if (isPlaying) {
            audioRef.current?.play().catch(error => {
              console.error("Error playing HLS stream:", error);
              setIsPlaying(false);
            });
          }
        });
        
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log(`HLS quality level switched to: ${data.level}`);
        });
        
        // AUDIO QUALITY ENHANCEMENT: Add audio track switched event
        hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
          console.log(`HLS audio track switched to: ${data.id}`);
        });
        
        // PERFORMANCE IMPROVEMENT: Better error handling
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn("HLS error:", data.type, data.details);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Network error, attempting to recover");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Media error, attempting to recover");
                hls.recoverMediaError();
                break;
              default:
                console.error("Unrecoverable HLS error");
                setIsPlaying(false);
                setLoading(false);
                
                // Try one more recovery after a short delay
                setTimeout(() => {
                  console.log("Attempting final recovery of stream");
                  if (globalAudioRef.hls) {
                    globalAudioRef.hls.destroy();
                    globalAudioRef.hls = null;
                    // Force restart the stream after a short delay
                    if (audioRef.current) {
                      audioRef.current.src = url;
                      audioRef.current.load();
                    }
                  }
                }, 2000);
                break;
            }
          }
        });
        
        globalAudioRef.hls = hls;
      } else if (globalAudioRef.hls) {
        // Just load the new source directly
        globalAudioRef.hls.loadSource(url);
      }
    } else if (audioRef.current.src !== url) {
      // Regular audio stream
      console.log("Loading regular audio stream:", url);
      audioRef.current.src = url;
      audioRef.current.load();
      
      // AUDIO QUALITY ENHANCEMENT: Better audio settings for regular streams
      try {
        // Set audio quality attributes
        audioRef.current.autoplay = false; // Let us control playback
        audioRef.current.preload = "auto"; // Preload audio
        
        // Set audio processing mode to high quality if available
        if ('audioProcessing' in audioRef.current) {
          // @ts-ignore - This is a non-standard property
          audioRef.current.audioProcessing = 'highquality';
        }
        
        // Try to enable high quality mode using various browser-specific methods
        if ('webkitAudioDecodedByteCount' in audioRef.current) {
          // This forces some browsers to use higher quality decoding
          audioRef.current.volume = 0.99;
          setTimeout(() => {
            if (audioRef.current) audioRef.current.volume = 1.0;
          }, 10);
        }
      } catch (e) {
        console.log("Some audio enhancements not supported by this browser");
      }
      
      // PERFORMANCE IMPROVEMENT: Better error handling for regular streams
      audioRef.current.onerror = (e) => {
        console.error("Audio stream error:", e);
        setLoading(false);
        setIsPlaying(false);
        
        // Try to recover by reloading the stream
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
          }
        }, 2000);
      };
      
      // Wait for canplay event to clear loading
      audioRef.current.oncanplay = () => {
        setLoading(false);
        if (isPlaying) {
          audioRef.current?.play().catch(error => {
            console.error("Error playing audio stream:", error);
            setIsPlaying(false);
          });
        }
      };
    } else {
      // URL is the same, just sync playback state
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error resuming audio stream:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
      setLoading(false);
    }

    return () => {
      // Don't destroy HLS instance on component unmount to maintain playback
      // The global HLS instance will be cleaned up when we load a new URL
    };
  }, [url, isPlaying, audioRef, setIsPlaying, setLoading]);

  return { hlsRef };
};
