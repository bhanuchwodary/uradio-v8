
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.streamify',
  appName: 'streamify',
  webDir: 'dist',
  plugins: {
    Media: {
      backgroundColor: "#121212",
      displayMode: "fullscreen"
    }
  }
};

export default config;
