import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eprocurement.app',
  appName: 'E-Procurement',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: false,      // kita hide manual di AppComponent setelah init selesai
      backgroundColor: '#1a237e',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
