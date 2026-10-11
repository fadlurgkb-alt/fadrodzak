import React from 'react';
import Link from 'next/link';
import pool from '../../../../lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../../../../lib/auth-server';
import { ArrowLeft, BookOpen, Feather, Image, Plus, Save } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditKaryaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const karyaId = Number.parseInt(resolvedParams.id, 10);

  if (!Number.isInteger(karyaId) || karyaId <= 0) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto text-center font-serif text-[#2C2A29]">
        <p className="text-red-600 mb-4">Karya sastra tidak ditemukan.</p>
        <Link href="/profil" className="text-xs text-[#C85A32] underline">
          Kembali ke Profil
        </Link>
      </main>
    );
  }

  let currentUser: { uid?: string } | null = null;
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    console.warn('[EditKarya] Notice auth:', err);
  }

  if (!currentUser?.uid) {
    redirect('/login?next=/karya/' + karyaId + '/edit');
  }

  // Ambil karya dari database
  const { rows } = await pool.query('SELECT * FROM karya WHERE id = $1 LIMIT 1', [karyaId]);
  const karya = rows[0];

  if (!karya) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto text-center font-serif text-[#2C2A29]">
        <p className="text-red-600 mb-4">Karya sastra tidak ditemukan.</p>
        <Link href="/profil" className="text-xs text-[#C85A32] underline">
          Kembali ke Profil
        </Link>
      </main>
    );
  }

  // Verifikasi kepemilikan (hanya penulis atau admin redaksi)
  let isAdmin = false;
  try {
    const { rows: gamifRows } = await pool.query(
      'SELECT role FROM user_gamification WHERE user_id = $1 LIMIT 1',
      [currentUser.uid]
    );
    if (gamifRows[0]?.role === 'admin') {
      isAdmin = true;
    }
  } catch {}

  const isOwner = karya.user_id === currentUser.uid;
  if (!isOwner && !isAdmin) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto text-center font-serif text-[#2C2A29]">
        <h2 className="text-lg font-bold text-red-600 mb-2">Akses Ditolak</h2>
        <p className="text-xs text-[#6B625D] mb-4">
          Anda hanya dapat mengubah naskah karya milik akun Anda sendiri.
        </p>
        <Link href="/profil" className="text-xs text-[#C85A32] underline">
          Kembali ke Profil
        </Link>
      </main>
    );
  }

  const isCerita =
    (karya.kategori || '').toLowerCase().includes('novel') ||
    (karya.kategori || '').toLowerCase().includes('cerbung') ||
    Boolean(karya.nama_cerita);

  const nextBabNumber = (Number(karya.nomor_bab) || 1) + 1;
  const seriesName = karya.nama_cerita || karya.judul;

  async function updateKaryaAction(formData: FormData) {
    'use server';

    const judul = String(formData.get('judul') || '').trim();
    const kategori = String(formData.get('kategori') || karya.kategori || 'Puisi').trim();
    const isi_tulisan = String(formData.get('isi_tulisan') || '').trim();
    const nama_cerita = String(formData.get('nama_cerita') || '').trim() || null;
    const nomorBabRaw = formData.get('nomor_bab');
    const nomor_bab = nomorBabRaw ? parseInt(String(nomorBabRaw), 10) || 1 : null;
    const judul_bab = String(formData.get('judul_bab') || '').trim() || null;
    const sinopsis = String(formData.get('sinopsis') || '').trim() || null;
    const status_cerita = String(formData.get('status_cerita') || 'Ongoing').trim();

    if (!judul || !isi_tulisan) {
      redirect(`/karya/${karyaId}/edit?error=Judul+dan+isi+karya+tidak+boleh+kosong`);
    }

    const gambar = formData.get('gambar');
    let gambarUrl = karya.gambar_url;
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
    if (gambar instanceof File && gambar.size > 0) {
      if (gambar.size > MAX_IMAGE_SIZE) {
        redirect(`/karya/${karyaId}/edit?error=Ukuran+gambar+sampul+maksimal+2MB`);
      }
      try {
        const buffer = Buffer.from(await gambar.arrayBuffer());
        gambarUrl = `data:${gambar.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
      } catch (err) {
        console.warn('[EditKarya] Gagal upload gambar:', err);
      }
    }

    try {
      await pool.query(
        `UPDATE karya
         SET judul = $1,
             kategori = $2,
             isi_tulisan = $3,
             nama_cerita = $4,
             nomor_bab = $5,
             judul_bab = $6,
             sinopsis = $7,
             status_cerita = $8,
             gambar_url = $9
         WHERE id = $10`,
        [judul, kategori, isi_tulisan, nama_cerita, nomor_bab, judul_bab, sinopsis, status_cerita, gambarUrl, karyaId]
      );
    } catch (saveErr) {
      console.error('[EditKarya] Gagal update naskah:', saveErr);
    }

    revalidatePath(`/karya/${karyaId}`);
    revalidatePath('/profil');
    revalidatePath('/');
    redirect(`/karya/${karyaId}`);
  }

  return (
    <main className="min-h-screen pb-28 pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-[#2C2A29]">
      {/* Header Navigasi */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EAE2D9]">
        <Link
          href={`/karya/${karya.id}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#C85A32] hover:text-[#A94728] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Naskah</span>
        </Link>
        <span className="text-xs text-[#5C544F] font-serif italic">
          Bilik Sunting Naskah
        </span>
      </div>

      {/* Banner Khusus Novel/Cerbung: Lanjutkan Bab Selanjutnya */}
      {isCerita && (
        <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-[#FAF0E6] border border-[#DECBC0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1A1817]">
                Ingin Menulis Bab Selanjutnya?
              </h3>
              <p className="text-xs text-[#6B625D] mt-0.5 leading-relaxed">
                Kisah <strong>&ldquo;{seriesName}&rdquo;</strong> saat ini berada di Bab {karya.nomor_bab || 1}. Lanjutkan kisah ini ke <strong>Bab {nextBabNumber}</strong> dengan 1 kali klik.
              </p>
            </div>
          </div>

          <Link
            href={`/tulis?nama_cerita=${encodeURIComponent(seriesName)}&nomor_bab=${nextBabNumber}&kategori=Novel+%26+Cerbung&sinopsis=${encodeURIComponent(karya.sinopsis || '')}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white text-xs font-serif font-bold shadow-2xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tulis Bab {nextBabNumber}</span>
          </Link>
        </div>
      )}

      {/* Formulir Sunting Karya */}
      <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        <div className="space-y-1.5 border-b border-[#EAE2D9] pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C85A32]">
            <Feather className="w-4 h-4" />
            <span>Sunting Naskah Sastra</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1A19]">
            Perbarui Bait &amp; Aksara
          </h1>
          <p className="text-xs text-[#5C544F]">
            Perubahan yang Anda simpan akan langsung diperbarui di ruang baca pembaca.
          </p>
        </div>

        <form action={updateKaryaAction} className="space-y-8">
          {/* Pilihan Ragam Sastra */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C544F]">
              Ragam Sastra
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Puisi', desc: 'Bait, sajak, lirik' },
                { label: 'Cerpen', desc: 'Prosa & kisah fiksi' },
                { label: 'Pantun', desc: 'Sampiran & isi rima' },
                { label: 'Novel & Cerbung', desc: 'Cerita bersambung' },
              ].map((item) => (
                <label
                  key={item.label}
                  className="relative flex flex-col p-3.5 rounded-2xl border border-[#EAE2D9] bg-[#FAF8F5] hover:border-[#C85A32]/60 hover:bg-[#FFFDF9] cursor-pointer transition has-checked:border-[#C85A32] has-checked:bg-[#C85A32]/5"
                >
                  <input
                    type="radio"
                    name="kategori"
                    value={item.label}
                    defaultChecked={karya.kategori === item.label || (item.label === 'Novel & Cerbung' && isCerita)}
                    className="sr-only"
                  />
                  <span className="font-serif font-bold text-sm text-[#1C1A19]">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#5C544F] mt-0.5">
                    {item.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Judul Karya */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C544F]">
              Judul Karya
            </label>
            <input
              type="text"
              name="judul"
              required
              defaultValue={karya.judul}
              placeholder="Tulis judul naskah..."
              className="w-full px-4 py-3 rounded-2xl border border-[#EAE2D9] bg-[#FAF8F5] focus:bg-[#FFFDF9] focus:border-[#C85A32] text-xl font-serif font-bold text-[#1C1A19] placeholder:text-[#A59A92] outline-none transition"
            />
          </div>

          {/* Seri, Bab & Sinopsis (Khusus Cerita Bersambung & Novel) */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D9] space-y-4">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Detail Bab Novel &amp; Cerita Bersambung
              </span>
              {isCerita && (
                <Link
                  href={`/tulis?nama_cerita=${encodeURIComponent(seriesName)}&nomor_bab=${nextBabNumber}&kategori=Novel+%26+Cerbung&sinopsis=${encodeURIComponent(karya.sinopsis || '')}`}
                  className="text-[11px] text-[#C85A32] font-semibold hover:underline flex items-center gap-1"
                >
                  + Tambah Bab {nextBabNumber} &rarr;
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-[11px] text-[#6B625D] mb-1 font-serif">
                  Nama Seri / Buku Novel:
                </label>
                <input
                  type="text"
                  name="nama_cerita"
                  defaultValue={karya.nama_cerita || ''}
                  placeholder="Contoh: Lentera di Ujung Senja"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D9] bg-white text-xs text-[#2C2A29] outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] text-[#6B625D] mb-1 font-serif">
                  Nomor Bab:
                </label>
                <input
                  type="number"
                  name="nomor_bab"
                  defaultValue={karya.nomor_bab || 1}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D9] bg-white text-xs text-[#2C2A29] outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] text-[#6B625D] mb-1 font-serif">
                  Status Cerita:
                </label>
                <select
                  name="status_cerita"
                  defaultValue={karya.status_cerita || 'Ongoing'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D9] bg-white text-xs text-[#2C2A29] outline-none focus:border-[#C85A32]"
                >
                  <option value="Ongoing">Ongoing (Bersambung)</option>
                  <option value="Tamat">Tamat (Selesai)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B625D] mb-1 font-serif">
                Judul Khusus Bab Ini (Opsional):
              </label>
              <input
                type="text"
                name="judul_bab"
                defaultValue={karya.judul_bab || ''}
                placeholder="Contoh: Pertemuan di Bawah Rinai Hujan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D9] bg-white text-xs text-[#2C2A29] outline-none focus:border-[#C85A32] italic"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B625D] mb-1 font-serif">
                Sinopsis / Ringkasan Cerita:
              </label>
              <textarea
                name="sinopsis"
                rows={2}
                defaultValue={karya.sinopsis || ''}
                placeholder="Tuliskan sinopsis singkat cerita untuk memikat pembaca..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE2D9] bg-white text-xs text-[#2C2A29] outline-none focus:border-[#C85A32] font-serif italic resize-y"
              />
            </div>
          </div>

          {/* Isi Naskah Tulisan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C544F]">
                Bait &amp; Aksara Naskah
              </label>
              <span className="text-[11px] text-[#A59A92] font-serif italic">
                Pisahkan bait sajak atau pergantian bab dengan enter 2x
              </span>
            </div>

            <textarea
              name="isi_tulisan"
              required
              rows={16}
              defaultValue={karya.isi_tulisan}
              placeholder="Tulis naskah sastra Anda di sini..."
              className="w-full p-5 sm:p-7 rounded-3xl border border-[#EAE2D9] bg-[#FAF8F5] focus:bg-[#FFFDF9] focus:border-[#C85A32] font-serif text-base sm:text-lg leading-loose text-[#1C1A19] placeholder:text-[#A59A92] outline-none transition resize-y"
            />
          </div>

          {/* Sampul Karya */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-[#1C1A19]">
                  Ganti Sampul Karya (Opsional)
                </p>
                <p className="text-[11px] text-[#5C544F]">
                  Biarkan kosong jika tidak ingin mengubah sampul saat ini.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {karya.gambar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={karya.gambar_url}
                  alt="Sampul Saat Ini"
                  className="w-12 h-14 object-cover rounded-lg border border-[#DECBC0] shadow-2xs"
                />
              )}
              <input
                type="file"
                name="gambar"
                accept="image/*"
                className="text-xs text-[#5C544F] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-[#C85A32]/10 file:text-[#C85A32] hover:file:bg-[#C85A32]/20 file:cursor-pointer cursor-pointer"
              />
            </div>
          </div>

          {/* Tombol Aksi Simpan */}
          <div className="pt-6 border-t border-[#EAE2D9] flex items-center justify-between gap-4">
            <Link
              href={`/karya/${karya.id}`}
              className="px-4 py-2.5 rounded-xl border border-[#E8DED6] bg-[#FFFDF9] text-[#6B625D] hover:text-[#2C2A29] text-xs font-serif transition"
            >
              Batal
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white text-xs sm:text-sm font-medium shadow-2xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
