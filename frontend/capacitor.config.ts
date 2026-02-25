import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.votelink.app',
  appName: 'VoteLink',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4F46E5",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#ffffff"
    },
    Camera: {
      presentationStyle: 'fullscreen'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      overlaysWebView: false
    }
  }
};

export default config;
