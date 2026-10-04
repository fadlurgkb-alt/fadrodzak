'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Bookmark, ChevronRight, BookOpen } from 'lucide-react';
import {
  getBookmarksSnapshot,
  getServerBookmarksSnapshot,
  BookmarkItem,
} from '../lib/bookmark';

function subscribeBookmarks(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('fadrodzak_bookmark_changed', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('fadrodzak_bookmark_changed', callback);
    window.removeEventListener('storage', callback);
  };
}

export default function LastReadWidget() {
  const bookmarks = useSyncExternalStore(
    subscribeBookmarks,
    getBookmarksSnapshot,
    getServerBookmarksSnapshot
  );

  if (!bookmarks || bookmarks.length === 0) {
    return null;
  }

  // Ambil bacaan paling mutakhir (item pertama dari array rak buku)
  const lastItem: BookmarkItem = bookmarks[0];
  const progress = Math.min(100, Math.max(0, lastItem.progressPercent || 0));
  const targetUrl = lastItem.url || `/karya/${lastItem.id}`;
  const displayTitle = lastItem.nama_cerita || lastItem.judul;
  const chapterInfo = lastItem.nomor_bab
    ? `Bab ${lastItem.nomor_bab}${lastItem.judul_bab ? `: ${lastItem.judul_bab}` : ''}`
    : null;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#FAF3EC] via-[#FFFDF9] to-[#FAF3EC] border border-[#E2D4C5] p-4 sm:p-4.5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/20 flex items-center justify-center text-[#C85A32] shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32] bg-[#C85A32]/10 px-2 py-0.5 rounded-full">
                Lanjutkan Membaca
              </span>
              {progress > 0 && (
                <span className="text-[11px] font-medium text-[#7A6B63]">
                  {progress}% selesai
                </span>
              )}
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#1C1A19] truncate">
              {displayTitle}
            </h4>
            <p className="text-xs text-[#6B625D] truncate">
              {chapterInfo ? `${chapterInfo} • ` : ''}Oleh {lastItem.penulis}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center shrink-0">
          <Link
            href={targetUrl}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C85A32] text-white hover:bg-[#A94728] transition text-xs font-serif font-bold shadow-2xs"
          >
            <span>Lanjutkan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/rak-buku"
            className="p-2 rounded-xl border border-[#E2D4C5] bg-white text-[#7A6B63] hover:text-[#C85A32] hover:border-[#C85A32]/40 transition text-xs"
            title="Buka seluruh Rak Buku"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {progress > 0 && (
        <div className="w-full bg-[#EAE0D5] h-1 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-[#C85A32] h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
