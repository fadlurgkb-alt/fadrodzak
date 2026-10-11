import pool from '@/lib/db';

const BASE_URL = 'https://www.fadrodzak.my.id';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Segarkan sitemap setiap 1 jam

interface SitemapUrlItem {
  loc: string;
  lastmod?: string;
  priority: string;
  changefreq: string;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const staticPages: SitemapUrlItem[] = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${BASE_URL}/event/sayembara-perintis`, priority: '0.9', changefreq: 'daily' },
    { loc: `${BASE_URL}/belajar`, priority: '0.8', changefreq: 'daily' },
    { loc: `${BASE_URL}/tentang-kami`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${BASE_URL}/kontak`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${BASE_URL}/kebijakan-privasi`, priority: '0.4', changefreq: 'yearly' },
    { loc: `${BASE_URL}/syarat-ketentuan`, priority: '0.4', changefreq: 'yearly' },
  ];

  const dynamicPages: SitemapUrlItem[] = [];

  try {
    const [karyaRes, tutRes] = await Promise.all([
      pool.query(`SELECT id, created_at FROM karya ORDER BY created_at DESC LIMIT 5000`),
      pool.query(`SELECT id, created_at FROM tutorial ORDER BY created_at DESC LIMIT 1000`).catch(() => ({ rows: [] })),
    ]);

    if (karyaRes.rows && karyaRes.rows.length > 0) {
      for (const k of karyaRes.rows) {
        const d = k.created_at ? new Date(k.created_at).toISOString() : undefined;
        dynamicPages.push({
          loc: `${BASE_URL}/karya/${k.id}`,
          lastmod: d,
          priority: '0.9',
          changefreq: 'weekly',
        });
      }
    }

    if (tutRes.rows && tutRes.rows.length > 0) {
      for (const t of tutRes.rows) {
        const d = t.created_at ? new Date(t.created_at).toISOString() : undefined;
        dynamicPages.push({
          loc: `${BASE_URL}/belajar/${t.id}`,
          lastmod: d,
          priority: '0.8',
          changefreq: 'weekly',
        });
      }
    }
  } catch (err) {
    console.error('[Sitemap Route] DB fetch notice:', err);
  }

  const allPages: SitemapUrlItem[] = [...staticPages, ...dynamicPages];
  const nowIso = new Date().toISOString();

  const xmlUrls = allPages
    .map((p) => {
      const lastmodTag = `<lastmod>${p.lastmod || nowIso}</lastmod>`;
      return `  <url>
    <loc>${escapeXml(p.loc)}</loc>
    ${lastmodTag}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
