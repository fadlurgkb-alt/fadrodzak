import React from 'react';
import Link from 'next/link';
import pool from '../lib/db';
import HeroBanner from '../components/HeroBanner';
import KaryaSearchFeed, { KaryaRow } from '../components/KaryaSearchFeed';
import PWAInstallButton from '../components/PWAInstallButton';
import HeaderSearchBar from '../components/HeaderSearchBar';
import HeaderProfileButton from '../components/HeaderProfileButton';
import LastReadWidget from '../components/LastReadWidget';
import { SearchProvider } from '../components/SearchContext';
import { revalidatePath } from 'next/cache';
import { BookOpen, PenLine, Compass, Coffee, UserRound } from 'lucide-react';

export const revalidate = 30;

interface PageProps {
  searchParams?: Promise<{
    kategori?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const kategoriAktif = resolvedParams?.kategori || 'Semua';

  // Ambil daftar karya sastra dari database
  let initialKaryas: KaryaRow[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT id, judul, kategori, isi_tulisan, nama_pengguna, status_penulis, 
              link_trakteer, gambar_url, user_id, 
              COALESCE(jumlah_suka, 0) as total_likes, 
              COALESCE(jumlah_komentar, 0) as total_komentar,
              created_at, nomor_bab, judul_bab, nama_cerita, sinopsis, status_cerita
       FROM karya 
       ORDER BY created_at DESC 
       LIMIT 100`
    );
    initialKaryas = rows || [];
  } catch (err) {
    console.warn('[HomePage] Notice:', err);
  }

  // Server Action untuk tombol Like / Apresiasi
  async function handleLikeAction(formData: FormData) {
    'use server';
    const karyaId = Number(formData.get('karyaId'));
    if (!karyaId) return;

    try {
      await pool.query('UPDATE karya SET jumlah_suka = COALESCE(jumlah_suka, 0) + 1 WHERE id = $1', [karyaId]);
      revalidatePath('/');
    } catch (e) {
      console.warn('[Like] Notice:', e);
    }
  }

  return (
    <SearchProvider>
      <main className="min-h-screen pb-24 sm:pb-16 text-[#2C2A29]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header Baris Atas: Logo, Search Bar, & Tombol Navigasi Desktop */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EAE2D9]">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A19] tracking-tight">
                Fadrodzak
              </Link>
              {/* Menu Navigasi Desktop (Hanya tampil di Laptop/PC agar layar luas tetap fungsional) */}
              <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-[#5C544F]">
                <Link
                  href="/belajar"
                  className="px-3 py-1.5 rounded-xl hover:text-[#C85A32] hover:bg-[#FAF8F5] transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Belajar</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2.5">
              <HeaderSearchBar />
              <Link
                href="/tulis"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C85A32] hover:bg-[#A94728] text-white rounded-xl text-xs font-medium shadow-xs transition"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Tulis</span>
              </Link>
              <HeaderProfileButton />
            </div>
          </div>

          {/* 1. Hero Banner Berkarakter Editorial */}
          <HeroBanner />

          {/* 2. Banner Pasang Aplikasi Tipis */}
          <div className="mb-8">
            <PWAInstallButton variant="banner" />
          </div>

          {/* 3. Layout Konten: Main Feed (Kiri) + Sidebar Kuratorial (Kanan Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Kolom Kiri: Feed Utama Karya Sastra */}
            <div className="lg:col-span-8">
              <LastReadWidget />
              <KaryaSearchFeed
                initialKaryas={initialKaryas}
                kategoriAktif={kategoriAktif}
                onLikeAction={handleLikeAction}
              />
            </div>

            {/* Kolom Kanan (Desktop): Sidebar Kurasi Editorial Sastra */}
            <aside className="hidden lg:block lg:col-span-4 space-y-6">
              
              {/* Widget 1: Klinik Bedah Karya Spotlight */}
              <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C85A32]">
                  <Compass className="w-4 h-4" />
                  <span>Klinik Bedah Karya</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1C1A19] leading-snug">
                  Telaah Diksi & Rima Sastra
                </h3>
                <p className="text-xs text-[#5C544F] leading-relaxed">
                  Ingin bait puisi atau alur cerpen Anda ditelaah secara mendalam? Kirimkan naskah untuk mendapatkan masukan kurator.
                </p>
                <Link
                  href="/belajar"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] hover:text-[#A94728] transition"
                >
                  <span>Pelajari Klinik Sastra &rarr;</span>
                </Link>
              </div>

              {/* Widget 2: Kategori & Ragam Sastra */}
              <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C85A32]">
                  <BookOpen className="w-4 h-4" />
                  <span>Ragam Aksara</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Puisi', 'Cerpen', 'Pantun', 'Novel', 'Cerbung'].map((kat) => (
                    <Link
                      key={kat}
                      href={`/?kategori=${encodeURIComponent(kat)}`}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D9] text-[#4A4440] hover:text-[#C85A32] hover:border-[#C85A32]/40 transition font-medium"
                    >
                      {kat}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Widget 3: Apresiasi & Ruang Donasi */}
              <div className="bg-[#FAF8F5] border border-[#E2D7CC] rounded-2xl p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1A19]">
                  <Coffee className="w-4 h-4 text-[#C85A32]" />
                  <span>Dukung Penulis Nusantara</span>
                </div>
                <p className="text-xs text-[#5C544F] leading-relaxed">
                  Setiap bait tulisan memiliki jiwa. Anda dapat memberikan apresiasi kopi langsung ke halaman Trakteer penulis di setiap karya.
                </p>
              </div>

            </aside>

          </div>

        </div>
      </main>
    </SearchProvider>
  );
}
