'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenLine } from 'lucide-react';

export default function LoginButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function syncSessionWithServer(currentUser: User) {
    try {
      const idToken = await currentUser.getIdToken(true);
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          user: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          },
        }),
      });
    } catch (e) {
      console.warn('[LoginButton] Gagal sinkronisasi session cookie:', e);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        await syncSessionWithServer(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncSessionWithServer(result.user);
      router.push('/profil');
      router.refresh();
    } catch (error) {
      console.warn('[LoginButton] Popup ditutup atau redirecting ke /login:', error);
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      await signOut(auth);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('[LoginButton] Gagal logout:', error);
      router.push('/');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="w-20 h-8 bg-[#E8DED6]/40 animate-pulse rounded-xl" />
    );
  }

  if (user) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'Penulis';
    const photoURL = user.photoURL;

    return (
      <div className="flex items-center gap-3">
        <Link
          href="/tulis"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white text-xs font-semibold shadow-2xs transition"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>Tulis</span>
        </Link>

        <Link
          href="/profil"
          className="flex items-center gap-2 group text-left"
          title="Buka Profil Saya"
        >
          {photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoURL}
              alt={displayName}
              className="w-8 h-8 rounded-full border border-[#E8DED6] object-cover group-hover:border-[#C85A32] transition"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8DED6] text-[#C85A32] font-semibold flex items-center justify-center text-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-medium text-[#2C2A29] hidden md:inline group-hover:text-[#C85A32] transition max-w-[110px] truncate">
            {displayName}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          type="button"
          className="text-xs text-[#6B625D] hover:text-red-600 transition px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
          title="Keluar dari akun"
        >
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLogin}
        type="button"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] hover:bg-[#FAF8F5] text-xs font-medium text-[#2C2A29] shadow-2xs transition cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Masuk</span>
      </button>

      <Link
        href="/login"
        className="hidden sm:inline-flex items-center text-xs text-[#C85A32] hover:underline font-medium px-2 py-1"
      >
        Daftar
      </Link>
    </div>
  );
}
