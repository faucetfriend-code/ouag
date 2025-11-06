import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.unityoracle.aggregator',
  appName: 'Unity Oracle Aggregator',
  webDir: 'out',
  plugins: {
    Haptics: {}
  }
};

export default config;
