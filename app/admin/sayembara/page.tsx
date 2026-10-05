import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import pool from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth-server';
import {
  ShieldAlert,
  Trophy,
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Award,
  MessageSquare,
  Heart,
  Shuffle,
  Feather,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dasbor Pantau Sayembara — Redaksi Fadrodzak',
  robots: {
    index: false,
    follow: false,
  },
};

interface KaryaAdmin {
  id: number;
  judul: string;
  kategori: string;
  nama_pengguna: string;
  user_id: string;
  isi_tulisan: string;
  total_likes: number;
  total_komentar: number;
  created_at: string | Date;
}

interface KomentarItem {
  id: number;
  karya_id: number;
  nama_pengguna: string;
  isi_komentar: string;
  created_at: string | Date;
  judul_karya?: string;
}

interface ReferralItem {
  id: number;
  referrer_id: string;
  referred_id: string;
  status: string;
  created_at: string | Date;
  verified_at: string | Date | null;
  referrer_nama?: string;
  referred_nama?: string;
}

export default async function AdminSayembaraPage() {
  const currentUser = await getCurrentUser();

  // Validasi Otorisasi: Khusus fadlur.gkb@gmail.com atau role admin
  const isAuthorized =
    currentUser &&
    (currentUser.email === 'fadlur.gkb@gmail.com' ||
      currentUser.email === 'fadlur.gkb-alt@gmail.com');

  if (!isAuthorized) {
    redirect('/profil?error=Akses+khusus+Admin+Sayembara+(fadlur.gkb@gmail.com)');
  }

  // 1. Ambil Semua Karya Sayembara
  let karyaSayembara: KaryaAdmin[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT id, judul, kategori, nama_pengguna, user_id, isi_tulisan,
              COALESCE(jumlah_suka, 0) as total_likes,
              COALESCE(jumlah_komentar, 0) as total_komentar,
              created_at
       FROM karya
       WHERE event_tag = 'sayembara-hujan' OR judul ILIKE '%[Sayembara]%'
       ORDER BY created_at DESC`
    );
    karyaSayembara = rows || [];
  } catch (err) {
    console.warn('[Admin] Query karya notice:', err);
  }

  // 2. Ambil Komentar Terbaru untuk Pantau Pembaca Pilihan
  let komentarList: KomentarItem[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.karya_id, c.nama_pengguna, c.isi_komentar, c.created_at, k.judul as judul_karya
       FROM komentar c
       LEFT JOIN karya k ON k.id = c.karya_id
       ORDER BY c.created_at DESC
       LIMIT 200`
    );
    komentarList = rows || [];
  } catch (err) {
    console.warn('[Admin] Query komentar notice:', err);
  }

  // Kelompokkan komentar per pengguna untuk menghitung keaktifan pembaca
  const pembacaStats: {
    [nama: string]: {
      nama: string;
      totalKomentar: number;
      contohKomentar: string[];
      terakhirAktif: string | Date;
      isSpamProne: boolean;
    };
  } = {};

  komentarList.forEach((c) => {
    const nama = c.nama_pengguna || 'Anonim';
    if (!pembacaStats[nama]) {
      pembacaStats[nama] = {
        nama,
        totalKomentar: 0,
        contohKomentar: [],
        terakhirAktif: c.created_at,
        isSpamProne: false,
      };
    }
    pembacaStats[nama].totalKomentar += 1;
    if (pembacaStats[nama].contohKomentar.length < 3) {
      pembacaStats[nama].contohKomentar.push(c.isi_komentar);
    }
    // Cek apakah komentar terlalu pendek/spam seperti "bagus", "keren"
    if (c.isi_komentar.trim().split(/\s+/).length < 3) {
      pembacaStats[nama].isSpamProne = true;
    }
  });

  const daftarCalonPembaca = Object.values(pembacaStats).sort(
    (a, b) => b.totalKomentar - a.totalKomentar
  );

  // 3. Ambil Data Referral (Pilar Komunitas)
  let referralList: ReferralItem[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.referrer_id, r.referred_id, r.status, r.created_at, r.verified_at,
              COALESCE(p1.nama, r.referrer_id) as referrer_nama,
              COALESCE(p2.nama, r.referred_id) as referred_nama
       FROM referrals r
       LEFT JOIN profil_pengguna p1 ON p1.user_id = r.referrer_id
       LEFT JOIN profil_pengguna p2 ON p2.user_id = r.referred_id
       ORDER BY r.created_at DESC`
    );
    referralList = rows || [];
  } catch (err) {
    console.warn('[Admin] Query referral notice:', err);
  }

  const validReferrals = referralList.filter((r) => r.status === 'published_karya');

  // Server Action untuk Penganugerahan Lencana Juara/Finalis
  async function anugerahiBadgeAction(formData: FormData) {
    'use server';
    const targetUserId = String(formData.get('userId') || '');
    const badgeKode = String(formData.get('badgeKode') || '');
    if (!targetUserId || !badgeKode) return;

    try {
      const bRes = await pool.query('SELECT id FROM badges WHERE kode = $1 LIMIT 1', [badgeKode]);
      const badgeId = bRes.rows[0]?.id;
      if (badgeId) {
        await pool.query(
          'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [targetUserId, badgeId]
        );
      }
    } catch (err) {
      console.warn('[Admin] Anugerahi badge notice:', err);
    }
    revalidatePath('/admin/sayembara');
    revalidatePath('/profil');
  }

  return (
    <main className="min-h-screen pb-28 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-[#2C2A29]">
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-4 border-b border-[#EAE2D9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/profil"
              className="text-xs text-[#C85A32] hover:underline flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Profil
            </Link>
            <span className="text-[#8A817C] text-xs">/</span>
            <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Admin: {currentUser.email}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A19]">
            Dasbor Pantau Sayembara &amp; Komunitas
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/event/sayembara-perintis"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8CEC4] bg-white text-xs font-medium text-[#2C2A29] hover:border-[#C85A32] transition shadow-2xs"
          >
            <span>Buka Halaman Sayembara Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C85A32]" />
          </Link>
        </div>
      </div>

      {/* Bento Counters: Ringkasan 3 Pilar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-[#C85A32] uppercase tracking-wider block mb-1">
            Pilar 1: Penulis (Rp100k)
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A19]">
            {karyaSayembara.length}
          </p>
          <p className="text-xs text-[#5C544F]">Karya Terdaftar</p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
            Pilar 2: Pembaca (Rp50k)
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A19]">
            {daftarCalonPembaca.length}
          </p>
          <p className="text-xs text-[#5C544F]">Pembaca Aktif Terdata</p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Pilar 3: Undian Referral (Rp50k)
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
            {validReferrals.length} <span className="text-xs font-sans text-[#7A6B63]">/ {referralList.length} total</span>
          </p>
          <p className="text-xs text-[#5C544F]">Referral Sah (Sudah Nulis)</p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-[#1C1A19] uppercase tracking-wider block mb-1">
            Total Anggaran Event
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A19]">
            Rp200.000
          </p>
          <p className="text-xs text-emerald-700 font-semibold">Terkendali &amp; Terukur</p>
        </div>
      </div>

      {/* SEKSI 1: PILAR PEMBACA PILIHAN MINGGU INI (Rp50.000) */}
      <section className="mb-12 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A19] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-700" />
              <span>Pantau Calon &ldquo;Pembaca Pilihan Minggu Ini&rdquo; (2 × Rp25.000)</span>
            </h2>
            <p className="text-xs text-[#5C544F]">
              Kriteria: Minimal membaca 5 karya, memberi minimal 3 komentar bermakna (bukan spam satu kata), dan menyimpan karya di rak.
            </p>
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl overflow-hidden shadow-2xs">
          {daftarCalonPembaca.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7A6B63]">
              Belum ada komentar baru yang masuk dari pembaca.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#EAE2D9] text-[#7A6B63] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nama Pembaca</th>
                    <th className="py-3 px-4">Total Komentar</th>
                    <th className="py-3 px-4">Sampel Ulasan Terakhir</th>
                    <th className="py-3 px-4">Kualitas / Status</th>
                    <th className="py-3 px-4 text-right">Aksi Penganugerahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D9]">
                  {daftarCalonPembaca.map((p, idx) => {
                    const isQualified = p.totalKomentar >= 3 && !p.isSpamProne;
                    return (
                      <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition">
                        <td className="py-3.5 px-4 font-semibold text-[#1C1A19]">
                          {p.nama}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-center">
                          {p.totalKomentar}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-[#5C544F] font-serif italic">
                          &ldquo;{p.contohKomentar[0] || '-'}&rdquo;
                        </td>
                        <td className="py-3.5 px-4">
                          {isQualified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Memenuhi Syarat
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                              <Clock className="w-3 h-3" /> {p.totalKomentar}/3 Komentar
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <form action={anugerahiBadgeAction} className="inline-block">
                            <input type="hidden" name="userId" value={p.nama} />
                            <input type="hidden" name="badgeKode" value="pembaca_budiman" />
                            <button
                              type="submit"
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-medium transition cursor-pointer shadow-2xs"
                              title="Anugerahi Lencana Pembaca Budiman"
                            >
                              Pilih Juara Pembaca
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SEKSI 2: PILAR KARYA SAYEMBARA (Rp100.000) */}
      <section className="mb-12 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A19] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#C85A32]" />
              <span>Daftar Naskah Sayembara Masuk ({karyaSayembara.length} Karya)</span>
            </h2>
            <p className="text-xs text-[#5C544F]">
              Tema: &ldquo;Hujan, Rumah, dan Kenangan&rdquo;. Juara 1: Rp50k, Juara 2: Rp30k, Juara 3: Rp20k.
            </p>
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl overflow-hidden shadow-2xs">
          {karyaSayembara.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7A6B63]">
              Belum ada naskah sayembara yang masuk.
            </div>
          ) : (
            <div className="divide-y divide-[#EAE2D9]">
              {karyaSayembara.map((karya) => (
                <div key={karya.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/60 transition">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-wider bg-[#C85A32]/10 px-2 py-0.5 rounded-full">
                        {karya.kategori}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#1C1A19]">
                        {karya.judul}
                      </h3>
                    </div>
                    <p className="text-xs text-[#5C544F]">
                      Penulis: <strong>{karya.nama_pengguna}</strong> • ID Akun: <code className="text-[10px] font-mono text-[#7A6B63]">{karya.user_id}</code>
                    </p>
                    <p className="text-xs font-serif italic text-[#7A6B63] line-clamp-1">
                      &ldquo;{karya.isi_tulisan}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-3 text-xs text-[#7A6B63] mr-2">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>{karya.total_likes}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-[#7A6B63]" />
                        <span>{karya.total_komentar}</span>
                      </span>
                    </div>

                    <Link
                      href={`/karya/${karya.id}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-xl border border-[#D8CEC4] hover:border-[#C85A32] bg-white text-xs font-medium text-[#2C2A29] transition shadow-2xs"
                    >
                      Baca Naskah
                    </Link>

                    {/* Tombol Anugerahi Finalis */}
                    <form action={anugerahiBadgeAction}>
                      <input type="hidden" name="userId" value={karya.user_id} />
                      <input type="hidden" name="badgeKode" value="finalis_aksara" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium transition cursor-pointer"
                        title="Tandai sebagai Finalis Aksara"
                      >
                        🌿 Finalis
                      </button>
                    </form>

                    {/* Tombol Anugerahi Juara */}
                    <form action={anugerahiBadgeAction}>
                      <input type="hidden" name="userId" value={karya.user_id} />
                      <input type="hidden" name="badgeKode" value="juara_sayembara_1" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white text-xs font-medium transition cursor-pointer shadow-2xs"
                        title="Tetapkan sebagai Juara Sayembara"
                      >
                        🏆 Juara
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SEKSI 3: PILAR UNDIAN REFERRAL SAHABAT AKSARA (Rp50.000) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A19] flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>Pantau Referral / Undian Sahabat Aksara (1 Pemenang Rp50.000)</span>
            </h2>
            <p className="text-xs text-[#5C544F]">
              Syarat Sah: Teman yang diajak wajib mendaftar dan mempublikasikan minimal 1 karya asli.
            </p>
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl overflow-hidden shadow-2xs">
          {referralList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7A6B63]">
              Belum ada riwayat pendaftaran melalui referral link.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#EAE2D9] text-[#7A6B63] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Pengundang (Referrer)</th>
                    <th className="py-3 px-4">Teman yang Diajak</th>
                    <th className="py-3 px-4">Status Verifikasi</th>
                    <th className="py-3 px-4">Waktu Daftar</th>
                    <th className="py-3 px-4 text-right">Kelayakan Undian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D9]">
                  {referralList.map((ref) => {
                    const isValid = ref.status === 'published_karya';
                    return (
                      <tr key={ref.id} className="hover:bg-[#FAF8F5]/60 transition">
                        <td className="py-3.5 px-4 font-semibold text-[#1C1A19]">
                          {ref.referrer_nama}
                        </td>
                        <td className="py-3.5 px-4 text-[#5C544F]">
                          {ref.referred_nama}
                        </td>
                        <td className="py-3.5 px-4">
                          {isValid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Sudah Menerbitkan Karya
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                              <Clock className="w-3 h-3" /> Menunggu Karya Pertama
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#7A6B63] font-mono text-[11px]">
                          {new Date(ref.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isValid ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                              🎟️ Masuk Undian Rp50k
                            </span>
                          ) : (
                            <span className="text-[#8A817C] text-[11px]">
                              Belum Sah
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
