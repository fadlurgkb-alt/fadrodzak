import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import pool from '../../../lib/db';
import {
  Sparkles,
  Trophy,
  BookOpen,
  Users,
  Feather,
  ArrowLeft,
  PenLine,
  CheckCircle2,
  Calendar,
  Share2,
  Gift,
  Heart,
  MessageSquare,
  ShieldCheck,
  Award,
} from 'lucide-react';
import ShareSayembaraButton from './ShareSayembaraButton';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Sayembara Sastra Fadrodzak — Tema: Hujan, Rumah, dan Kenangan',
  description:
    'Ikuti Sayembara Sastra Perintis Fadrodzak. Total hadiah Rp200.000 untuk Penulis, Pembaca Pilihan, dan Sahabat Aksara. Terbuka untuk umum dan gratis.',
  openGraph: {
    title: 'Sayembara Sastra Fadrodzak — Hujan, Rumah, dan Kenangan',
    description:
      'Total hadiah Rp200.000 untuk Penulis & Pembaca. Daftarkan karya puisi atau cerpen Anda sekarang!',
    type: 'website',
  },
};

interface KaryaPeserta {
  id: number;
  judul: string;
  kategori: string;
  nama_pengguna: string;
  status_penulis: string;
  isi_tulisan: string;
  total_likes: number;
  total_komentar: number;
  created_at: string | Date;
}

export default async function SayembaraPerintisPage({
  searchParams,
}: {
  searchParams?: Promise<{ submitted?: string }>;
}) {
  const params = (await searchParams) || {};
  const isSubmitted = params.submitted === 'true';

  // Ambil karya yang didaftarkan ke sayembara
  let pesertaKaryas: KaryaPeserta[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT id, judul, kategori, nama_pengguna, status_penulis, isi_tulisan,
              COALESCE(jumlah_suka, 0) as total_likes,
              COALESCE(jumlah_komentar, 0) as total_komentar,
              created_at
       FROM karya
       WHERE event_tag = 'sayembara-hujan' 
          OR judul ILIKE '%[Sayembara]%' 
          OR judul ILIKE '%Hujan, Rumah%'
       ORDER BY created_at DESC
       LIMIT 50`
    );
    pesertaKaryas = rows || [];
  } catch (err) {
    console.warn('[Sayembara] Query notice:', err);
  }

  return (
    <main className="min-h-screen pb-28 pt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-[#2C2A29]">
      {/* Notifikasi Sukses Kirim Karya */}
      {isSubmitted && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong>Karya Berhasil Didaftarkan!</strong> Naskah Anda kini resmi masuk dalam kurasi sayembara dan lencana <strong>✒️ Peserta Sayembara I</strong> telah disematkan di profil Anda.
            </div>
          </div>
          <Link
            href="/profil"
            className="text-xs font-semibold text-emerald-700 underline shrink-0"
          >
            Lihat Profil
          </Link>
        </div>
      )}

      {/* Header Navigasi */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EAE2D9]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#C85A32] hover:text-[#A94728] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="text-xs text-[#5C544F] font-serif italic">
          Sayembara Sastra Perintis 2026
        </span>
      </div>

      {/* HERO SECTION SAYEMBARA */}
      <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-3xl p-6 sm:p-10 shadow-xs mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#C85A32]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/20 text-[#C85A32] text-xs font-serif tracking-wider uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sayembara Menulis Fadrodzak Perdana</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1C1A19] tracking-tight leading-[1.12]">
            Hujan, Rumah, dan Kenangan
          </h1>

          <p className="font-serif italic text-base sm:text-xl text-[#C85A32]">
            &ldquo;Setiap tetes hujan yang jatuh di genting rumah tua selalu membawa pulang nama-nama yang pernah kita doakan.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[#4A4440] leading-relaxed font-sans">
            Fadrodzak mengundang para penenun kata, penulis pemula, dan pencinta sastra Nusantara untuk menuangkan karya puisi dan cerpen terbaik Anda. Gratis tanpa biaya pendaftaran, dinilai secara berimbang, dan berhadiah tunai langsung.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/tulis?event=sayembara-perintis&kategori=Cerpen"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C85A32] hover:bg-[#A94728] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>Tulis &amp; Kirim Karya Sekarang</span>
            </Link>

            <ShareSayembaraButton />
          </div>

          {/* Ringkasan Meta Event */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#EAE2D9] text-xs">
            <div>
              <span className="text-[#7A6B63] block text-[11px]">Total Hadiah</span>
              <strong className="font-serif text-sm text-[#1C1A19]">Rp200.000</strong>
            </div>
            <div>
              <span className="text-[#7A6B63] block text-[11px]">Biaya Pendaftaran</span>
              <strong className="text-emerald-700 font-semibold">100% Gratis</strong>
            </div>
            <div>
              <span className="text-[#7A6B63] block text-[11px]">Kategori Karya</span>
              <strong className="text-[#1C1A19]">Cerpen &amp; Puisi</strong>
            </div>
            <div>
              <span className="text-[#7A6B63] block text-[11px]">Batas Pengiriman</span>
              <strong className="text-[#C85A32]">12 Oktober 2026</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3 PILAR ALOKASI HADIAH (Rp200.000) */}
      <section className="mb-12 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A19]">
            Alokasi Hadiah Transparan
          </h2>
          <p className="text-xs sm:text-sm text-[#5C544F]">
            Hadiah tidak hanya untuk penulis, tapi juga untuk pembaca aktif dan sahabat yang mengajak kawan berkarya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pilar 1: Penulis */}
          <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32]">
                  Pilar Utama • Rp100.000
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1C1A19]">
                  Karya Terbaik Penulis
                </h3>
              </div>
              <p className="text-xs text-[#5C544F] leading-relaxed">
                Dinilai berdasarkan kekuatan diksi, keutuhan alur, dan sentuhan emosional tema.
              </p>
              <div className="space-y-2 pt-2 border-t border-[#EAE2D9] text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>🥇 Juara 1</span>
                  <strong className="font-serif text-[#C85A32]">Rp50.000 + 🏆 Badge</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>🥈 Juara 2</span>
                  <strong className="font-serif text-[#1C1A19]">Rp30.000 + 🌿 Badge</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>🥉 Juara 3</span>
                  <strong className="font-serif text-[#1C1A19]">Rp20.000 + 🌿 Badge</strong>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#7A6B63] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE2D9]">
              Semua peserta valid otomatis memperoleh lencana <strong>✒️ Peserta Sayembara I</strong> di profil.
            </div>
          </div>

          {/* Pilar 2: Pembaca Pilihan */}
          <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Pilar Apresiasi • Rp50.000
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1C1A19]">
                  Pembaca Pilihan Minggu Ini
                </h3>
              </div>
              <p className="text-xs text-[#5C544F] leading-relaxed">
                Platform sastra hidup karena pembaca. Dua pembaca paling berdedikasi mendapatkan hadiah tunai.
              </p>
              <div className="space-y-2 pt-2 border-t border-[#EAE2D9] text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>📖 Pembaca Pilihan 1</span>
                  <strong className="font-serif text-[#1C1A19]">Rp25.000</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>📖 Pembaca Pilihan 2</span>
                  <strong className="font-serif text-[#1C1A19]">Rp25.000</strong>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#7A6B63] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE2D9] space-y-1">
              <strong>Syarat:</strong> Baca min. 5 karya, tinggalkan min. 3 komentar ulasan bermakna (bukan spam satu kata), dan simpan min. 2 karya di rak bacaan.
            </div>
          </div>

          {/* Pilar 3: Ajak Penulis */}
          <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Pilar Komunitas • Rp50.000
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1C1A19]">
                  Undian Sahabat Aksara
                </h3>
              </div>
              <p className="text-xs text-[#5C544F] leading-relaxed">
                Ajak kawan penulis Anda bergabung dan berkarya di ruang sastra Fadrodzak.
              </p>
              <div className="space-y-2 pt-2 border-t border-[#EAE2D9] text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>🎟️ 1 Pemenang Undian</span>
                  <strong className="font-serif text-emerald-700">Rp50.000 Tunai</strong>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#7A6B63] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE2D9] space-y-1">
              <strong>Syarat:</strong> Teman yang diajak mendaftar akun asli dan menerbitkan minimal 1 karya sah. (Bukan bot/multi-akun kosong).
            </div>
          </div>
        </div>
      </section>

      {/* KETENTUAN & SISTEM PENILAIAN BEBAS BOT */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
            <Feather className="w-4 h-4" />
            <span>Ketentuan Naskah</span>
          </div>
          <h3 className="font-serif font-bold text-lg text-[#1C1A19]">
            Aturan Penulisan Karya
          </h3>
          <ul className="space-y-2 text-xs text-[#4A4440] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#C85A32] font-bold">•</span>
              <span>Karya harus original ciptaan sendiri, belum pernah memenangkan sayembara lain, dan bukan hasil generate AI mentah tanpa pengolahan rasa.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C85A32] font-bold">•</span>
              <span>Bisa berbentuk <strong>Cerpen</strong> (700 – 1.500 kata) atau <strong>Puisi</strong> (minimal 3 bait mendalam).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C85A32] font-bold">•</span>
              <span>Diposting langsung di Fadrodzak melalui menu <strong>Tulis Karya</strong> dengan mencentang opsi sayembara.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C85A32] font-bold">•</span>
              <span>Satu akun diperbolehkan mengirimkan maksimal 2 karya terbaik.</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Sistem Penilaian Adil</span>
          </div>
          <h3 className="font-serif font-bold text-lg text-[#1C1A19]">
            Bebas Manipulasi &amp; Bot Like
          </h3>
          <p className="text-xs text-[#5C544F] leading-relaxed">
            Pemenang tidak ditentukan semata-mata oleh adu like akun palsu, melainkan formula kurasi berimbang:
          </p>
          <div className="space-y-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D9] flex justify-between items-center">
              <span><strong>60%</strong> — Kurasi Kualitas Sastra (Diksi, Alur, Emosi)</span>
              <span className="text-[11px] text-[#7A6B63]">Dewan Redaksi</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D9] flex justify-between items-center">
              <span><strong>20%</strong> — Apresiasi Suka Organik</span>
              <span className="text-[11px] text-[#7A6B63]">Pembaca</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D9] flex justify-between items-center">
              <span><strong>20%</strong> — Diskusi &amp; Komentar Berkualitas</span>
              <span className="text-[11px] text-[#7A6B63]">Kritik Sastra</span>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER FOUNDING MEMBER PERINTIS FADRODZAK */}
      <section className="mb-12 p-6 rounded-3xl bg-gradient-to-r from-[#2C2A29] to-[#1C1A19] text-[#FFFDF9] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C85A32]/30 text-[#E8DED6] text-[10px] uppercase tracking-wider font-mono">
              <span>🪶 Hak Istimewa Founding Member</span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
              Lencana &ldquo;Perintis Fadrodzak&rdquo; untuk 500 Pengguna Pertama
            </h3>
            <p className="text-xs sm:text-sm text-[#D8CEC4] leading-relaxed">
              Sebagai apresiasi bagi yang bergabung di awal pembangunan komunitas ini, 500 pendaftar pertama otomatis disematkan lencana legendaris <strong>Perintis Fadrodzak</strong> yang tidak akan pernah bisa didapatkan lagi di masa mendatang.
            </p>
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#A94728] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition shrink-0 text-center"
          >
            Daftar / Masuk Akun
          </Link>
        </div>
      </section>

      {/* DAFTAR KARYA PESERTA YANG SUDAH MASUK */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1A19]">
              Karya Peserta Sayembara
            </h2>
            <p className="text-xs text-[#5C544F]">
              Karya-karya yang telah didaftarkan dalam tema &ldquo;Hujan, Rumah, dan Kenangan&rdquo; ({pesertaKaryas.length} karya)
            </p>
          </div>

          <Link
            href="/tulis?event=sayembara-perintis"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C85A32] hover:bg-[#A94728] text-white rounded-xl text-xs font-medium shadow-2xs transition"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Kirim Karyamu</span>
          </Link>
        </div>

        {pesertaKaryas.length === 0 ? (
          <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-10 text-center space-y-3">
            <Feather className="w-8 h-8 text-[#C85A32] mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#1C1A19]">
              Jadilah Penulis Pertama yang Mendaftarkan Karya!
            </h3>
            <p className="text-xs text-[#5C544F] max-w-md mx-auto">
              Belum ada naskah yang terdaftar. Tumpahkan cerita Anda sekarang dan raih peluang memenangkan hadiah serta lencana perintis.
            </p>
            <Link
              href="/tulis?event=sayembara-perintis&kategori=Cerpen"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#C85A32] text-white rounded-xl text-xs font-semibold shadow-2xs hover:bg-[#A94728] transition"
            >
              <PenLine className="w-4 h-4" />
              <span>Mulai Tulis Naskah Sayembara</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pesertaKaryas.map((karya) => (
              <Link
                key={karya.id}
                href={`/karya/${karya.id}`}
                className="group bg-[#FFFDF9] border border-[#E2D7CC] hover:border-[#C85A32]/60 rounded-2xl p-5 shadow-2xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#7A6B63]">
                    <span className="font-semibold text-[#C85A32] uppercase tracking-wider">
                      {karya.kategori}
                    </span>
                    <span className="bg-[#C85A32]/10 text-[#C85A32] px-2 py-0.5 rounded-full font-medium">
                      Peserta Sayembara
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#1C1A19] group-hover:text-[#C85A32] transition line-clamp-1">
                    {karya.judul}
                  </h3>

                  <p className="text-xs text-[#5C544F] font-serif italic line-clamp-3 leading-relaxed">
                    &ldquo;{karya.isi_tulisan}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE2D9] flex items-center justify-between text-xs text-[#7A6B63]">
                  <span className="font-medium text-[#1C1A19] truncate max-w-[150px]">
                    Oleh: {karya.nama_pengguna}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Heart className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>{karya.total_likes}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#7A6B63]" />
                      <span>{karya.total_komentar}</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
