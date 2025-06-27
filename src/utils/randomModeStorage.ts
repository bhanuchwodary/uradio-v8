
import { logger } from "@/utils/logger";

const RANDOM_MODE_KEY = 'uradio-random-mode';

export const getRandomModePreference = (): boolean => {
  try {
    const stored = localStorage.getItem(RANDOM_MODE_KEY);
    if (stored === null) {
      return false; // Default to sequential mode
    }
    return JSON.parse(stored);
  } catch (error) {
    logger.warn('Failed to load random mode preference', error);
    return false;
  }
};

export const setRandomModePreference = (randomMode: boolean): void => {
  try {
    localStorage.setItem(RANDOM_MODE_KEY, JSON.stringify(randomMode));
    logger.debug('Random mode preference saved:', randomMode);
  } catch (error) {
    logger.error('Failed to save random mode preference', error);
  }
};
