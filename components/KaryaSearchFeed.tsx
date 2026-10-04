'use client';

import React, { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearch } from './SearchContext';
import {
  HighlightText,
  extractMatchingSnippet,
  isKaryaMatching,
} from '../lib/search-utils';
import KaryaSnippetPreview from './KaryaSnippetPreview';
import { formatWaktuRelatif, formatWaktuLengkap } from '../lib/date';
import {
  Search,
  X,
  PenLine,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Heart,
  MessageSquare,
  BookMarked,
  ArrowRight,
} from 'lucide-react';

export interface KaryaRow {
  id: number;
  judul: string;
  kategori: string;
  isi_tulisan: string;
  nama_pengguna: string;
  status_penulis: string;
  link_trakteer: string | null;
  gambar_url: string | null;
  audio_url?: string | null;
  user_id?: string;
  total_likes: number;
  total_komentar: number;
  created_at: string | Date;
  nomor_bab?: number | null;
  judul_bab?: string | null;
  nama_cerita?: string | null;
  sinopsis?: string | null;
  status_cerita?: string | null;
}

interface Props {
  initialKaryas: KaryaRow[];
  kategoriAktif: string;
  onLikeAction: (formData: FormData) => Promise<void>;
}

const ITEMS_PER_PAGE = 6;

export default function KaryaSearchFeed({
  initialKaryas,
  kategoriAktif,
  onLikeAction,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, clearSearch, isSearching } = useSearch();

  const feedTopRef = useRef<HTMLDivElement>(null);

  // Ambil nomor halaman dari URL query (?page=...)
  const pageParam = parseInt(searchParams?.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Filter karya berdasarkan kategori dan query pencarian
  const filteredKaryas = useMemo(() => {
    let result = initialKaryas;

    // Filter kategori jika bukan 'Semua'
    if (kategoriAktif && kategoriAktif !== 'Semua') {
      const target = kategoriAktif.toLowerCase();
      if (target.includes('novel') || target.includes('cerbung')) {
        result = result.filter((k) => {
          const kLower = k.kategori.toLowerCase();
          return (
            kLower.includes('novel') ||
            kLower.includes('cerbung') ||
            kLower.includes('cerita bersambung')
          );
        });
      } else {
        result = result.filter(
          (k) => k.kategori.toLowerCase() === target
        );
      }
    }

    // Filter teks (judul, nama penulis, cuplikan bait/isi)
    if (searchQuery.trim()) {
      result = result.filter((k) => isKaryaMatching(k, searchQuery));
    }

    return result;
  }, [initialKaryas, kategoriAktif, searchQuery]);

  const totalItems = filteredKaryas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Potong karya untuk halaman yang sedang aktif
  const paginatedKaryas = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredKaryas.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredKaryas, safeCurrentPage]);

  // Buat URL dengan query params yang terjaga
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (kategoriAktif && kategoriAktif !== 'Semua') {
      params.set('kategori', kategoriAktif);
    }
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (pageNumber > 1) {
      params.set('page', String(pageNumber));
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  };

  const goToPage = (pageNumber: number) => {
    const target = Math.max(1, Math.min(pageNumber, totalPages));
    router.push(createPageUrl(target), { scroll: false });
    if (feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      goToPage(target);
      setJumpPageInput('');
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  }, [totalPages, safeCurrentPage]);

  const categories = ['Semua', 'Puisi', 'Cerpen', 'Pantun', 'Novel & Cerbung'];

  return (
    <div>
      {/* Titik jangkar scroll saat berganti halaman */}
      <div ref={feedTopRef} id="ruang-baca-feed" className="-mt-4 pt-4" />

      {/* 1. Filter Kategori Tab Bergaya Editorial */}
      <div className="flex gap-4 sm:gap-6 mb-8 text-xs sm:text-sm border-b border-[#E8DED6] pb-2 overflow-x-auto no-scrollbar">
        {categories.map((kat) => {
          const isActive = kategoriAktif === kat;
          const href =
            kat === 'Semua'
              ? searchQuery
                ? `/?q=${encodeURIComponent(searchQuery)}`
                : '/'
              : searchQuery
              ? `/?kategori=${encodeURIComponent(kat)}&q=${encodeURIComponent(searchQuery)}`
              : `/?kategori=${encodeURIComponent(kat)}`;

          return (
            <Link
              key={kat}
              href={href}
              className={`pb-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-[#C85A32] font-semibold border-b-2 border-[#C85A32] -mb-[10px]'
                  : 'text-[#6B625D] hover:text-[#2C2A29]'
              }`}
            >
              {kat}
            </Link>
          );
        })}
      </div>

      {/* 2. Banner Status Hasil Pencarian Aktif */}
      {isSearching && (
        <div className="mb-8 p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DED6] flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#2C2A29]">
            <span className="p-1 rounded-lg bg-[#C85A32]/10 text-[#C85A32]">
              <Search className="w-3.5 h-3.5" />
            </span>
            <span>
              Menemukan <strong>{totalItems}</strong> karya untuk kata kunci &ldquo;<span className="text-[#C85A32] font-semibold">{searchQuery}</span>&rdquo;
              {kategoriAktif !== 'Semua' && (
                <span>
                  {' '}
                  pada kategori <em>{kategoriAktif}</em>
                </span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={clearSearch}
            className="inline-flex items-center gap-1.5 text-xs text-[#C85A32] hover:text-[#A94728] font-semibold hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Pencarian</span>
          </button>
        </div>
      )}

      {/* 3. Daftar Kartu Karya yang Cocok (1-Kolom Lebar Bergaya Editorial Sastra) */}
      <div className="space-y-6 sm:space-y-7">
        {totalItems === 0 ? (
          // Empty State
          <div className="bg-[#FFFDF9] rounded-2xl p-8 sm:p-12 text-center border border-[#E8DED6] shadow-2xs">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] flex items-center justify-center text-[#C85A32]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2C2A29] mb-2">
              Aksara Tidak Ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-[#6B625D] max-w-md mx-auto leading-relaxed mb-6">
              {isSearching ? (
                <>
                  Tidak ada karya yang cocok dengan kata kunci &ldquo;
                  <span className="font-semibold text-[#C85A32]">{searchQuery}</span>
                  &rdquo; pada judul, nama penulis, maupun isi bait.
                </>
              ) : (
                'Belum ada karya yang diunggah untuk kategori ini...'
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-[#2C2A29] hover:border-[#C85A32] hover:text-[#C85A32] text-xs font-medium transition cursor-pointer"
                >
                  Tampilkan Semua Karya
                </button>
              )}
              <Link
                href={
                  isSearching
                    ? `/tulis?tema=${encodeURIComponent(searchQuery)}`
                    : '/tulis'
                }
                className="inline-flex items-center gap-2 bg-[#C85A32] hover:bg-[#A94728] text-white px-4 py-2 rounded-xl text-xs font-medium shadow-2xs transition"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>{isSearching ? 'Tulis Karya dengan Kata Kunci Ini' : 'Tulis Karya Sekarang'}</span>
              </Link>
            </div>
          </div>
        ) : (
          paginatedKaryas.map((karya) => {
            const { snippet, isMatchedInContent } = extractMatchingSnippet(
              karya.isi_tulisan,
              searchQuery
            );

            return (
              <article
                key={karya.id}
                className="bg-[#FFFDF9] p-5 sm:p-6 rounded-2xl border border-[#E8DED6] shadow-2xs hover:border-[#C85A32]/40 transition"
              >
                {/* Header Penulis & Info Waktu */}
                <div className="flex items-center gap-3 mb-3.5 pb-3 border-b border-[#E8DED6]">
                  <Link
                    href={
                      karya.user_id
                        ? `/profil/${encodeURIComponent(karya.user_id)}`
                        : '#'
                    }
                    className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#E8DED6] flex items-center justify-center text-[#C85A32] font-semibold text-xs hover:border-[#C85A32] transition shrink-0"
                  >
                    {karya.nama_pengguna.charAt(0).toUpperCase()}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-[#2C2A29] text-sm truncate">
                        <Link
                          href={
                            karya.user_id
                              ? `/profil/${encodeURIComponent(karya.user_id)}`
                              : '#'
                          }
                          className="hover:text-[#C85A32] transition"
                        >
                          <HighlightText
                            text={karya.nama_pengguna}
                            query={searchQuery}
                          />
                        </Link>
                        <span className="border border-[#E8DED6] text-[#6B625D] bg-[#FAF8F5] rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wider ml-2 font-medium">
                          {karya.status_penulis}
                        </span>
                      </p>

                      <time
                        dateTime={
                          karya.created_at
                            ? new Date(karya.created_at).toISOString()
                            : undefined
                        }
                        className="text-[11px] text-[#6B625D] whitespace-nowrap shrink-0"
                        title={formatWaktuLengkap(karya.created_at)}
                      >
                        {formatWaktuRelatif(karya.created_at)}
                      </time>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6B625D] mt-0.5 flex-wrap">
                      <span className="text-[#C85A32] font-semibold">
                        {karya.kategori}
                      </span>
                      {karya.nomor_bab && (
                        <span className="bg-[#FAF8F5] border border-[#E8DED6] text-[#C85A32] px-1.5 py-0.5 rounded-md text-[10px] font-semibold">
                          Bab {karya.nomor_bab}
                        </span>
                      )}
                      {karya.status_cerita && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-[#E8DED6] bg-[#FAF8F5] text-[#6B625D] font-medium">
                          {karya.status_cerita.toLowerCase() === 'tamat' ? 'Tamat' : 'Bersambung'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Judul Karya & Cover Thumbnail */}
                <div className="flex gap-4 items-start mb-3">
                  {karya.gambar_url && (
                    <Link
                      href={`/karya/${karya.id}`}
                      className="w-16 h-22 sm:w-18 sm:h-26 rounded-xl overflow-hidden shrink-0 border border-[#E8DED6] shadow-2xs hover:opacity-95 transition"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={karya.gambar_url}
                        alt={`Sampul ${karya.judul}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    {karya.nama_cerita && karya.nama_cerita !== karya.judul && (
                      <p className="text-xs font-semibold text-[#C85A32] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <BookMarked className="w-3.5 h-3.5" />
                        <span>Seri: {karya.nama_cerita}</span>
                      </p>
                    )}
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2A29] leading-snug">
                      <Link
                        href={`/karya/${karya.id}`}
                        className="hover:text-[#C85A32] transition"
                      >
                        <HighlightText text={karya.judul} query={searchQuery} />
                      </Link>
                    </h3>
                    {karya.judul_bab && (
                      <p className="text-sm font-serif italic text-[#6B625D] mt-0.5">
                        {karya.judul_bab}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sinopsis Singkat */}
                {karya.sinopsis && (
                  <div className="mb-3 px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] text-xs text-[#6B625D] leading-relaxed italic font-serif">
                    <span className="font-semibold not-italic text-[#C85A32] mr-1.5 uppercase text-[9px] tracking-wider">
                      Sinopsis:
                    </span>
                    &ldquo;{karya.sinopsis}&rdquo;
                  </div>
                )}

                {/* Cuplikan Karya (Preview 2-4 baris) */}
                <KaryaSnippetPreview
                  isiTulisan={karya.isi_tulisan}
                  kategori={karya.kategori}
                  searchQuery={searchQuery}
                  isMatchedInContent={isMatchedInContent}
                  snippet={snippet}
                  maxPoemLines={3}
                />

                <div className="pt-2 mb-3">
                  <Link
                    href={`/karya/${karya.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] hover:text-[#A94728] transition group"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Footer Interaksi: Suka & Komentar */}
                <div className="flex items-center gap-5 pt-3 border-t border-[#E8DED6] text-xs text-[#6B625D]">
                  <form action={onLikeAction}>
                    <input type="hidden" name="karyaId" value={karya.id} />
                    <button
                      type="submit"
                      className="hover:text-[#C85A32] flex items-center gap-1.5 transition group cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#C85A32] group-hover:scale-110 transition-transform" />
                      <span>{karya.total_likes || 0} Apresiasi</span>
                    </button>
                  </form>

                  <Link
                    href={`/karya/${karya.id}#komentar`}
                    className="hover:text-[#C85A32] flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#6B625D]" />
                    <span>{karya.total_komentar || 0} Tanggapan</span>
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* 4. Navigasi Nomor Halaman */}
      {totalPages > 1 && (
        <nav
          aria-label="Navigasi Halaman Karya"
          className="pt-8 mt-8 border-t border-[#E8DED6] flex flex-col gap-4 text-xs"
        >
          {/* Baris Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[#6B625D]">
            <p>
              Menampilkan karya{' '}
              <strong className="text-[#2C2A29]">
                {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-[#2C2A29]">
                {Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalItems)}
              </strong>{' '}
              dari <strong className="text-[#2C2A29]">{totalItems}</strong> total karya
            </p>
            <p className="bg-[#FAF8F5] border border-[#E8DED6] text-[#C85A32] px-3 py-1 rounded-xl font-semibold">
              Halaman {safeCurrentPage} dari {totalPages}
            </p>
          </div>

          {/* Deretan Tombol Angka Halaman & Input Lompat */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {/* Tombol Pertama (<<) */}
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={safeCurrentPage === 1}
                title="Ke Halaman Pertama (1)"
                className="p-2 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-[#6B625D] hover:text-[#C85A32] hover:bg-[#FAF8F5] disabled:opacity-35 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Tombol Sebelumnya (<) */}
              <button
                type="button"
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                title="Halaman Sebelumnya"
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-[#6B625D] hover:text-[#C85A32] hover:bg-[#FAF8F5] disabled:opacity-35 transition font-medium cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              {/* Deretan Angka Nomor Halaman */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 h-9 flex items-center justify-center text-[#6B625D]/60"
                      >
                        &hellip;
                      </span>
                    );
                  }

                  const pageNum = item as number;
                  const isCurrent = pageNum === safeCurrentPage;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => goToPage(pageNum)}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={
                        isCurrent
                          ? 'w-9 h-9 rounded-xl bg-[#C85A32] text-white font-semibold shadow-2xs flex items-center justify-center cursor-default'
                          : 'w-9 h-9 rounded-xl bg-[#FFFDF9] border border-[#E8DED6] text-[#6B625D] hover:text-[#C85A32] hover:bg-[#FAF8F5] transition flex items-center justify-center cursor-pointer'
                      }
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Tombol Selanjutnya (>) */}
              <button
                type="button"
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                title="Halaman Selanjutnya"
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-[#6B625D] hover:text-[#C85A32] hover:bg-[#FAF8F5] disabled:opacity-35 transition font-medium cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Tombol Terakhir (>>) */}
              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                title={`Ke Halaman Terakhir (${totalPages})`}
                className="p-2 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-[#6B625D] hover:text-[#C85A32] hover:bg-[#FAF8F5] disabled:opacity-35 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Input Lompat Cepat */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-2 shrink-0">
              <label htmlFor="jump-page-input" className="text-[#6B625D] whitespace-nowrap">
                Lompat ke hal:
              </label>
              <input
                id="jump-page-input"
                type="number"
                min={1}
                max={totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder={String(safeCurrentPage)}
                className="w-16 px-2.5 py-1.5 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-center text-xs text-[#2C2A29] focus:outline-none focus:border-[#C85A32]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] text-[#C85A32] hover:bg-[#C85A32] hover:text-white border border-[#E8DED6] font-medium transition cursor-pointer"
              >
                Buka
              </button>
            </form>
          </div>
        </nav>
      )}
    </div>
  );
}
