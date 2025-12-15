import { MetadataRoute } from 'next';
import { dracinApi } from "@/lib/api";

export const revalidate = 3600; // Update sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dracin.example.com'; // Replace with actual domain

  // Fetch data to generate dynamic routes
  // We'll use Trending and Latest to ensure the most important pages are indexed
  const [trending, latest] = await Promise.all([
    dracinApi.getTrending(),
    dracinApi.getLatest(),
  ]);

  // Combine and deduplicate
  const allBooks = [...trending, ...latest];
  const uniqueBooks = Array.from(new Map(allBooks.map(item => [item.bookId, item])).values());

  const bookUrls = uniqueBooks.map((book) => ({
    url: `${baseUrl}/watch/${book.bookId}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  return [...routes, ...bookUrls];
}
