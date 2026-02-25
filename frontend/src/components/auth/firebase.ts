// firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuLJ-9iJw1QcGzGM4mO1T4vj9aAFHULAY",
  authDomain: "voootteee.firebaseapp.com",
  projectId: "voootteee",
  storageBucket: "voootteee.firebasestorage.app",
  messagingSenderId: "396362014663",
  appId: "1:396362014663:web:00e096dce0cd1c301843e2",
  measurementId: "G-2J6W2VG73K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize analytics only in production and browser environment
let analytics;
try {
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Firebase Analytics not available:', error);
}

// Optional: Initialize Firebase services you might use
export const auth = getAuth(app);
export const database = getDatabase(app);

// Phone authentication functions
export const setupRecaptcha = (elementId: string) => {
  return new RecaptchaVerifier(auth, elementId, {
    'size': 'normal',
    'callback': (response: string) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
      console.log('✅ reCAPTCHA solved:', response);
    },
    'expired-callback': () => {
      console.log('❌ reCAPTCHA expired');
    }
  });
};

export const sendOTPToPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider };

export default app;
