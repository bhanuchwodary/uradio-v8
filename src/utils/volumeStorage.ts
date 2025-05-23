
// Utility functions to store and retrieve volume preferences

const VOLUME_STORAGE_KEY = 'streamify-volume-preference';

export const saveVolumePreference = (volume: number): void => {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
    console.log('Volume preference saved:', volume);
  } catch (error) {
    console.error('Failed to save volume preference:', error);
  }
};

export const getVolumePreference = (): number => {
  try {
    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (savedVolume !== null) {
      const parsedVolume = parseFloat(savedVolume);
      console.log('Volume preference loaded:', parsedVolume);
      return parsedVolume;
    }
    return 0.7; // Default volume if not found
  } catch (error) {
    console.error('Failed to load volume preference:', error);
    return 0.7; // Default volume if error
  }
};
