import pool from '../../../lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cleanTextSnippet, SITE_URL } from '../../../lib/seo';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const idAngka = parseInt(resolvedParams.id, 10);
  if (!Number.isInteger(idAngka) || idAngka <= 0) {
    return {
      title: 'Materi Belajar Tidak Ditemukan',
    };
  }

  try {
    const { rows } = await pool.query('SELECT * FROM tutorial WHERE id = $1 LIMIT 1', [idAngka]);
    const materi = rows[0];
    if (!materi) {
      return {
        title: 'Materi Belajar Tidak Ditemukan',
      };
    }

    const pageTitle = `${materi.judul} | Belajar Sastra`;
    const snippet = cleanTextSnippet(materi.isi_materi, 155);
    const description =
      snippet ||
      `Pelajari materi sastra "${materi.judul}" bersama mentor di ruang belajar dan klinik bedah karya Fadrodzak.`;
    const canonicalUrl = `${SITE_URL}/belajar/${materi.id}`;

    return {
      title: pageTitle,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'article',
        locale: 'id_ID',
        url: canonicalUrl,
        siteName: 'Fadrodzak',
        title: `${pageTitle} — Fadrodzak`,
        description,
        publishedTime: materi.created_at ? new Date(materi.created_at).toISOString() : undefined,
        authors: [materi.penulis || 'Redaksi Fadrodzak'],
        images: [
          {
            url: `${SITE_URL}/pwa-512x512.png`,
            alt: `Materi Belajar ${materi.judul}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pageTitle} — Fadrodzak`,
        description,
        images: [`${SITE_URL}/pwa-512x512.png`],
      },
    };
  } catch {
    return {
      title: 'Belajar Menulis & Sastra',
    };
  }
}

export default async function DetailMateri({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idAngka = parseInt(resolvedParams.id, 10);

  const { rows } = await pool.query('SELECT * FROM tutorial WHERE id = $1', [idAngka]);
  const materi = rows[0];

  if (!materi) {
    return (
      <div className="p-6 text-center text-red-500 font-serif mt-20">
        Materi tidak ditemukan.
      </div>
    );
  }

  const jsonLdMateri = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/belajar/${materi.id}`,
    },
    headline: materi.judul,
    description: cleanTextSnippet(materi.isi_materi, 200),
    articleSection: materi.kategori || 'Materi Belajar Sastra',
    author: {
      '@type': 'Person',
      name: materi.penulis || 'Redaksi Fadrodzak',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Fadrodzak',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/pwa-512x512.png`,
      },
    },
    datePublished: materi.created_at ? new Date(materi.created_at).toISOString() : undefined,
    image: `${SITE_URL}/pwa-512x512.png`,
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-2xl mx-auto pb-24 text-[#2C2A29]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMateri) }}
      />
      <div className="mb-5 pt-2">
        <Link
          href="/belajar"
          className="inline-flex items-center gap-1.5 text-[#C85A32] text-xs sm:text-sm font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Ruang Belajar
        </Link>
      </div>

      <article className="bg-[#FFFDF9] p-6 sm:p-8 rounded-2xl shadow-2xs border border-[#E8DED6]">
        <header className="mb-6 pb-4 border-b border-[#E8DED6]">
          <span className="text-[11px] font-semibold text-[#C85A32] uppercase tracking-wider">
            {materi.kategori || 'Materi Sastra'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2A29] mt-1 mb-2 leading-tight">
            {materi.judul}
          </h1>
          <p className="text-xs text-[#6B625D]">
            Ditulis oleh: <strong className="text-[#C85A32] font-semibold">{materi.penulis || 'Redaksi'}</strong> • {materi.waktu_baca || '5 mnt baca'}
          </p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:text-[#2C2A29] prose-p:text-[#45413E] prose-a:text-[#C85A32] prose-strong:text-[#2C2A29] prose-blockquote:border-[#C85A32] prose-blockquote:text-[#625C57]">
          <p className="font-serif leading-loose whitespace-pre-wrap">
            {materi.isi_materi}
          </p>
        </div>
      </article>
    </main>
  );
}
