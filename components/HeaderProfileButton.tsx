'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { UserRound } from 'lucide-react';

export default function HeaderProfileButton() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Placeholder sebelum hidrasi selesai untuk mencegah layout shift
  if (!mounted) {
    return (
      <div className="hidden sm:inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-2xl border border-[#E8DED6] bg-[#FFFDF9] opacity-60">
        <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] animate-pulse" />
        <div className="hidden md:block w-16 h-3 bg-[#E8DED6]/50 rounded-md animate-pulse" />
      </div>
    );
  }

  // JIKA PENGGUNA SUDAH LOGIN: Tampilkan Foto Profil Besar & Nama Pena
  if (user) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'Penulis';
    const photoURL = user.photoURL;

    return (
      <Link
        href="/profil"
        className="hidden sm:inline-flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-2xl border border-[#E8DED6] bg-[#FFFDF9] hover:border-[#C85A32] hover:bg-[#FAF8F5] transition-all duration-200 shadow-2xs group shrink-0 active:scale-98"
        title={`Buka Ruang Profil ${displayName}`}
      >
        {/* Foto Profil Nyata / Avatar Inisial Berukuran Nyaman (Besar & Jelas) */}
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[#E8DED6] ring-2 ring-[#C85A32]/20 group-hover:ring-[#C85A32]/60 group-hover:scale-105 transition-all duration-200 shrink-0 shadow-2xs">
          {photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoURL}
              alt={displayName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FAF8F5] to-[#EFE7DE] text-[#C85A32] font-serif font-bold text-base flex items-center justify-center">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info Nama Pena & Status Online */}
        <div className="text-left hidden md:block leading-tight">
          <p className="text-xs font-serif font-bold text-[#1C1A19] group-hover:text-[#C85A32] transition truncate max-w-[120px]">
            {displayName}
          </p>
          <p className="text-[10px] text-[#7A6B63] font-sans flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Ruang Profil &rarr;</span>
          </p>
        </div>
      </Link>
    );
  }

  // JIKA BELUM LOGIN: Tampilkan Tombol Profil / Masuk yang Elegan & Nyaman Diklik
  return (
    <Link
      href="/profil"
      className="hidden sm:inline-flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-2xl border border-[#E8DED6] bg-[#FFFDF9] hover:border-[#C85A32] hover:bg-[#FAF8F5] transition-all duration-200 shadow-2xs group shrink-0 active:scale-98"
      title="Buka Profil atau Masuk Akun"
    >
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] flex items-center justify-center text-[#C85A32] group-hover:bg-[#C85A32]/10 transition shrink-0">
        <UserRound className="w-4 h-4 text-[#C85A32]" />
      </div>
      <div className="text-left hidden md:block leading-tight">
        <p className="text-xs font-serif font-bold text-[#1C1A19] group-hover:text-[#C85A32] transition">
          Ruang Profil
        </p>
        <p className="text-[10px] text-[#7A6B63] font-sans">
          Masuk / Kelola &rarr;
        </p>
      </div>
    </Link>
  );
}
