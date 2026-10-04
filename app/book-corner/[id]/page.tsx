import pool from '../../../lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cleanTextSnippet, SITE_URL } from '../../../lib/seo';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Book = {
  id: number;
  judul: string;
  penulis: string;
  penerbit: string | null;
  jumlah_halaman: number | null;
  genre: string | null;
  sinopsis: string | null;
  gambar_url: string | null;
  created_at?: string | Date;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const bookId = Number(id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return {
      title: 'Buku Tidak Ditemukan | Fadrodzak',
    };
  }

  try {
    const { rows } = await pool.query<Book>(
      'SELECT id, judul, penulis, sinopsis, gambar_url, created_at FROM buku WHERE id = $1 LIMIT 1',
      [bookId]
    );
    const book = rows[0];
    if (!book) {
      return {
        title: 'Buku Tidak Ditemukan | Fadrodzak',
      };
    }

    const pageTitle = `${book.judul} — ${book.penulis} | Book Corner`;
    const snippet = cleanTextSnippet(book.sinopsis, 155);
    const description =
      snippet ||
      `Ulasan, sinopsis, dan informasi buku ${book.judul} karya ${book.penulis} di katalog sastra Book Corner Fadrodzak.`;
    const canonicalUrl = `${SITE_URL}/book-corner/${book.id}`;
    const imageUrl = book.gambar_url || `${SITE_URL}/pwa-512x512.png`;

    return {
      title: pageTitle,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: canonicalUrl,
        siteName: 'Fadrodzak',
        title: `${pageTitle} — Fadrodzak`,
        description,
        images: [
          {
            url: imageUrl,
            alt: `Sampul buku ${book.judul} karya ${book.penulis}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pageTitle} — Fadrodzak`,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Book Corner',
    };
  }
}

export default async function DetailBuku({
  params,
}: PageProps) {
  const { id } = await params;
  const bookId = Number(id);

  if (!Number.isInteger(bookId)) {
    notFound();
  }

  let book: Book | null = null;
  try {
    const { rows } = await pool.query<Book>(
      `
      SELECT
        id,
        judul,
        penulis,
        penerbit,
        jumlah_halaman,
        genre,
        sinopsis,
        gambar_url,
        created_at
      FROM buku
      WHERE id = $1
      LIMIT 1
      `,
      [bookId]
    );
    book = rows[0] || null;
  } catch (err) {
    console.warn('[BookDetail] Query error:', err);
  }

  if (!book) {
    notFound();
  }

  const jsonLdBook = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.judul,
    author: {
      '@type': 'Person',
      name: book.penulis,
    },
    publisher: book.penerbit
      ? {
          '@type': 'Organization',
          name: book.penerbit,
        }
      : undefined,
    numberOfPages: book.jumlah_halaman || undefined,
    genre: book.genre || undefined,
    description: cleanTextSnippet(book.sinopsis, 250),
    image: book.gambar_url || undefined,
    url: `${SITE_URL}/book-corner/${book.id}`,
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 pb-24 text-[#2C2A29]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBook) }}
      />
      <div className="max-w-2xl mx-auto">
        <div className="mb-5 pt-2">
          <Link
            href="/book-corner"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#C85A32] font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Book Corner
          </Link>
        </div>

        <article className="bg-[#FFFDF9] rounded-2xl border border-[#E8DED6] shadow-2xs p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {book.gambar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.gambar_url}
                alt={`Sampul buku ${book.judul} karya ${book.penulis}`}
                className="w-36 sm:w-44 aspect-2/3 object-cover rounded-xl shadow-2xs mx-auto md:mx-0 border border-[#E8DED6] shrink-0"
              />
            ) : (
              <div className="w-36 sm:w-44 aspect-2/3 bg-[#FAF8F5] rounded-xl border border-[#E8DED6] flex items-center justify-center text-[#6B625D] text-xs text-center mx-auto md:mx-0 p-4 shrink-0">
                Sampul tidak tersedia
              </div>
            )}

            <div className="flex-1">
              <span className="text-[11px] font-semibold text-[#C85A32] uppercase tracking-wider block mb-1">
                {book.genre || 'Sastra Indonesia'}
              </span>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2A29] leading-tight mb-1.5">
                {book.judul}
              </h1>

              <p className="text-xs sm:text-sm text-[#6B625D] mb-4">
                Karya: <strong className="text-[#C85A32] font-semibold">{book.penulis}</strong>
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-[#6B625D] mb-4">
                <span className="bg-[#FAF8F5] border border-[#E8DED6] px-2.5 py-1 rounded-lg">
                  Penerbit: {book.penerbit || 'Penerbit Mandiri'}
                </span>

                <span className="bg-[#FAF8F5] border border-[#E8DED6] px-2.5 py-1 rounded-lg">
                  {book.jumlah_halaman || '?'} Halaman
                </span>

                <span className="bg-[#FAF8F5] border border-[#E8DED6] px-2.5 py-1 rounded-lg">
                  Genre: {book.genre || 'Sastra'}
                </span>
              </div>
            </div>
          </div>

          <section className="mt-8 pt-6 border-t border-[#E8DED6]">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C2A29] mb-3">
              Sinopsis Buku
            </h2>

            <article className="prose prose-lg max-w-none prose-headings:text-[#2C2A29] prose-p:text-[#45413E] prose-a:text-[#C85A32] prose-strong:text-[#2C2A29] prose-blockquote:border-[#C85A32] prose-blockquote:text-[#625C57]">
              <p className="font-serif leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {book.sinopsis || 'Sinopsis belum tersedia untuk judul ini.'}
              </p>
            </article>
          </section>

          <section className="mt-8 border-t border-[#E8DED6] pt-6">
            <h2 className="font-serif text-base font-bold text-[#2C2A29] mb-2">
              Katalog Sastra Fadrodzak
            </h2>

            <div className="bg-[#FAF8F5] border border-[#E8DED6] rounded-xl p-4">
              <p className="text-[#6B625D] text-xs leading-relaxed">
                Buku ini terdaftar dalam kurasi aksara Fadrodzak. Temukan judul-judul karya lainnya di katalog atau tuliskan apresiasi Anda di beranda komunitas.
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
