'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Coffee,
  Share2,
  ExternalLink,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  Heart,
  List,
} from 'lucide-react';
import { formatWaktuRelatif } from '../lib/date';
import { isBookmarked, toggleBookmark } from '../lib/bookmark';
import { showToast } from './Toast';

export interface SiblingChapter {
  id: number;
  judul: string;
  nomor_bab?: number | null;
  judul_bab?: string | null;
  created_at?: string | Date;
  sinopsis?: string | null;
  gambar_url?: string | null;
  link_trakteer?: string | null;
  genre?: string | null;
  status_cerita?: string | null;
}

interface NovelShowcaseCardProps {
  currentKaryaId: number;
  judul: string;
  penulis: string;
  userId?: string | null;
  namaCerita?: string | null;
  nomorBab?: number | null;
  judulBab?: string | null;
  gambarUrl?: string | null;
  sinopsis?: string | null;
  genre?: string | null;
  statusCerita?: string | null;
  linkTrakteer?: string | null;
  createdAt?: string | Date;
  siblingChapters: SiblingChapter[];
  totalLikes?: number;
}

export default function NovelShowcaseCard({
  currentKaryaId,
  judul,
  penulis,
  userId,
  namaCerita,
  nomorBab = 1,
  judulBab,
  gambarUrl,
  sinopsis,
  genre = 'Romansa',
  statusCerita = 'Ongoing',
  linkTrakteer,
  createdAt,
  siblingChapters = [],
  totalLikes = 0,
}: NovelShowcaseCardProps) {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(currentKaryaId));
    const handleBookmarkChange = () => {
      setBookmarked(isBookmarked(currentKaryaId));
    };
    window.addEventListener('fadrodzak_bookmark_changed', handleBookmarkChange);
    return () => window.removeEventListener('fadrodzak_bookmark_changed', handleBookmarkChange);
  }, [currentKaryaId]);

  const displayTitle = namaCerita || judul.replace(/— Bab.*$/, '').trim() || judul;
  const currentChapterNumber = nomorBab || 1;
  const currentChapterTitle =
    judulBab ||
    (judul.includes('— Bab') ? judul.split('— Bab')[1]?.replace(/^[\d\s:]+/, '').trim() : '') ||
    `Bab ${currentChapterNumber}`;

  const cleanSinopsis =
    sinopsis?.trim() ||
    'Belum ada premis atau sinopsis cerita yang dicantumkan oleh penulis. Mulai membaca bab untuk menyelami alur cerita.';

  const isCompleted = (statusCerita || '').toLowerCase() === 'tamat';

  const handleToggleBookmark = () => {
    const nextState = toggleBookmark({
      id: currentKaryaId,
      judul,
      penulis,
      kategori: 'Novel & Cerbung',
      nomor_bab: nomorBab,
      judul_bab: judulBab,
      nama_cerita: namaCerita,
      progressPercent: 0,
      url: `/karya/${currentKaryaId}`,
    });
    setBookmarked(nextState);
    showToast(nextState ? 'Tersimpan di rak bacaan' : 'Dihapus dari rak bacaan', 'info');
  };

  const handleCopyShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        showToast('Tautan karya berhasil disalin!', 'success');
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {}
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-6">
      {/* KARTU UTAMA NOVEL & CERITA BERSAMBUNG */}
      <div className="relative rounded-2xl bg-[#FFFDF9] border border-[#E8DED6] p-5 sm:p-7 shadow-2xs overflow-hidden">
        {/* 1. BAGIAN ATAS: JUDUL, GAMBAR, DUKUNG KAMI, PREMIS CERITA, GENRE */}
        <div className="relative z-10 flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          {/* A. GAMBAR SAMPUL NOVEL */}
          <div className="w-full sm:w-auto shrink-0 flex flex-col items-center mx-auto md:mx-0">
            <div
              onClick={() => gambarUrl && setShowCoverModal(true)}
              className={`relative group w-44 sm:w-48 aspect-2/3 rounded-xl overflow-hidden shadow-2xs transition-all duration-300 border border-[#E8DED6] ${
                gambarUrl ? 'cursor-pointer' : ''
              }`}
            >
              {/* Spine Effect */}
              <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 via-white/10 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10 pointer-events-none" />

              {gambarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gambarUrl}
                  alt={`Sampul Novel ${displayTitle}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />
              ) : (
                /* Fallback Cover */
                <div className="w-full h-full bg-[#2C2A29] p-4 flex flex-col justify-between text-white text-center font-serif select-none">
                  <div className="pt-2">
                    <span className="text-[10px] tracking-wider uppercase text-[#E8DED6] block font-sans">
                      Fadrodzak
                    </span>
                    <span className="text-[11px] font-medium text-[#C85A32] mt-1 block">
                      {genre}
                    </span>
                  </div>

                  <div className="my-auto px-1 py-3 border-y border-[#E8DED6]/20">
                    <h3 className="font-bold text-base sm:text-lg leading-snug tracking-wide line-clamp-3 text-white">
                      {displayTitle}
                    </h3>
                  </div>

                  <div className="pb-1">
                    <p className="text-[11px] italic text-[#E8DED6]">Karya: {penulis}</p>
                    <p className="text-[9px] text-[#6B625D] mt-0.5">Edisi Aksara Digital</p>
                  </div>
                </div>
              )}

              {/* Badge Status */}
              <div className="absolute top-2.5 right-2.5 z-20">
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-md ${
                    isCompleted
                      ? 'bg-[#2C2A29]/80 text-[#7A8B68] border border-[#7A8B68]/30'
                      : 'bg-[#2C2A29]/80 text-amber-200 border border-amber-500/30'
                  }`}
                >
                  {isCompleted ? 'Tamat' : 'Ongoing'}
                </span>
              </div>
            </div>

            {/* Aksi Cepat: Simpan & Bagikan */}
            <div className="flex items-center gap-2 mt-3.5 w-full justify-center">
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                  bookmarked
                    ? 'border-[#C85A32] bg-[#FAF8F5] text-[#C85A32]'
                    : 'border-[#E8DED6] bg-[#FFFDF9] text-[#6B625D] hover:text-[#C85A32] hover:border-[#C85A32]'
                }`}
                title="Tandai dan simpan ke Rak Bacaan Pribadi"
              >
                {bookmarked ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                    Tersimpan
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    Simpan Novel
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyShare}
                className="py-1.5 px-3 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-[#6B625D] hover:text-[#C85A32] hover:border-[#C85A32] text-xs font-medium transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                title="Bagikan tautan novel ini"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#7A8B68]" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    Bagikan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* B. KONTEN TEKS: JUDUL, GENRE, DUKUNG KAMI, & PREMIS CERITA */}
          <div className="flex-1 w-full space-y-4">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#FAF8F5] text-[#C85A32] text-xs font-medium border border-[#E8DED6]">
                {genre}
              </span>

              <span className="px-2.5 py-0.5 rounded-lg bg-[#FFFDF9] text-[#6B625D] text-xs border border-[#E8DED6]">
                {siblingChapters.length || 1} Bab Diterbitkan
              </span>

              {statusCerita && (
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs border ${
                    isCompleted
                      ? 'bg-[#7A8B68]/10 text-[#7A8B68] border-[#7A8B68]/30'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {isCompleted ? 'Selesai / Tamat' : 'Masih Bersambung'}
                </span>
              )}
            </div>

            {/* Judul Utama Novel & Bab Saat Ini */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2A29] leading-tight">
                {displayTitle}
              </h1>

              {/* Subtitle Bab Aktif */}
              <div className="mt-1.5 flex items-center gap-2 text-sm sm:text-base text-[#C85A32]">
                <span className="text-[#6B625D] text-xs uppercase tracking-wider">Sedang Membaca:</span>
                <span className="font-semibold underline decoration-dotted underline-offset-4">
                  Bab {currentChapterNumber}: {currentChapterTitle}
                </span>
              </div>

              {/* Penulis & Info Publikasi */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#6B625D]">
                <span>
                  Ditulis oleh:{' '}
                  {userId ? (
                    <Link
                      href={`/profil/${userId}`}
                      className="font-bold text-[#C85A32] hover:underline"
                    >
                      {penulis}
                    </Link>
                  ) : (
                    <strong className="font-bold text-[#C85A32]">{penulis}</strong>
                  )}
                </span>
                {createdAt && (
                  <>
                    <span className="text-[#E8DED6]">•</span>
                    <span>Rilis {formatWaktuRelatif(createdAt)}</span>
                  </>
                )}
                {totalLikes > 0 && (
                  <>
                    <span className="text-[#E8DED6]">•</span>
                    <span className="text-[#C85A32] font-medium flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-[#C85A32]/20" /> {totalLikes} Suka
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* C. DUKUNG PENULIS */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-9 h-9 rounded-xl bg-[#FFFDF9] text-[#C85A32] flex items-center justify-center shrink-0 border border-[#E8DED6]">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2C2A29]">
                    Dukung Penulis Cerita Ini
                  </h4>
                  <p className="text-[11px] text-[#6B625D] leading-tight">
                    Apresiasi proses kreatif penulis untuk merampungkan bab berikutnya.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {linkTrakteer ? (
                  <a
                    href={linkTrakteer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C85A32] text-white font-medium text-xs hover:bg-[#A94728] transition shadow-2xs w-full sm:w-auto cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    Dukung Karya
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDonateModal(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C85A32] text-white font-medium text-xs hover:bg-[#A94728] transition shadow-2xs w-full sm:w-auto cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    Dukung Karya
                  </button>
                )}
              </div>
            </div>

            {/* D. PREMIS CERITA / SINOPSIS */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sinopsis &amp; Premis Cerita</span>
              </div>
              <article className="prose prose-stone text-xs sm:text-sm font-serif text-[#45413E] leading-relaxed italic max-w-none">
                <p>&ldquo;{cleanSinopsis}&rdquo;</p>
              </article>
            </div>
          </div>
        </div>

        {/* 2. BAGIAN BAWAH: BAB-BAB YANG BISA DI-KLIK! (INTERACTIVE CHAPTER LIST) */}
        <div className="mt-6 pt-5 border-t border-[#E6DFD5]">
          <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
            <div>
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#2C2A29] flex items-center gap-2">
                <List className="w-4 h-4 text-[#C85A32]" />
                Daftar Bab {displayTitle} ({siblingChapters.length || 1} Bab)
              </h3>
              <p className="text-xs text-[#7A6B63] font-serif">
                Pilih nomor bab di bawah ini untuk langsung membaca naskah:
              </p>
            </div>

            <a
              href="#naskah-bacaan"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C85A32] text-white text-xs font-serif font-medium hover:bg-[#A8451D] transition-colors shadow-2xs"
            >
              Lanjut Baca Bab {currentChapterNumber}
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Grid Bab-Bab Yang Bisa Diklik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {siblingChapters && siblingChapters.length > 0 ? (
              siblingChapters.map((ch, idx) => {
                const isCurrent = ch.id === currentKaryaId;
                const babNum = ch.nomor_bab || idx + 1;
                const chapterTitle = ch.judul_bab || ch.judul || `Bab ${babNum}`;

                return (
                  <Link
                    key={ch.id}
                    href={`/karya/${ch.id}#naskah-bacaan`}
                    className={`group relative p-2.5 rounded-xl border transition-colors flex flex-col justify-between text-left ${
                      isCurrent
                        ? 'border-[#C85A32] bg-[#FAF0E6]'
                        : 'border-[#E6DFD5] bg-white hover:bg-[#FAF7F2] hover:border-[#C85A32]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-md text-xs font-bold font-serif flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-[#C85A32] text-white'
                              : 'bg-[#FAF7F2] text-[#5C554E] border border-[#E6DFD5] group-hover:border-[#C85A32]/40'
                          }`}
                        >
                          {babNum}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={`font-serif text-xs font-semibold block truncate ${
                              isCurrent ? 'text-[#C85A32]' : 'text-[#2C2A29] group-hover:text-[#C85A32]'
                            }`}
                          >
                            Bab {babNum}
                          </span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-[#C85A32] text-white shrink-0">
                          Sedang Dibaca
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C85A32] transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>

                    <p
                      className={`text-[11px] font-serif mt-1.5 line-clamp-1 ${
                        isCurrent ? 'text-[#8C4A28] font-medium' : 'text-[#7A6B63]'
                      }`}
                    >
                      {chapterTitle}
                    </p>

                    {ch.created_at && (
                      <span className="text-[10px] text-[#9E8E84] font-serif mt-1 block">
                        {formatWaktuRelatif(ch.created_at)}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              /* Jika hanya ada bab pertama */
              <div className="col-span-full p-4 rounded-xl bg-white border border-[#E6DFD5] text-center">
                <p className="text-xs font-serif text-[#7A6B63]">
                  Ini adalah Bab 1 (Bab Perdana). Bab-bab berikutnya akan otomatis muncul di sini saat
                  penulis menerbitkannya.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DUKUNG PENULIS JIKA BELUM ADA LINK LANGSUNG ATAU INGIN BERBAGI */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-xl p-6 max-w-md w-full border border-[#E6DFD5] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center border border-[#E8DEC0]">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#2C2A29]">
                    Dukung Penulis: {penulis}
                  </h3>
                  <p className="text-[11px] text-[#7A6B63] font-serif">Karya: {displayTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDonateModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm p-1 leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-serif text-[#5C554E] leading-relaxed">
              <p>
                Penulis belum menautkan link Trakteer atau Saweria secara publik di karya ini.
                Namun Anda bisa memberikan dukungan terbaik dengan cara:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#45413E]">
                <li>Memberikan apresiasi rasa sastra di bawah naskah bacaan.</li>
                <li>Menuliskan ulasan hangat dan santun di kolom diskusi sastra.</li>
                <li>Membagikan karya ini kepada rekan pembaca dan sesama pegiat aksara.</li>
              </ul>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleCopyShare}
                className="flex-1 py-2 rounded-lg border border-[#E6DFD5] bg-white text-xs font-serif font-medium text-[#C85A32] hover:bg-[#FAF0E6] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedLink ? 'Tautan Tersalin!' : 'Salin Tautan Cerita'}
              </button>
              <button
                type="button"
                onClick={() => setShowDonateModal(false)}
                className="flex-1 py-2 rounded-lg bg-[#C85A32] text-white text-xs font-serif font-medium hover:bg-[#A8451D] transition-colors shadow-2xs"
              >
                Kembali Membaca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ZOOM COVER SAMPUL NOVEL */}
      {showCoverModal && gambarUrl && (
        <div
          onClick={() => setShowCoverModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-md w-full relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gambarUrl}
              alt={`Sampul Lengkap ${displayTitle}`}
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/20 mx-auto"
            />
            <p className="text-center text-xs font-serif text-white/80 mt-3">
              Klik di mana saja untuk menutup pratinjau sampul
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
