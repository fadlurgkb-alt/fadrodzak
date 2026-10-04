'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  getBookmarksSnapshot,
  getServerBookmarksSnapshot,
  removeBookmark,
} from '@/lib/bookmark';
import { BookOpen, Trash2, ArrowRight, Bookmark } from 'lucide-react';

function subscribeBookmarks(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('fadrodzak_bookmark_changed', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('fadrodzak_bookmark_changed', callback);
    window.removeEventListener('storage', callback);
  };
}

export default function RakBacaanClient() {
  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const bookmarks = useSyncExternalStore(
    subscribeBookmarks,
    getBookmarksSnapshot,
    getServerBookmarksSnapshot
  );

  const handleRemove = (id: number) => {
    removeBookmark(id);
  };

  if (!isLoaded) {
    return (
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8DED6] text-center text-xs text-[#6B625D]">
        Memuat rak bacaan...
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-[#FFFDF9] p-8 rounded-2xl border border-[#E8DED6] text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-xl bg-[#FAF8F5] border border-[#E8DED6] text-[#C85A32] flex items-center justify-center">
          <Bookmark className="w-5 h-5" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#2C2A29]">
          Rak Bacaan Masih Kosong
        </h3>
        <p className="text-xs text-[#6B625D] max-w-sm mx-auto leading-relaxed">
          Tandai karya atau bab novel favorit saat membaca untuk menyimpannya di sini beserta catatan kemajuan bacaan Anda.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-medium hover:bg-[#A94728] transition shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Jelajahi Beranda Sastra
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[#6B625D]">
          Menampilkan <strong>{bookmarks.length}</strong> karya tersimpan di rak
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DED6] shadow-2xs transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-[#C85A32] uppercase tracking-wider bg-[#FAF8F5] px-2 py-0.5 rounded-lg border border-[#E8DED6]">
                  {b.kategori}
                  {b.nomor_bab ? ` • Bab ${b.nomor_bab}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(b.id)}
                  className="text-[#6B625D]/60 hover:text-red-700 transition p-1 cursor-pointer"
                  title="Hapus dari Rak"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-serif font-bold text-sm text-[#2C2A29] line-clamp-1 mb-1">
                {b.judul}
              </h4>
              <p className="text-xs text-[#6B625D] mb-3">
                Oleh {b.penulis}
              </p>
            </div>

            <div className="pt-2 border-t border-[#E8DED6]">
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-[10px] text-[#6B625D] mb-1">
                <span>Kemajuan</span>
                <span className="font-semibold text-[#C85A32]">{b.progressPercent || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E8DED6]/60 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[#C85A32] rounded-full transition-all duration-300"
                  style={{ width: `${b.progressPercent || 0}%` }}
                />
              </div>

              <Link
                href={b.url || `/karya/${b.id}`}
                className="w-full py-1.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#E8DED6]/40 text-[#C85A32] text-xs font-medium flex items-center justify-center gap-1.5 transition border border-[#E8DED6]"
              >
                <span>Lanjutkan Membaca</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
