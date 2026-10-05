import pool from '../../lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../lib/auth-server';
import GamificationCard from '../../components/GamificationCard';
import BadgeCollection from '../../components/BadgeCollection';
import PWAInstallButton from '../../components/PWAInstallButton';
import LogoutButton from '../../components/LogoutButton';
import StreakWidget from '../../components/StreakWidget';
import KaryaSnippetPreview from '../../components/KaryaSnippetPreview';
import RakBacaanClient from '../../components/RakBacaanClient';
import ProfilTabsClient from '../../components/ProfilTabsClient';
import { formatWaktuRelatif, formatWaktuLengkap } from '../../lib/date';
import {
  ArrowLeft,
  Edit3,
  Feather,
  Heart,
  MessageSquare,
  Coffee,
  BookOpen,
  LogIn,
  Flame,
  Award,
  Bookmark,
  PenLine,
  Plus,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profil Saya',
  description: 'Dasbor pribadi penulis dan pembaca di Fadrodzak.',
  robots: {
    index: false,
    follow: false,
  },
};

interface BadgeItem {
  id: number;
  nama: string;
  deskripsi: string | null;
  icon: string;
  rarity: string;
}

interface KaryaRow {
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

async function hapusKarya(formData: FormData) {
  'use server';

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const karyaId = Number(formData.get('karyaId'));
  if (!Number.isInteger(karyaId) || karyaId <= 0) return;

  try {
    // Bersihkan relasi anak untuk mencegah pelanggaran foreign key constraint
    await pool.query('DELETE FROM reaksi_sastra WHERE karya_id = $1', [karyaId]);
    await pool.query('DELETE FROM tafsir_bait WHERE karya_id = $1', [karyaId]);
    await pool.query('DELETE FROM likes WHERE karya_id = $1', [karyaId]);
    await pool.query('DELETE FROM komentar WHERE karya_id = $1', [karyaId]);
    await pool.query('DELETE FROM karya WHERE id = $1 AND user_id = $2', [
      karyaId,
      user.uid,
    ]);
  } catch (err) {
    console.error('[Profil] Gagal menghapus karya sastra:', err);
  }

  revalidatePath('/profil');
  revalidatePath('/');
}

function toSafeISOString(d: unknown): string | undefined {
  if (!d) return undefined;
  try {
    const dt = d instanceof Date ? d : new Date(d as string | number);
    return isNaN(dt.getTime()) ? undefined : dt.toISOString();
  } catch {
    return undefined;
  }
}

export default async function ProfilPage() {
  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    console.warn('[Profil] Notice membaca sesi user:', err);
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto pb-24 text-[#2C2A29]">
        {/* Header Navigasi Tamu */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8DED6]">
          <Link
            href="/"
            className="text-xs sm:text-sm text-[#C85A32] hover:underline flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
          </Link>
          <span className="text-xs text-[#6B625D]">
            Ruang Akun Sastra
          </span>
        </div>

        {/* Kartu Profil Tamu */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DED6] p-6 sm:p-10 shadow-2xs text-center mb-8 relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-xl bg-[#FAF8F5] text-[#C85A32] border border-[#E8DED6] flex items-center justify-center mb-4 shadow-2xs">
            <Feather className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2A29] mb-2">
            Masuk ke Profil Sastra Anda
          </h1>

          <p className="text-sm text-[#6B625D] max-w-md mx-auto leading-relaxed mb-6">
            Masuk untuk mulai menulis karya puisi &amp; cerita, memantau apresiasi pembaca, mengoleksi lencana sastra, serta melanjutkan bacaan tersimpan di rak buku pribadi Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-6">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white font-medium text-xs sm:text-sm shadow-2xs transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk atau Buat Akun</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] hover:bg-[#FAF8F5] text-xs text-[#6B625D] transition shadow-2xs"
            >
              Jelajahi Beranda Sastra
            </Link>
          </div>

          <div className="border-t border-[#E8DED6] pt-6 mt-6">
            <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[#C85A32] mb-4">
              Fitur Dasbor Penulis &amp; Pembaca Fadrodzak
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-xl border border-[#E8DED6] bg-[#FAF8F5]">
                <div className="flex items-center gap-2 mb-1 text-[#2C2A29]">
                  <BookOpen className="w-4 h-4 text-[#7A8B68]" />
                  <span className="text-xs font-semibold">Publikasi Mandiri</span>
                </div>
                <p className="text-[11px] text-[#6B625D] leading-relaxed">
                  Tulis puisi, cerpen, pantun, dan bab novel bersambung tanpa batasan.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E8DED6] bg-[#FAF8F5]">
                <div className="flex items-center gap-2 mb-1 text-[#2C2A29]">
                  <Flame className="w-4 h-4 text-[#C85A32]" />
                  <span className="text-xs font-semibold">Pena Tak Padam</span>
                </div>
                <p className="text-[11px] text-[#6B625D] leading-relaxed">
                  Pertahankan streak membaca &amp; menulis setiap hari untuk bonus XP.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E8DED6] bg-[#FAF8F5]">
                <div className="flex items-center gap-2 mb-1 text-[#2C2A29]">
                  <Award className="w-4 h-4 text-[#C85A32]" />
                  <span className="text-xs font-semibold">Lencana Aksara</span>
                </div>
                <p className="text-[11px] text-[#6B625D] leading-relaxed">
                  Raih gelar Pujangga, Penenun Kisah, hingga Maestro Sastra.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E8DED6] bg-[#FAF8F5]">
                <div className="flex items-center gap-2 mb-1 text-[#2C2A29]">
                  <Bookmark className="w-4 h-4 text-[#C85A32]" />
                  <span className="text-xs font-semibold">Rak Bacaan Digital</span>
                </div>
                <p className="text-[11px] text-[#6B625D] leading-relaxed">
                  Tandai bab karya favorit dan simpan kemajuan membaca Anda.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rak Bacaan untuk Tamu */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2C2A29] flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#C85A32]" />
                Rak Bacaan Tersimpan
              </h2>
              <p className="text-xs text-[#6B625D]">
                Karya dan bab novel yang pernah Anda tandai di perangkat ini
              </p>
            </div>
          </div>
          <RakBacaanClient />
        </section>
      </main>
    );
  }

  const firebaseUid = currentUser.uid;
  const defaultNama =
    currentUser.name ||
    (currentUser.email ? currentUser.email.split('@')[0] : 'Penulis Sastra');
  const defaultFoto = currentUser.picture || '';

  try {
    let profil = {
      user_id: firebaseUid,
      nama: defaultNama,
      email: currentUser.email || '',
      foto_url: defaultFoto,
      status_badge: 'Pelajar Sastra',
      bio: 'Pena baru di ruang sastra Fadrodzak.',
      link_donasi: '',
    };

    // Eksekusi semua query secara paralel (Promise.all) untuk menghilangkan jeda 6-12 detik
    const [profilRes, gamifRes, badgeRes, karyaRes] = await Promise.all([
      pool
        .query(
          `SELECT user_id, email, nama, foto_url, status_badge, bio, link_donasi
           FROM profil_pengguna
           WHERE user_id = $1
           LIMIT 1`,
          [firebaseUid]
        )
        .catch((err) => {
          console.warn('[Profil] Notice query profil:', err);
          return { rows: [] };
        }),
      pool
        .query(
          `SELECT xp, role, is_donatur, reputasi
           FROM user_gamification
           WHERE user_id = $1
           LIMIT 1`,
          [firebaseUid]
        )
        .catch((err) => {
          console.warn('[Profil] Notice query gamifikasi:', err);
          return { rows: [] };
        }),
      pool
        .query(
          `SELECT b.id, b.nama, b.deskripsi, b.icon, b.rarity
           FROM badges b
           INNER JOIN user_badges ub ON ub.badge_id = b.id
           WHERE ub.user_id = $1
           ORDER BY ub.didapatkan_pada DESC`,
          [firebaseUid]
        )
        .catch((err) => {
          console.warn('[Profil] Notice query badges:', err);
          return { rows: [] };
        }),
      pool
        .query(
          `SELECT id, judul, kategori, isi_tulisan, user_id, created_at,
                  nomor_bab, nama_cerita, sinopsis, status_cerita,
                  COALESCE(jumlah_suka, 0) as total_likes,
                  COALESCE(jumlah_komentar, 0) as total_komentar,
                  COALESCE(jumlah_suka, 0) as jumlah_suka,
                  COALESCE(jumlah_komentar, 0) as jumlah_komentar
           FROM karya
           WHERE user_id = $1
           ORDER BY created_at DESC`,
          [firebaseUid]
        )
        .catch((err) => {
          console.warn('[Profil] Notice query karya:', err);
          return { rows: [] };
        }),
    ]);

    const profilRows = profilRes.rows || [];
    if (profilRows.length > 0) {
      const rawBadge = String(profilRows[0].status_badge || 'Pelajar Sastra');
      const isCorrupted = rawBadge.startsWith('data:');
      const safeBadge = isCorrupted ? 'Pelajar Sastra' : rawBadge;
      const safeFoto = profilRows[0].foto_url || (isCorrupted ? rawBadge : defaultFoto);

      profil = {
        user_id: firebaseUid,
        email: profilRows[0].email || currentUser.email || '',
        nama: profilRows[0].nama || defaultNama,
        foto_url: safeFoto,
        status_badge: safeBadge,
        bio: profilRows[0].bio || 'Pena baru di ruang sastra Fadrodzak.',
        link_donasi: profilRows[0].link_donasi || '',
      };
    } else {
      // Inisialisasi profil di background tanpa memblokir respon
      pool
        .query(
          `INSERT INTO profil_pengguna (user_id, email, nama, foto_url, status_badge, bio, link_donasi)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id) DO NOTHING`,
          [
            firebaseUid,
            currentUser.email || '',
            defaultNama,
            defaultFoto,
            'Pelajar Sastra',
            'Pena baru di ruang sastra Fadrodzak.',
            '',
          ]
        )
        .catch((insertErr) => console.warn('[Profil] Notice async profil:', insertErr));
    }

    let gamification = {
      xp: 0,
      role: 'user',
      isDonatur: false,
      reputasi: 0,
      accountStatus: 'active',
    };

    const gamifRows = gamifRes.rows || [];
    if (gamifRows.length > 0) {
      gamification = {
        xp: Number(gamifRows[0].xp || 0),
        role: String(gamifRows[0].role || 'user'),
        isDonatur: Boolean(gamifRows[0].is_donatur),
        reputasi: Number(gamifRows[0].reputasi || 0),
        accountStatus: 'active',
      };
    } else {
      // Inisialisasi gamifikasi di background tanpa memblokir respon
      pool
        .query(
          `INSERT INTO user_gamification (user_id, xp, role, is_donatur, reputasi)
           VALUES ($1, 0, 'user', false, 0)
           ON CONFLICT (user_id) DO NOTHING`,
          [firebaseUid]
        )
        .catch((insertGamifErr) => console.warn('[Profil] Notice async gamif:', insertGamifErr));
    }

    const badgeRows = badgeRes.rows || [];
    const userBadges: BadgeItem[] = badgeRows.map((b) => ({
      id: Number(b.id || 0),
      nama: String(b.nama || 'Lencana Sastra'),
      deskripsi: b.deskripsi ? String(b.deskripsi) : null,
      icon: String(b.icon || 'medal'),
      rarity: String(b.rarity || 'common'),
    }));

    const karyaList: KaryaRow[] = (karyaRes.rows || []) as KaryaRow[];

    const totalSuka = (karyaList || []).reduce(
      (sum, k) => sum + (k?.total_likes ?? k?.jumlah_suka ?? 0),
      0
    );

    return (
      <main className="min-h-screen p-4 sm:p-6 max-w-2xl mx-auto pb-24 text-[#2C2A29]">
        {/* Header Bersih Ala Aplikasi Mobile */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E8DED6]">
          <Link
            href="/"
            className="text-xs sm:text-sm text-[#C85A32] hover:text-[#A94728] flex items-center gap-1.5 font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>

          <span className="font-serif font-bold text-sm text-[#1C1A19]">
            Profil Penulis
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/profil/edit"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] hover:border-[#C85A32] hover:text-[#C85A32] text-[#6B625D] text-xs font-medium transition shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ubah</span>
            </Link>
            <Link
              href="/tulis"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white text-xs font-semibold shadow-2xs transition"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tulis</span>
            </Link>
            <LogoutButton className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-red-200 bg-red-50/80 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-medium transition shadow-2xs cursor-pointer" />
          </div>
        </div>

        {/* KARTU PROFIL UTAMA (Hero Card Ala App Native) */}
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DED6] p-5 sm:p-6 shadow-2xs mb-6 relative overflow-hidden">
          {/* Aksen Latar Belakang Halus */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-[#C85A32]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Baris Atas: Avatar + Identitas Penulis */}
          <div className="flex items-start gap-4 sm:gap-5 mb-4 relative z-10">
            {/* Foto Profil / Inisial */}
            <div className="relative shrink-0">
              {profil.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profil.foto_url}
                  alt={profil.nama}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#FAF8F5] object-cover shadow-sm ring-1 ring-[#E8DED6]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#EFE7DE] text-[#C85A32] font-serif font-bold text-2xl flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-[#E8DED6]">
                  {profil.nama.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1A19] truncate leading-tight">
                  {profil.nama}
                </h1>
                <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-wider bg-[#C85A32]/10 px-2 py-0.5 rounded-full border border-[#C85A32]/20">
                  {profil.status_badge}
                </span>
                {gamification.role === 'admin' && (
                  <span className="text-[10px] font-bold text-white bg-[#C85A32] px-2 py-0.5 rounded-full">
                    Redaksi
                  </span>
                )}
              </div>

              {profil.email && (
                <p className="text-xs text-[#7A6B63] font-mono truncate mb-2">
                  {profil.email}
                </p>
              )}

              {/* Bio Singkat */}
              <p className="text-xs sm:text-sm font-serif italic text-[#4A4440] leading-relaxed line-clamp-2">
                &ldquo;{profil.bio}&rdquo;
              </p>
            </div>
          </div>

          {/* Baris Statistik Ringkas (Bento Box 3 Kolom) */}
          <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DED6] mb-4 text-center">
            <div className="border-r border-[#E8DED6]/70 pr-1">
              <p className="font-serif font-bold text-base sm:text-lg text-[#1C1A19]">
                {karyaList.length}
              </p>
              <p className="text-[11px] text-[#7A6B63]">Karya Ditulis</p>
            </div>
            <div className="border-r border-[#E8DED6]/70 px-1">
              <p className="font-serif font-bold text-base sm:text-lg text-[#C85A32]">
                {totalSuka}
              </p>
              <p className="text-[11px] text-[#7A6B63]">Apresiasi Suka</p>
            </div>
            <div className="pl-1">
              <p className="font-serif font-bold text-base sm:text-lg text-[#1C1A19]">
                {gamification.xp}
              </p>
              <p className="text-[11px] text-[#7A6B63]">Poin Aksara</p>
            </div>
          </div>

          {/* Tombol Aksi Cepat */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/tulis"
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white text-xs font-semibold shadow-2xs transition"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Tulis Karya Baru</span>
            </Link>

            <Link
              href="/profil/edit"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] hover:bg-[#FAF8F5] text-[#2C2A29] text-xs font-semibold shadow-2xs transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </Link>

            {profil.link_donasi && (
              <a
                href={profil.link_donasi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] hover:bg-[#FAF8F5] text-[#C85A32] text-xs font-semibold shadow-2xs transition"
                title="Buka Trakteer Penulis"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trakteer</span>
              </a>
            )}

            <LogoutButton />
          </div>
        </div>

        {/* KONTEN TABS TERSEGMENTASI (Karya Saya / Rak Bacaan / Prestasi) */}
        <ProfilTabsClient
          karyaList={karyaList}
          gamification={gamification}
          userBadges={userBadges}
          onHapusKarya={hapusKarya}
        />
      </main>
    );
  } catch (pageError) {
    console.error('[ProfilPage Error Handled]:', pageError);
    return (
      <main className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto pb-24 text-[#2C2A29]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8DED6]">
          <Link
            href="/"
            className="text-xs sm:text-sm text-[#C85A32] hover:underline flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/tulis"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white transition text-xs font-medium shadow-2xs"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Tulis Karya</span>
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DED6] p-6 sm:p-8 shadow-2xs mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#FAF8F5] text-[#C85A32] font-serif font-bold text-3xl flex items-center justify-center border border-[#E8DED6] shadow-2xs">
            {defaultNama.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-bold text-[#2C2A29]">{defaultNama}</h1>
            <p className="text-xs text-[#6B625D] font-mono mt-1">{currentUser.email || ''}</p>
            <p className="text-sm text-[#6B625D] italic mt-2">
              Akun Anda aktif. Sedang menyinkronkan data profil ke server. Silakan muat ulang atau buka beranda.
            </p>
            <div className="mt-4 flex items-center gap-3 justify-center sm:justify-start">
              <Link
                href="/profil"
                className="px-4 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-medium shadow-2xs hover:bg-[#A94728] transition"
              >
                Muat Ulang Profil
              </Link>
              <Link
                href="/"
                className="px-4 py-2 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-xs text-[#6B625D] hover:text-[#2C2A29] transition"
              >
                Ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }
}


