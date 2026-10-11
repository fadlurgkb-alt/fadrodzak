'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Bookmark,
  Award,
  PenLine,
  Plus,
  Edit3,
  Heart,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import KaryaSnippetPreview from './KaryaSnippetPreview';
import RakBacaanClient from './RakBacaanClient';
import GamificationCard from './GamificationCard';
import BadgeCollection from './BadgeCollection';
import StreakWidget from './StreakWidget';
import PWAInstallButton from './PWAInstallButton';
import { formatWaktuRelatif, formatWaktuLengkap } from '../lib/date';

export interface ProfilKaryaItem {
  id: number;
  judul: string;
  kategori: string;
  isi_tulisan: string;
  user_id?: string;
  jumlah_suka?: number;
  total_likes?: number;
  jumlah_komentar?: number;
  total_komentar?: number;
  created_at: string | Date;
  nomor_bab?: number | null;
  nama_cerita?: string | null;
  sinopsis?: string | null;
  status_cerita?: string | null;
}

interface BadgeItem {
  id: number;
  nama: string;
  deskripsi: string | null;
  icon: string;
  rarity: string;
}

interface ProfilTabsClientProps {
  karyaList: ProfilKaryaItem[];
  gamification: {
    xp: number;
    role: string;
    isDonatur: boolean;
    reputasi: number;
    accountStatus: string;
  };
  userBadges: BadgeItem[];
  onHapusKarya: (formData: FormData) => Promise<void>;
}

export default function ProfilTabsClient({
  karyaList,
  gamification,
  userBadges,
  onHapusKarya,
}: ProfilTabsClientProps) {
  const [activeTab, setActiveTab] = useState<'karya' | 'rak' | 'prestasi'>('karya');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalKarya = karyaList.length;

  return (
    <div className="space-y-6">
      {/* Segmented Control / Tab Switcher (Ala Aplikasi Ponsel Modern) */}
      <div className="bg-[#EFE7DE] p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-[#E2D4C5]">
        <button
          type="button"
          onClick={() => setActiveTab('karya')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'karya'
              ? 'bg-[#FFFDF9] text-[#1C1A19] shadow-xs scale-100 font-bold'
              : 'text-[#6B625D] hover:text-[#1C1A19]'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'karya' ? 'text-[#C85A32]' : ''}`} />
          <span>Karya Saya</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'karya'
                ? 'bg-[#C85A32]/10 text-[#C85A32]'
                : 'bg-black/5 text-[#7A6B63]'
            }`}
          >
            {totalKarya}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rak')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'rak'
              ? 'bg-[#FFFDF9] text-[#1C1A19] shadow-xs scale-100 font-bold'
              : 'text-[#6B625D] hover:text-[#1C1A19]'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'rak' ? 'text-[#C85A32]' : ''}`} />
          <span>Rak Bacaan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prestasi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'prestasi'
              ? 'bg-[#FFFDF9] text-[#1C1A19] shadow-xs scale-100 font-bold'
              : 'text-[#6B625D] hover:text-[#1C1A19]'
          }`}
        >
          <Award className={`w-3.5 h-3.5 ${activeTab === 'prestasi' ? 'text-[#C85A32]' : ''}`} />
          <span>Prestasi</span>
          {gamification.xp > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#C85A32]/10 text-[#C85A32]">
              {gamification.xp} XP
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: KARYA SAYA (DAFTAR TULISAN PENULIS)               */}
      {/* ======================================================== */}
      {activeTab === 'karya' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1C1A19]">
                Naskah &amp; Publikasi Saya
              </h3>
              <p className="text-xs text-[#7A6B63]">
                Kelola tulisan, lanjutkan bab, atau edit naskah karya Anda
              </p>
            </div>
            <Link
              href="/tulis"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C85A32] text-white hover:bg-[#A94728] text-xs font-semibold shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Baru</span>
            </Link>
          </div>

          {karyaList.length === 0 ? (
            <div className="bg-[#FFFDF9] rounded-2xl border border-dashed border-[#E2D4C5] p-8 sm:p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mx-auto mb-3">
                <PenLine className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#1C1A19] mb-1">
                Belum ada naskah yang diterbitkan
              </h4>
              <p className="text-xs text-[#7A6B63] mb-5 max-w-sm mx-auto leading-relaxed">
                Torehkan bait puisi pertama Anda atau mulai bab pembuka dari kisah novel Anda hari ini.
              </p>
              <Link
                href="/tulis"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Menulis Naskah</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {karyaList.map((karya) => {
                const isCerita =
                  (karya.kategori || '').toLowerCase().includes('novel') ||
                  (karya.kategori || '').toLowerCase().includes('cerbung') ||
                  Boolean(karya.nama_cerita);
                const nextBabNumber = (Number(karya.nomor_bab) || 1) + 1;
                const seriesName = karya.nama_cerita || karya.judul;
                const isDeletingThis = deletingId === karya.id;

                return (
                  <article
                    key={karya.id}
                    className="bg-[#FFFDF9] p-4.5 sm:p-5 rounded-2xl border border-[#E8DED6] shadow-2xs hover:border-[#C85A32]/40 transition duration-150"
                  >
                    {/* Header Kartu: Kategori & Judul */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-wider bg-[#C85A32]/10 px-2 py-0.5 rounded-full">
                            {karya.kategori}
                          </span>
                          {karya.nomor_bab && (
                            <span className="text-[10px] font-serif font-bold px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#C85A32] border border-[#E8DEC0]">
                              Bab {karya.nomor_bab}
                            </span>
                          )}
                          {karya.nama_cerita && karya.nama_cerita !== karya.judul && (
                            <span className="text-[11px] text-[#7A6B63] font-serif truncate">
                              Seri: <strong>{karya.nama_cerita}</strong>
                            </span>
                          )}
                        </div>

                        <h4 className="text-base sm:text-lg font-serif font-bold text-[#1C1A19] leading-snug">
                          <Link
                            href={`/karya/${karya.id}`}
                            className="hover:text-[#C85A32] transition"
                          >
                            {karya.judul}
                          </Link>
                        </h4>
                      </div>

                      {/* Tombol Aksi Cepat (Model Tombol Modern HP) */}
                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        {/* Tombol Tambah Bab (Khusus Novel/Cerbung) */}
                        {isCerita && (
                          <Link
                            href={`/tulis?nama_cerita=${encodeURIComponent(seriesName)}&nomor_bab=${nextBabNumber}&kategori=Novel+%26+Cerbung&sinopsis=${encodeURIComponent(karya.sinopsis || '')}`}
                            className="text-xs text-white bg-[#C85A32] hover:bg-[#A94728] px-2.5 py-1.5 rounded-xl font-semibold shadow-2xs transition inline-flex items-center gap-1 shrink-0"
                            title="Tulis bab selanjutnya dari kisah ini"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Bab {nextBabNumber}</span>
                          </Link>
                        )}

                        {/* Tombol Edit */}
                        <Link
                          href={`/karya/${karya.id}/edit`}
                          className="text-xs text-[#2C2A29] hover:text-[#C85A32] px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] hover:border-[#C85A32] transition inline-flex items-center gap-1 font-medium"
                          title="Edit naskah karya"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>

                        {/* Tombol Baca */}
                        <Link
                          href={`/karya/${karya.id}`}
                          className="text-xs text-[#6B625D] hover:text-[#C85A32] px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] transition"
                          title="Buka ruang baca"
                        >
                          Baca
                        </Link>

                        {/* Tombol Hapus */}
                        <form
                          action={async (fd) => {
                            if (!window.confirm('Yakin ingin menghapus karya ini secara permanen?')) {
                              return;
                            }
                            setDeletingId(karya.id);
                            await onHapusKarya(fd);
                            setDeletingId(null);
                          }}
                        >
                          <input type="hidden" name="karyaId" value={karya.id} />
                          <button
                            type="submit"
                            disabled={isDeletingThis}
                            className="text-xs text-[#8E867E] hover:text-red-700 p-1.5 rounded-xl hover:bg-red-50 transition cursor-pointer"
                            title="Hapus naskah"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Pratinjau Teks */}
                    <div className="my-2">
                      <KaryaSnippetPreview
                        isiTulisan={karya.isi_tulisan || ''}
                        kategori={karya.kategori || 'Puisi'}
                        maxPoemLines={2}
                      />
                    </div>

                    {/* Metadata Bawah */}
                    <div className="flex items-center gap-4 text-xs text-[#7A6B63] pt-2.5 border-t border-[#E8DED6]">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-[#C85A32] fill-[#C85A32]/20" />
                        <span>{karya.total_likes ?? karya.jumlah_suka ?? 0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-[#7A6B63]" />
                        <span>{karya.total_komentar ?? karya.jumlah_komentar ?? 0}</span>
                      </span>
                      <time
                        dateTime={
                          karya.created_at ? new Date(karya.created_at).toISOString() : undefined
                        }
                        className="ml-auto text-[11px] text-[#7A6B63]"
                        title={formatWaktuLengkap(karya.created_at)}
                      >
                        {formatWaktuRelatif(karya.created_at)}
                      </time>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB 2: RAK BACAAN (PENANDA BUKU & KEMAJUAN BACA)          */}
      {/* ======================================================== */}
      {activeTab === 'rak' && (
        <section className="space-y-4 animate-in fade-in duration-150">
          <div className="px-1">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1C1A19]">
              Rak Bacaan Pribadi
            </h3>
            <p className="text-xs text-[#7A6B63]">
              Karya sastra dan bab novel yang Anda simpan untuk dibaca kembali
            </p>
          </div>
          <RakBacaanClient />
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PRESTASI & LENCANA (GAMIFIKASI, XP, STREAK)       */}
      {/* ======================================================== */}
      {activeTab === 'prestasi' && (
        <section className="space-y-6 animate-in fade-in duration-150">
          {/* Nyala Pena / Daily Streak Widget */}
          <StreakWidget />

          {/* Kartu Tingkat Aksara & XP */}
          <GamificationCard
            xp={gamification.xp}
            role={gamification.role}
            isDonatur={gamification.isDonatur}
            reputasi={gamification.reputasi}
          />

          {/* Koleksi Lencana Kehormatan */}
          <BadgeCollection badges={userBadges} />

          {/* Banner PWA Tambahan */}
          <div className="pt-2">
            <PWAInstallButton variant="banner" />
          </div>
        </section>
      )}
    </div>
  );
}
