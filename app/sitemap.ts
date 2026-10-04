import type { MetadataRoute } from 'next';
import pool from '../lib/db';

const BASE_URL = 'https://www.fadrodzak.my.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/belajar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/buku`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tulis`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  let karyaRoutes: MetadataRoute.Sitemap = [];
  try {
    const { rows } = await pool.query(
      `SELECT id, created_at FROM karya ORDER BY created_at DESC LIMIT 1000`
    );

    if (rows && rows.length > 0) {
      karyaRoutes = rows.map((k) => ({
        url: `${BASE_URL}/karya/${k.id}`,
        lastModified: k.created_at ? new Date(k.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      }));
    }
  } catch (err) {
    console.warn('[Sitemap] Notice:', err);
  }

  return [...staticRoutes, ...karyaRoutes];
}
