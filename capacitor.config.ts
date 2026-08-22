import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.propertyx.app',
  appName: 'Property X AI',
  webDir: 'out',
  server: {
    // If you want the APK to load the live deployed cloud app:
    url: 'https://property-x-frontend.onrender.com',
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
