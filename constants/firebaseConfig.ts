// constants/firebaseConfig.ts
import Constants from 'expo-constants';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

// Read from app.json → expo.extra (or manifest.extra in some environments)
const extra =
  (Constants.expoConfig as any)?.extra ??
  (Constants.manifest as any)?.extra ??
  {};

const firebaseExtra = extra.firebase ?? {};

export const APP_ID: string = (extra.appInstanceId as string) ?? 'medical-org';

export const FIREBASE_CONFIG = {
  apiKey: firebaseExtra.apiKey,
  authDomain: firebaseExtra.authDomain,
  projectId: firebaseExtra.projectId,
  storageBucket: firebaseExtra.storageBucket,
  messagingSenderId: firebaseExtra.messagingSenderId,
  appId: firebaseExtra.appId,
};

// Internal singletons
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

/**
 * Initialize (once) and return Firebase app + Firestore instance.
 */
export function getFirebase(): { app: FirebaseApp; db: Firestore } {
  if (!FIREBASE_CONFIG.apiKey) {
    throw new Error(
      'FIREBASE_CONFIG is missing apiKey. Check app.json extra.firebase.*',
    );
  }

  if (!appInstance) {
    // Avoid re-initializing on fast refresh / multiple imports
    appInstance = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
    dbInstance = getFirestore(appInstance);
    console.log('[Firebase] Initialized app + Firestore');
  }

  return { app: appInstance!, db: dbInstance! };
}
