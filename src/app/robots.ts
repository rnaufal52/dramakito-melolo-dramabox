import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/favorites'], // Don't index private user pages
    },
    sitemap: 'https://dracin.example.com/sitemap.xml', // Ideally replace with actual domain if known
  };
}
