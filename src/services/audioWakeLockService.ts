// This service manages audio wake lock to keep playback running in the background

class AudioWakeLockService {
  private wakeLock: any = null;
  
  async requestWakeLock() {
    try {
      // Check if the Wake Lock API is supported
      if ('wakeLock' in navigator) {
        // Request a screen wake lock
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        
        console.log('Audio Wake Lock is active');
        
        // Listen for wake lock release
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake Lock was released');
        });
      } else {
        console.warn('Wake Lock API not supported in this browser');
      }
    } catch (err) {
      console.error(`Failed to request Wake Lock: ${err}`);
    }
  }
  
  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release()
        .then(() => {
          this.wakeLock = null;
          console.log('Wake Lock released');
        })
        .catch((err: Error) => {
          console.error(`Failed to release Wake Lock: ${err}`);
        });
    }
  }
}

export default new AudioWakeLockService();
