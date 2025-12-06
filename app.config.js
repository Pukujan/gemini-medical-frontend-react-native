import 'dotenv/config';

export default {
  expo: {
    name: 'gemini-medical-rn',
    slug: 'gemini-medical-rn',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'geminimedicalrn',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pujan3645.geminimedicalrn', // 👈 ADD THIS
    },

    android: {
      package: 'com.pujan3645.geminimedicalrn', // 👈 ADD THIS
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY,
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
      },
      appInstanceId: process.env.APP_INSTANCE_ID ?? 'medical-org',
      backendUrl: process.env.BACKEND_URL,
      router: {},
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },

    owner: 'pujan3645',

    runtimeVersion: {
      policy: 'appVersion',
    },

    updates: {
      url: 'https://u.expo.dev/b927a0b8-f2b1-4204-a186-f2bff844ff59',
    },
  },
};
