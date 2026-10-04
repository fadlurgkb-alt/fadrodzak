import pool from '../../lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../lib/auth-server';
import GamificationCard from '../../components/GamificationCard';
import BadgeCollection from '../../components/BadgeCollection';
import PWAInstallButton from '../../components/PWAInstallButton';
import StreakWidget from '../../components/StreakWidget';
import KaryaSnippetPreview from '../../components/KaryaSnippetPreview';
import RakBacaanClient from '../../components/RakBacaanClient';
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
}

async function hapusKarya(formData: FormData) {
  'use server';

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const karyaId = Number(formData.get('karyaId'));
  if (!Number.isInteger(karyaId) || karyaId <= 0) return;

  await pool.query('DELETE FROM karya WHERE id = $1 AND user_id = $2', [
    karyaId,
    user.uid,
  ]);

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

    try {
      const { rows: profilRows } = await pool.query(
        `SELECT user_id, email, nama, foto_url, status_badge, bio, link_donasi
         FROM profil_pengguna
         WHERE user_id = $1
         LIMIT 1`,
        [firebaseUid]
      );

      if (profilRows && profilRows.length > 0) {
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
        try {
          await pool.query(
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
          );
        } catch (insertErr) {
          console.warn('[Profil] Notice inisialisasi profil_pengguna:', insertErr);
        }
      }
    } catch (err) {
      console.warn('[Profil] Notice membaca profil_pengguna:', err);
    }

    let gamification = {
      xp: 0,
      role: 'user',
      isDonatur: false,
      reputasi: 0,
      accountStatus: 'active',
    };

    try {
      const { rows: gamifRows } = await pool.query(
        `SELECT xp, role, is_donatur, reputasi
         FROM user_gamification
         WHERE user_id = $1
         LIMIT 1`,
        [firebaseUid]
      );

      if (gamifRows && gamifRows.length > 0) {
        gamification = {
          xp: Number(gamifRows[0].xp || 0),
          role: String(gamifRows[0].role || 'user'),
          isDonatur: Boolean(gamifRows[0].is_donatur),
          reputasi: Number(gamifRows[0].reputasi || 0),
          accountStatus: 'active',
        };
      } else {
        try {
          await pool.query(
            `INSERT INTO user_gamification (user_id, xp, role, is_donatur, reputasi)
             VALUES ($1, 0, 'user', false, 0)
             ON CONFLICT (user_id) DO NOTHING`,
            [firebaseUid]
          );
        } catch (insertGamifErr) {
          console.warn('[Profil] Notice inisialisasi gamifikasi:', insertGamifErr);
        }
      }
    } catch (err) {
      console.warn('[Profil] Notice membaca user_gamification:', err);
    }

    let userBadges: BadgeItem[] = [];
    try {
      const { rows: badgeRows } = await pool.query(
        `SELECT b.id, b.nama, b.deskripsi, b.icon, b.rarity
         FROM badges b
         INNER JOIN user_badges ub ON ub.badge_id = b.id
         WHERE ub.user_id = $1
         ORDER BY ub.didapatkan_pada DESC`,
        [firebaseUid]
      );
      userBadges = ((badgeRows as BadgeItem[]) || []).map((b) => ({
        id: Number(b.id || 0),
        nama: String(b.nama || 'Lencana Sastra'),
        deskripsi: b.deskripsi ? String(b.deskripsi) : null,
        icon: String(b.icon || 'medal'),
        rarity: String(b.rarity || 'common'),
      }));
    } catch (err) {
      console.warn('[Profil] Notice membaca user_badges:', err);
      userBadges = [];
    }

    let karyaList: KaryaRow[] = [];
    try {
      const { rows: karyaRows } = await pool.query(
        `SELECT k.*,
           GREATEST(COALESCE(k.jumlah_suka, 0), COALESCE((SELECT COUNT(*)::int FROM likes l WHERE l.karya_id = k.id), 0)) AS total_likes,
           GREATEST(COALESCE(k.jumlah_komentar, 0), COALESCE((SELECT COUNT(*)::int FROM komentar c WHERE c.karya_id = k.id), 0)) AS total_komentar
         FROM karya k
         WHERE k.user_id = $1
         ORDER BY k.created_at DESC`,
        [firebaseUid]
      );
      karyaList = Array.isArray(karyaRows) ? (karyaRows as KaryaRow[]) : [];
    } catch (err) {
      console.warn('[Profil] Notice membaca karya milik user dengan subquery:', err);
      try {
        const { rows: simpleRows } = await pool.query(
          'SELECT * FROM karya WHERE user_id = $1 ORDER BY created_at DESC',
          [firebaseUid]
        );
        karyaList = Array.isArray(simpleRows) ? (simpleRows as KaryaRow[]) : [];
      } catch {
        karyaList = [];
      }
    }

    const totalSuka = (karyaList || []).reduce(
      (sum, k) => sum + (k?.total_likes ?? k?.jumlah_suka ?? 0),
      0
    );

    return (
      <main className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto pb-24 text-[#2C2A29]">
        {/* Header Navigasi Profil */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8DED6]">
          <Link
            href="/"
            className="text-xs sm:text-sm text-[#C85A32] hover:underline flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              href="/profil/edit"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-[#6B625D] hover:text-[#C85A32] hover:border-[#C85A32] transition text-xs shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah Profil</span>
            </Link>
            <Link
              href="/tulis"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white transition text-xs font-medium shadow-2xs"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Tulis Karya</span>
            </Link>
          </div>
        </div>

        {/* Kartu Profil Utama */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DED6] p-6 sm:p-8 shadow-2xs mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar Profil */}
            {profil.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profil.foto_url}
                alt={profil.nama}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#E8DED6] object-cover shadow-2xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FAF8F5] text-[#C85A32] font-serif font-bold text-3xl flex items-center justify-center border border-[#E8DED6] shadow-2xs">
                {profil.nama.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2A29]">
                  {profil.nama}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg text-xs bg-[#FAF8F5] text-[#C85A32] border border-[#E8DED6] font-medium">
                  {profil.status_badge}
                </span>
                {gamification.role === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-[#FAF8F5] text-[#C85A32] border border-[#E8DED6]">
                    Redaksi
                  </span>
                )}
              </div>

              {profil.email && (
                <p className="text-xs text-[#6B625D] font-mono mb-3">
                  {profil.email}
                </p>
              )}

              <p className="text-sm font-serif text-[#45413E] italic leading-relaxed mb-4 max-w-xl">
                &ldquo;{profil.bio}&rdquo;
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#6B625D]">
                <span className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8DED6]">
                  <BookOpen className="w-3.5 h-3.5 text-[#7A8B68]" /> {karyaList.length} Karya Diterbitkan
                </span>
                <span className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8DED6]">
                  <Heart className="w-3.5 h-3.5 text-[#C85A32] fill-[#C85A32]/20" /> {totalSuka} Total Apresiasi
                </span>
                <a
                  href={profil.link_donasi || 'https://trakteer.id/ahmad_rahman7/tip'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#C85A32] hover:underline bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8DED6] transition"
                >
                  <Coffee className="w-3.5 h-3.5" /> Dukung via Trakteer &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Pasang Aplikasi PWA */}
        <div className="mb-6">
          <PWAInstallButton variant="banner" />
        </div>

        {/* Hadiah Login Beruntung */}
        <div className="mb-6">
          <StreakWidget />
        </div>

        {/* Gamifikasi & XP Card */}
        <div className="mb-8">
          <GamificationCard
            xp={gamification.xp}
            role={gamification.role}
            isDonatur={gamification.isDonatur}
            reputasi={gamification.reputasi}
          />
        </div>

        {/* Koleksi Lencana */}
        <section className="mb-8">
          <BadgeCollection badges={userBadges} />
        </section>

        {/* Rak Bacaan & Penanda Buku */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2C2A29] flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#C85A32]" />
                Rak Bacaan &amp; Penanda Buku
              </h2>
              <p className="text-xs text-[#6B625D]">
                Lanjutkan membaca karya dan bab novel yang telah Anda tandai
              </p>
            </div>
          </div>
          <RakBacaanClient />
        </section>

        {/* Daftar Karya Pribadi */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2C2A29]">
                Karya Sastra Saya
              </h2>
              <p className="text-xs text-[#6B625D]">
                Kelola tulisan dan pantau apresiasi dari para pembaca
              </p>
            </div>
            <Link
              href="/tulis"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#C85A32] hover:underline"
            >
              <PenLine className="w-3 h-3" />
              <span>Tulis Karya Baru</span>
            </Link>
          </div>

          {karyaList.length === 0 ? (
            <div className="bg-[#FFFDF9] rounded-2xl border border-dashed border-[#E8DED6] p-10 text-center">
              <Feather className="w-8 h-8 text-[#C85A32] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-serif font-bold text-[#2C2A29] mb-1">
                Belum ada karya yang diterbitkan
              </h3>
              <p className="text-xs text-[#6B625D] mb-5 max-w-md mx-auto leading-relaxed">
                Setiap bait puisi dan jalinan kisah bermula dari keberanian menuangkan kata pertama.
              </p>
              <Link
                href="/tulis"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white text-xs font-medium shadow-2xs transition"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Terbitkan Karya Pertama</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {karyaList.map((karya) => (
                <article
                  key={karya.id}
                  className="bg-[#FFFDF9] p-5 sm:p-6 rounded-2xl border border-[#E8DED6] shadow-2xs transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[11px] font-semibold text-[#C85A32] uppercase tracking-wider">
                        {karya.kategori}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-[#2C2A29] mt-0.5">
                        <Link
                          href={`/karya/${karya.id}`}
                          className="hover:text-[#C85A32] transition"
                        >
                          {karya.judul}
                        </Link>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/karya/${karya.id}`}
                        className="text-xs text-[#C85A32] hover:underline px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8DED6]"
                      >
                        Baca &rarr;
                      </Link>
                      <form action={hapusKarya}>
                        <input type="hidden" name="karyaId" value={karya.id} />
                        <button
                          type="submit"
                          className="text-xs text-[#6B625D] hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="Hapus karya ini"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </div>

                  <KaryaSnippetPreview
                    isiTulisan={karya.isi_tulisan || ''}
                    kategori={karya.kategori || 'Puisi'}
                    maxPoemLines={3}
                  />

                  <div className="flex items-center gap-4 text-xs text-[#6B625D] pt-3 border-t border-[#E8DED6]">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-[#C85A32] fill-[#C85A32]/20" /> {karya.total_likes ?? karya.jumlah_suka ?? 0} Suka
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#6B625D]" /> {karya.total_komentar ?? karya.jumlah_komentar ?? 0} Komentar
                    </span>
                    <time
                      dateTime={toSafeISOString(karya.created_at)}
                      className="ml-auto text-[11px] text-[#6B625D] hover:text-[#C85A32] transition"
                      title={formatWaktuLengkap(karya.created_at)}
                    >
                      {formatWaktuRelatif(karya.created_at)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
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
          <div className="flex items-center gap-3">
            <Link
              href="/tulis"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white transition text-xs font-medium shadow-2xs"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Tulis Karya</span>
            </Link>
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
