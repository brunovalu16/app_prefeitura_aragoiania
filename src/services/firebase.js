import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log("🔑 API KEY debug:", {
  prefix: (process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "").slice(0, 8),
  suffix: (process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "").slice(-6),
  len: (process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "").length,
});


console.log("🔥 FIREBASE CFG:", {
  apiKey: firebaseConfig.apiKey ? "OK" : "MISSING",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? "OK" : "MISSING",
});


// ✅ DEBUG TEMPORÁRIO — pode apagar depois
console.log(
  "🔑 API KEY prefix:",
  (process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "").slice(0, 6)
);

// ✅ evita reinicializar o app no Fast Refresh
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ evita auth/already-initialized
let auth;
try {
  auth = getAuth(app); // se já existe, só pega
} catch (_) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(app);

export { app, auth, db };

