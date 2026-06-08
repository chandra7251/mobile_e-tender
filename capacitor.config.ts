import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vandrafcy.zeta',
  appName: 'ZETA',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,       // auto-hide agar app tidak crash jika Angular lambat bootstrap
      backgroundColor: '#1a237e',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
