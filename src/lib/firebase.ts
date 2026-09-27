import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, initializeAuth, type Auth } from 'firebase/auth';
// `getReactNativePersistence` works at runtime (it's exported from the SDK's RN build)
// but isn't in this package's top-level type declarations — a known, still-open gap in
// the firebase-js-sdk types (see firebase/firebase-js-sdk#8332), not a real bug here.
// @ts-expect-error — see comment above
import { getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** True once real Firebase config values are present (via .env.local). Everything in
 * this module no-ops safely when false, so the app keeps working locally-only until
 * an account is set up. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = isFirebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

// Auth persistence differs by platform: React Native has no window/localStorage, so it
// needs AsyncStorage explicitly; the web preview (used for development in this project)
// needs the browser persistence instead.
let authInstance: Auth | null = null;
if (app) {
  authInstance =
    Platform.OS === 'web'
      ? initializeAuth(app, { persistence: browserLocalPersistence })
      : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

export const auth = authInstance;
// `ignoreUndefinedProperties` matters here: many of this app's local types have
// optional fields that are frequently `undefined` (not just absent), and plain
// Firestore writes reject `undefined` values outright.
export const firestore = app ? initializeFirestore(app, { ignoreUndefinedProperties: true }) : null;
