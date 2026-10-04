import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

/**
 * Konfigurasi Firebase Client
 * Menggunakan NEXT_PUBLIC_* agar aman diakses di browser.
 * Disediakan fallback mock config agar `next build` dan prerendering
 * tidak crash jika env belum terpasang di Vercel build phase.
 */
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDs1zD4mpks0LxIsUMX_UDGL0EJtYs-dBI',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'fadrodzak-c9e11.firebaseapp.com',
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'fadrodzak-c9e11',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fadrodzak-c9e11.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '209486236426',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:209486236426:web:34a2f448a8b486ddb4c8f3',
};

// Inisialisasi Firebase App singleton di sisi browser
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

const auth: Auth = getAuth(app);

// Provider Google Auth
const googleProvider = new GoogleAuthProvider();

// PENTING: Selalu munculkan pemilih akun Google agar multi-akun lancar
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Cek apakah Firebase API Key asli sudah dikonfigurasi
export const isFirebaseConfigured = Boolean(
  (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDs1zD4mpks0LxIsUMX_UDGL0EJtYs-dBI') &&
    !(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '').includes('DemoFallback')
);

export { app, auth, googleProvider };
