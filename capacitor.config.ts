import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vinay.onthebeat',
  appName: 'Vinay On The Beat',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#050505',
      showSpinner: false
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
