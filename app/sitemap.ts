import type { MetadataRoute } from 'next';
import pool from '../lib/db';

const BASE_URL = 'https://www.fadrodzak.my.id';

export const revalidate = 3600; // Segarkan sitemap setiap 1 jam secara otomatis

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
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/book-corner`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/kontak`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/kebijakan-privasi`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/syarat-ketentuan`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  let karyaRoutes: MetadataRoute.Sitemap = [];
  let bukuRoutes: MetadataRoute.Sitemap = [];
  let tutorialRoutes: MetadataRoute.Sitemap = [];

  try {
    const [karyaRes, bukuRes, tutRes] = await Promise.all([
      pool.query(`SELECT id, created_at FROM karya ORDER BY created_at DESC LIMIT 5000`),
      pool.query(`SELECT id, created_at FROM buku ORDER BY created_at DESC LIMIT 1000`).catch(() => ({ rows: [] })),
      pool.query(`SELECT id, created_at FROM tutorial ORDER BY created_at DESC LIMIT 1000`).catch(() => ({ rows: [] })),
    ]);

    if (karyaRes.rows && karyaRes.rows.length > 0) {
      karyaRoutes = karyaRes.rows.map((k) => {
        const d = k.created_at ? new Date(k.created_at) : new Date();
        return {
          url: `${BASE_URL}/karya/${k.id}`,
          lastModified: isNaN(d.getTime()) ? new Date() : d,
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        };
      });
    }

    if (bukuRes.rows && bukuRes.rows.length > 0) {
      bukuRoutes = bukuRes.rows.map((b) => {
        const d = b.created_at ? new Date(b.created_at) : new Date();
        return {
          url: `${BASE_URL}/book-corner/${b.id}`,
          lastModified: isNaN(d.getTime()) ? new Date() : d,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        };
      });
    }

    if (tutRes.rows && tutRes.rows.length > 0) {
      tutorialRoutes = tutRes.rows.map((t) => {
        const d = t.created_at ? new Date(t.created_at) : new Date();
        return {
          url: `${BASE_URL}/belajar/${t.id}`,
          lastModified: isNaN(d.getTime()) ? new Date() : d,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
    }
  } catch (err) {
    console.warn('[Sitemap] Notice query:', err);
  }

  return [...staticRoutes, ...karyaRoutes, ...bukuRoutes, ...tutorialRoutes];
}
