import pool from '../../lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/seo';
import { Library, ArrowLeft, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Book Corner — Katalog Buku & Rekomendasi Sastra',
  description:
    'Temukan katalog sastra pilihan, sinopsis buku, dan rekomendasi karya literatur Indonesia terbaik di Book Corner Fadrodzak.',
  alternates: {
    canonical: `${SITE_URL}/book-corner`,
  },
  openGraph: {
    title: 'Book Corner — Katalog Buku & Rekomendasi Sastra | Fadrodzak',
    description:
      'Temukan katalog sastra pilihan, sinopsis buku, dan rekomendasi karya literatur Indonesia terbaik di Book Corner Fadrodzak.',
    url: `${SITE_URL}/book-corner`,
    type: 'website',
  },
};

type Book = {
  id: number;
  judul: string;
  penulis: string;
  penerbit: string | null;
  jumlah_halaman: number | null;
  genre: string | null;
  sinopsis: string | null;
  gambar_url: string | null;
};

export default async function BookCorner() {
  let rows: Book[] = [];
  try {
    const res = await pool.query<Book>(
      `
      SELECT *
      FROM buku
      ORDER BY created_at DESC
      `
    );
    rows = res.rows || [];
  } catch (err) {
    console.warn('[BookCorner] Query buku error handled:', err);
    rows = [];
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-2xl mx-auto pb-24 text-[#2C2A29]">
      <div className="mb-4 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#C85A32] text-xs sm:text-sm font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>

      <header className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#FAF8F5] text-[#C85A32] border border-[#E8DED6] text-xs font-semibold mb-2.5">
          <Library className="w-4 h-4 text-[#C85A32]" />
          <span>Katalog Bacaan Sastra</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2A29] mb-1.5">
          Book Corner Fadrodzak
        </h1>
        <p className="text-[#6B625D] text-xs sm:text-sm max-w-md mx-auto">
          Rekomendasi naskah sastra pilihan, sinopsis buku, dan kurasi karya literatur Indonesia.
        </p>
      </header>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-center text-[#6B625D] italic py-12">
            Belum ada buku di katalog.
          </p>
        ) : (
          rows.map((book) => (
            <article
              key={book.id}
              className="bg-[#FFFDF9] p-5 sm:p-6 rounded-2xl shadow-2xs border border-[#E8DED6] flex flex-col md:flex-row gap-5 transition hover:border-[#C85A32]/40"
            >
              {book.gambar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.gambar_url}
                  alt={`Sampul buku ${book.judul} karya ${book.penulis}`}
                  className="w-28 sm:w-32 aspect-2/3 object-cover rounded-xl shadow-2xs mx-auto md:mx-0 border border-[#E8DED6] shrink-0"
                />
              ) : (
                <div className="w-28 sm:w-32 aspect-2/3 bg-[#FAF8F5] rounded-xl border border-[#E8DED6] flex items-center justify-center text-[#6B625D] text-xs text-center mx-auto md:mx-0 p-3 shrink-0">
                  Sampul tidak tersedia
                </div>
              )}

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C2A29] leading-snug">
                    <Link
                      href={`/book-corner/${book.id}`}
                      className="hover:text-[#C85A32] transition"
                    >
                      {book.judul}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-[#C85A32] font-medium mt-0.5 mb-2.5">
                    Karya: {book.penulis}
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6B625D] mb-3">
                    <span className="bg-[#FAF8F5] px-2 py-0.5 rounded-lg border border-[#E8DED6]">
                      {book.penerbit || 'Penerbit Mandiri'}
                    </span>

                    <span className="bg-[#FAF8F5] px-2 py-0.5 rounded-lg border border-[#E8DED6]">
                      {book.jumlah_halaman || '?'} Halaman
                    </span>

                    <span className="bg-[#FAF8F5] px-2 py-0.5 rounded-lg border border-[#E8DED6]">
                      {book.genre || 'Sastra'}
                    </span>
                  </div>

                  <article className="prose prose-stone text-xs sm:text-sm font-serif text-[#45413E] leading-relaxed line-clamp-3 mb-3 max-w-none">
                    <p>{book.sinopsis || 'Sinopsis belum tersedia.'}</p>
                  </article>
                </div>

                <div className="pt-2 border-t border-[#E8DED6]">
                  <Link
                    href={`/book-corner/${book.id}`}
                    className="inline-flex items-center gap-1 text-[#C85A32] text-xs font-semibold hover:underline"
                  >
                    <span>Buka Detail &amp; Sinopsis Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}