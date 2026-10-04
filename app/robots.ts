import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.fadrodzak.my.id';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profil/edit', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
