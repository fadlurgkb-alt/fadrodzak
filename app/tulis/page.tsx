import React from 'react';
import Link from 'next/link';
import pool from '../../lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../../lib/auth-server';
import SubmitButton from '../../components/SubmitButton';
import { PenLine, BookOpen, Feather, ArrowLeft, Image, Volume2, Sparkles, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TulisKaryaPage() {
  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    console.warn('[Tulis] Notice sesi:', err);
  }

  // Ambil profil penulis jika sudah login
  let authorProfile = {
    nama: currentUser?.name || 'Penenun Kata',
    status_penulis: 'Pelajar Sastra',
    link_trakteer: '',
  };

  if (currentUser?.uid) {
    try {
      const { rows } = await pool.query(
        'SELECT nama, status_badge, link_donasi FROM profil_pengguna WHERE user_id = $1 LIMIT 1',
        [currentUser.uid]
      );
      if (rows && rows.length > 0) {
        authorProfile = {
          nama: rows[0].nama || authorProfile.nama,
          status_penulis: rows[0].status_badge || authorProfile.status_penulis,
          link_trakteer: rows[0].link_donasi || '',
        };
      }
    } catch (e) {
      console.warn('[Tulis] Profile query fallback:', e);
    }
  }

  // Server Action untuk Menerbitkan Karya
  async function simpanKaryaAction(formData: FormData) {
    'use server';

    const judul = String(formData.get('judul') || '').trim();
    const kategori = String(formData.get('kategori') || 'Puisi').trim();
    const isi_tulisan = String(formData.get('isi_tulisan') || '').trim();
    const nama_pengguna = String(formData.get('nama_pengguna') || authorProfile.nama).trim();
    const status_penulis = String(formData.get('status_penulis') || authorProfile.status_penulis).trim();
    const link_trakteer = String(formData.get('link_trakteer') || '').trim() || null;

    // Bidang Novel / Cerbung
    const nama_cerita = String(formData.get('nama_cerita') || '').trim() || null;
    const nomorBabRaw = formData.get('nomor_bab');
    const nomor_bab = nomorBabRaw ? parseInt(String(nomorBabRaw), 10) || 1 : null;
    const judul_bab = String(formData.get('judul_bab') || '').trim() || null;
    const sinopsis = String(formData.get('sinopsis') || '').trim() || null;

    // Upload Cover Gambar
    const gambar = formData.get('gambar');
    let gambarUrl: string | null = null;
    if (gambar instanceof File && gambar.size > 0) {
      try {
        const buffer = Buffer.from(await gambar.arrayBuffer());
        gambarUrl = `data:${gambar.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
      } catch (err) {
        console.warn('[Tulis] Upload gambar notice:', err);
      }
    }

    if (!judul || !isi_tulisan) {
      redirect('/tulis?error=Judul+dan+isi+karya+wajib+diisi');
    }

    try {
      await pool.query(
        `INSERT INTO karya (judul, kategori, isi_tulisan, nama_pengguna, status_penulis, link_trakteer, gambar_url, user_id, nomor_bab, judul_bab, nama_cerita, sinopsis, status_cerita)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Ongoing')`,
        [judul, kategori, isi_tulisan, nama_pengguna, status_penulis, link_trakteer, gambarUrl, currentUser?.uid || 'guest_user', nomor_bab, judul_bab, nama_cerita, sinopsis]
      );
    } catch (saveErr) {
      console.error('[Tulis] Gagal simpan karya:', saveErr);
    }

    revalidatePath('/');
    redirect('/');
  }

  return (
    <main className="min-h-screen pb-28 pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-[#2C2A29]">
      
      {/* Header Navigasi Atas */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EAE2D9]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#C85A32] hover:text-[#A94728] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Ruang Baca</span>
        </Link>
        <span className="text-xs text-[#5C544F] font-serif italic">
          Bilik Cipta Aksara
        </span>
      </div>

      <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* Judul Halaman Editorial */}
        <div className="space-y-2 border-b border-[#EAE2D9] pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C85A32]">
            <Feather className="w-4 h-4" />
            <span>Lembaran Naskah Baru</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1A19] tracking-tight">
            Tumpahkan Rasa ke Dalam Aksara
          </h1>
          <p className="text-sm text-[#5C544F] leading-relaxed">
            Tulis sajak, cerpen, pantun, atau bab novel Anda. Karya Anda akan tersaji anggun di hadapan ribuan pembaca literasi.
          </p>
        </div>

        <form action={simpanKaryaAction} className="space-y-8">
          
          {/* 1. Pemilihan Ragam Sastra (Kategori) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C544F]">
              Pilih Ragam Sastra
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Puisi', desc: 'Bait, sajak, lirik' },
                { label: 'Cerpen', desc: 'Prosa & kisah fiksi' },
                { label: 'Pantun', desc: 'Sampiran & isi rima' },
                { label: 'Novel & Cerbung', desc: 'Cerita bersambung' },
              ].map((item, idx) => (
                <label
                  key={item.label}
                  className="relative flex flex-col p-4 rounded-2xl border border-[#EAE2D9] bg-[#FAF8F5] hover:border-[#C85A32]/60 hover:bg-[#FFFDF9] cursor-pointer transition has-checked:border-[#C85A32] has-checked:bg-[#C85A32]/5"
                >
                  <input
                    type="radio"
                    name="kategori"
                    value={item.label}
                    defaultChecked={idx === 0}
                    className="sr-only"
                  />
                  <span className="font-serif font-bold text-base text-[#1C1A19]">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-[#5C544F] mt-1">
                    {item.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Judul Naskah (Kanvas Huruf Besar) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C544F]">
              Judul Karya
            </label>
            <input
              type="text"
              name="judul"
              required
              placeholder="Tulis judul naskah di sini..."
              className="w-full px-4 py-3 rounded-2xl border border-[#EAE2D9] bg-[#FAF8F5] focus:bg-[#FFFDF9] focus:border-[#C85A32] text-xl sm:text-2xl font-serif font-bold text-[#1C1A19] placeholder:text-[#A59A92] outline-none transition"
            />
          </div>

          {/* 3. Bidang Khusus Seri / Cerita Bersambung (Opsional) */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D9] space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Detail Seri / Bab (Khusus Novel & Cerbung)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  name="nama_cerita"
                  placeholder="Nama Buku / Seri Novel (contoh: Lentera di Ujung Senja)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D9] bg-white text-xs text-[#2C2A29] outline-none focus:border-[#C85A32]"
                />
              </div>
              <div className="sm:col-span-4">
                <input
                  type="number"
                  name="nomor_bab"
                  placeholder="Nomor Bab (misal: 1)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D9] bg-white text-xs text-[#2C2A29] outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                name="sinopsis"
                placeholder="Sinopsis singkat atau kutipan pengantar satu kalimat..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D9] bg-white text-xs text-[#2C2A29] outline-none focus:border-[#C85A32] font-serif italic"
              />
            </div>
          </div>

          {/* 4. Kanvas Penulisan Isi Karya Sastra */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C544F]">
                Bait & Aksara Karya
              </label>
              <span className="text-[11px] text-[#A59A92] font-serif italic">
                Tekan Enter dua kali untuk memisah bait sajak
              </span>
            </div>

            <textarea
              name="isi_tulisan"
              required
              rows={14}
              placeholder="Mulailah menenun kata di sini...&#10;&#10;Hujan di bulan Juni,&#10;tak ada yang lebih tabah..."
              className="w-full p-5 sm:p-7 rounded-3xl border border-[#EAE2D9] bg-[#FAF8F5] focus:bg-[#FFFDF9] focus:border-[#C85A32] font-serif text-base sm:text-lg leading-loose text-[#1C1A19] placeholder:text-[#A59A92] outline-none transition"
            />
          </div>

          {/* 5. Sampul Ilustrasi Naskah (Opsional) */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-[#1C1A19]">
                  Sampul Karya (Opsional)
                </p>
                <p className="text-[11px] text-[#5C544F]">
                  Unggah gambar sampul naskah berformat JPG, PNG, atau WEBP.
                </p>
              </div>
            </div>

            <input
              type="file"
              name="gambar"
              accept="image/*"
              className="text-xs text-[#5C544F] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-[#C85A32]/10 file:text-[#C85A32] hover:file:bg-[#C85A32]/20 file:cursor-pointer cursor-pointer"
            />
          </div>

          {/* Identitas Nama Pena */}
          <input type="hidden" name="nama_pengguna" value={authorProfile.nama} />
          <input type="hidden" name="status_penulis" value={authorProfile.status_penulis} />
          <input type="hidden" name="link_trakteer" value={authorProfile.link_trakteer} />

          {/* Tombol Terbitkan Aksara */}
          <div className="pt-6 border-t border-[#EAE2D9] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#5C544F]">
              Menerbitkan sebagai: <strong className="text-[#1C1A19]">{authorProfile.nama}</strong> ({authorProfile.status_penulis})
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/"
                className="w-1/2 sm:w-auto text-center px-5 py-2.5 rounded-xl border border-[#EAE2D9] text-xs font-medium text-[#5C544F] hover:text-[#1C1A19] transition"
              >
                Batal
              </Link>
              <SubmitButton
                label="Terbitkan Karya Sekarang"
                loadingLabel="Menerbitkan Aksara..."
                className="w-1/2 sm:w-auto"
                icon={<PenLine className="w-4 h-4" />}
              />
            </div>
          </div>

        </form>

      </div>
    </main>
  );
}
