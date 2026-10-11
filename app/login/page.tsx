'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import Link from 'next/link';
import FadrodzakLogo from '@/components/FadrodzakLogo';

export default function LoginPage() {
  const router = useRouter();

  // State tampilan morphing gooey
  const [isOpen, setIsOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
          document.cookie = `fadrodzak_ref=${encodeURIComponent(ref)}; path=/; max-age=${60 * 60 * 24 * 30}`;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  /**
   * Mengirim ID token Firebase ke server Next.js untuk membuat session cookie
   */
  async function syncSession(idToken: string, userPayload?: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null }) {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        user: userPayload,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal membuat sesi login di server.');
    }
  }

  /**
   * Login Google dengan Pemilih Akun (Multi-Account Support)
   */
  const handleGoogleLogin = async () => {
    setErrorMsg('');

    if (!isFirebaseConfigured) {
      setErrorMsg(
        'Kunci Firebase API Key belum diatur di file konfigurasi. Silakan periksa pengaturan Firebase Anda.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);

      await syncSession(idToken, {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });

      router.push('/profil');
      router.refresh();
    } catch (err: unknown) {
      console.error('[Login Google Error]:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela login Google ditutup sebelum selesai.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('Popup browser diblokir. Izinkan popup untuk login dengan Google.');
      } else if (
        code === 'auth/api-key-not-valid' ||
        code === 'auth/invalid-api-key' ||
        String(err).includes('auth/api-key-not-valid')
      ) {
        setErrorMsg(
          'API Key Firebase tidak valid. Pastikan NEXT_PUBLIC_FIREBASE_API_KEY di file .env.local sudah diisi dengan API Key proyek Firebase Anda.'
        );
      } else if (
        code === 'auth/unauthorized-domain' ||
        String(err).includes('auth/unauthorized-domain')
      ) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'domain ini';
        setErrorMsg(
          `Domain "${domain}" belum diizinkan di Firebase Console. Buka Firebase Console > Authentication > Settings > Authorized domains, lalu klik "Add domain" dan masukkan "${domain}".`
        );
      } else {
        setErrorMsg((err as Error)?.message || 'Terjadi kendala saat login dengan Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login / Register Email & Password
   */
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isFirebaseConfigured) {
      setErrorMsg(
        'Kunci Firebase API Key belum diatur di file .env.local. Silakan periksa konfigurasi Firebase Anda.'
      );
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        if (!nama.trim()) {
          throw new Error('Nama pena wajib diisi.');
        }
        if (password.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter.');
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: nama.trim() });

        const idToken = await cred.user.getIdToken(true);
        await syncSession(idToken, {
          uid: cred.user.uid,
          displayName: nama.trim(),
          email: cred.user.email,
          photoURL: cred.user.photoURL,
        });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const idToken = await cred.user.getIdToken(true);

        await syncSession(idToken, {
          uid: cred.user.uid,
          displayName: cred.user.displayName,
          email: cred.user.email,
          photoURL: cred.user.photoURL,
        });
      }

      router.push('/profil');
      router.refresh();
    } catch (err: unknown) {
      console.error('[Email Auth Error]:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar. Silakan login langsung.');
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi tidak sesuai.');
      } else if (code === 'auth/user-not-found') {
        setErrorMsg('Akun belum terdaftar. Silakan daftar akun baru.');
      } else if (
        code === 'auth/api-key-not-valid' ||
        code === 'auth/invalid-api-key' ||
        String(err).includes('auth/api-key-not-valid')
      ) {
        setErrorMsg(
          'API Key Firebase tidak valid. Pastikan NEXT_PUBLIC_FIREBASE_API_KEY di file .env.local sudah diisi.'
        );
      } else {
        setErrorMsg((err as Error)?.message || 'Gagal memproses autentikasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col items-center justify-center p-4 font-sans text-[#2B2B2B] relative overflow-hidden selection:bg-[#C85A32]/20 selection:text-[#3A1F16]">
      {/* 1. FILTER SVG GOOEY (Tetesan Tinta Terracotta Sastra Fadrodzak) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="ink-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Ornamen Latar Belakang Kertas Sastra Hangat */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#C85A32_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-15" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#EFE4D6]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#EAD8C7]/50 blur-3xl pointer-events-none" />

      {/* 2. AREA EFEK CAIRAN GOOEY & KOTAK AKSARA */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg min-h-[580px] my-auto">
        {/* Lapisan Animasi Efek Gooey Filter (Blob Cairan Morfologi di Belakang) */}
        <div 
          style={{ filter: 'url(#ink-goo)' }} 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        >
          {/* Tetesan Tinta Terracotta yang Melayang Halus Saat Tertutup */}
          <motion.div
            animate={{
              y: isOpen ? -240 : -64,
              opacity: isOpen ? 0 : [0.75, 1, 0.75],
              scale: isOpen ? 0.2 : [1, 1.12, 1],
            }}
            transition={{
              duration: isOpen ? 0.4 : 3,
              repeat: isOpen ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-12 h-12 bg-gradient-to-br from-[#C85A32] to-[#A94824] rounded-full shadow-md"
          />

          {/* Tetesan Sekunder (Aksen Emas Sastra) */}
          <motion.div
            animate={{
              y: isOpen ? -220 : -48,
              x: isOpen ? 0 : 30,
              opacity: isOpen ? 0 : 0.65,
              scale: isOpen ? 0.2 : 0.85,
            }}
            transition={{
              duration: 0.5,
              ease: 'backOut',
            }}
            className="absolute w-7 h-7 bg-[#E8A87C] rounded-full"
          />

          {/* Wadah Utama yang Melar (Morphing dari Tombol Terracotta ke Kartu Sastra Krem) */}
          <motion.div
            animate={{
              width: isOpen ? (isRegister ? 450 : 430) : 230,
              height: isOpen ? (isRegister ? 680 : 620) : 58,
              borderRadius: isOpen ? 26 : 29,
              backgroundColor: isOpen ? '#FAF8F5' : '#C85A32',
            }}
            transition={{
              duration: 0.75,
              type: 'spring',
              stiffness: 130,
              damping: 18,
            }}
            className="shadow-2xl border border-[#E8DEC0]/80 relative"
          />
        </div>

        {/* 3. KONTEN INTERAKTIF (Di Lapisan Atas z-10 Agar Teks & Input Tajam, Jelas, & Kontras) */}
        <div className="relative z-10 w-full flex items-center justify-center p-3">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              /* State Tombol Pelatuk Awal (Tertutup) */
              <motion.button
                key="trigger-button"
                onClick={() => setIsOpen(true)}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-[230px] h-[58px] rounded-full flex items-center justify-center gap-2.5 text-white font-serif tracking-wide text-base cursor-pointer shadow-lg hover:brightness-105 transition-all"
                title="Buka Ruang Aksara"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FAF8F5] animate-pulse" />
                <span className="font-medium">Masuk ke Ruang Aksara</span>
                <span className="text-xs font-sans opacity-80">→</span>
              </motion.button>
            ) : (
              /* State Kontainer Terbuka: Form Lengkap dengan Logo & Slogan di Dalam */
              <motion.div
                key="open-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="w-full max-w-[440px] p-6 sm:p-7 text-[#2B2B2B] flex flex-col justify-between"
              >
                {/* Header Kartu: Logo Fadrodzak & Slogan Menyatu di Dalam Wadah */}
                <div className="relative text-center pb-4 mb-4 border-b border-[#E8DEC0]/80">
                  {/* Tombol Tutup / Susutkan */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setErrorMsg('');
                    }}
                    aria-label="Tutup formulir"
                    className="absolute top-0 right-0 p-1.5 rounded-full text-[#7A6B63] hover:text-[#C85A32] hover:bg-[#F3ECE0] transition cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex flex-col items-center">
                    <FadrodzakLogo size="md" variant="compact" showLink={true} className="justify-center mb-1.5" />
                    <p className="text-xs font-serif italic text-[#4A3E39] font-medium tracking-wide">
                      &ldquo;Tempat di mana kata-kata menemukan rumahnya&rdquo;
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3ECE0] text-[#8C3B1A] text-[11px] font-serif font-medium">
                      <span>{isRegister ? 'Pendaftaran Penulis Baru' : 'Ruang Masuk Penulis'}</span>
                    </div>
                  </div>
                </div>

                {/* Pesan Kesalahan */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2"
                  >
                    <span className="shrink-0 text-red-500">⚠️</span>
                    <span className="leading-relaxed">{errorMsg}</span>
                  </motion.div>
                )}

                {/* Tombol Login Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-[#E0D8CC] text-[#2B2B2B] rounded-xl hover:bg-[#FAF8F5] hover:border-[#C85A32]/40 transition text-sm font-medium shadow-2xs disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>{loading ? 'Menghubungkan Akun...' : 'Masuk dengan Akun Google'}</span>
                </button>

                {/* Pemisah Garis Sastra */}
                <div className="relative my-3.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E8DEC0]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                    <span className="bg-[#FAF8F5] px-3 text-[#8C7A70] font-serif">atau via email</span>
                  </div>
                </div>

                {/* Form Email / Sandi */}
                <form onSubmit={handleSubmitEmail} className="space-y-3">
                  {isRegister && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A3E39] uppercase tracking-wider mb-1 font-serif">
                        Nama Pena
                      </label>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E0D8CC] text-[#2B2B2B] placeholder-[#A5958A] text-sm outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition"
                        placeholder="misal: Amir Hamzah"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A3E39] uppercase tracking-wider mb-1 font-serif">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E0D8CC] text-[#2B2B2B] placeholder-[#A5958A] text-sm outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition"
                      placeholder="penulis@aksara.id"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A3E39] uppercase tracking-wider mb-1 font-serif">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E0D8CC] text-[#2B2B2B] placeholder-[#A5958A] text-sm outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-1.5 py-2.5 px-4 bg-[#C85A32] hover:bg-[#A94824] text-white rounded-xl font-medium transition text-sm shadow-sm disabled:opacity-50 font-serif cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? 'Memproses...' : isRegister ? 'Daftarkan Akun Penulis' : 'Masuk ke Ruang Sastra'}
                  </button>
                </form>

                {/* Sakelar Masuk / Daftar */}
                <div className="mt-3.5 pt-3 border-t border-[#E8DEC0]/80 text-center text-xs text-[#736B63]">
                  {isRegister ? (
                    <p>
                      Sudah punya akun pena?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegister(false);
                          setErrorMsg('');
                        }}
                        className="text-[#C85A32] font-semibold hover:underline cursor-pointer transition"
                      >
                        Masuk di sini
                      </button>
                    </p>
                  ) : (
                    <p>
                      Belum terdaftar sebagai penulis?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegister(true);
                          setErrorMsg('');
                        }}
                        className="text-[#C85A32] font-semibold hover:underline cursor-pointer transition"
                      >
                        Buat akun sekarang
                      </button>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tautan Kembali ke Beranda */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 z-10 text-center"
      >
        <Link 
          href="/" 
          className="text-xs text-[#736B63] hover:text-[#C85A32] transition font-serif tracking-wide underline underline-offset-4 decoration-[#736B63]/40"
        >
          &larr; Kembali ke Beranda Fadrodzak
        </Link>
      </motion.div>
    </div>
  );
}
