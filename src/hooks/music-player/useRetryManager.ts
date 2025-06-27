
import { useRef } from "react";
import { createRetryHandler } from "@/utils/streamHandler";
import { logger } from "@/utils/logger";

export const useRetryManager = () => {
  const loadRetryHandler = useRef(createRetryHandler(5, 2000)); // 5 retries with 2s base delay
  const playRetryHandler = useRef(createRetryHandler(3, 1000)); // 3 play retries with 1s base delay
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeouts = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const resetRetryHandlers = () => {
    loadRetryHandler.current.reset();
    playRetryHandler.current.reset();
  };

  const setupLoadTimeout = (onTimeout: () => void, loadTimeout: number = 20000) => {
    const delay = loadRetryHandler.current.getDelay();
    loadTimeoutRef.current = setTimeout(() => {
      logger.warn(`Stream loading timeout reached (${delay}ms)`);
      
      if (loadRetryHandler.current.shouldRetry()) {
        loadRetryHandler.current.incrementRetry();
        logger.info(`Retrying stream load (attempt ${loadRetryHandler.current.getRetryCount()}/${5})`);
        onTimeout();
        setupLoadTimeout(onTimeout, loadTimeout); // Setup next timeout
      } else {
        logger.error("Max load retries reached for stream");
      }
    }, Math.min(loadTimeout + delay, 30000)); // Cap at 30 seconds
  };

  return {
    loadRetryHandler,
    playRetryHandler,
    loadTimeoutRef,
    retryTimeoutRef,
    clearTimeouts,
    resetRetryHandlers,
    setupLoadTimeout,
  };
};
