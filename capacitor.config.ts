
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.streamify.jukebox',
  appName: 'Streamify Jukebox',
  webDir: 'dist',
  server: {
    url: 'https://ef95c806-4d6e-446d-9829-24f650a152ff.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      signingType: 'apksigner',
    },
  }
};

export default config;
