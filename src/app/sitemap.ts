import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/markdown';
import { getBaseUrl } from '@/lib/structured-data';

/**
 * Sitemap generation for Curly Brackets
 * 
 * This file automatically generates a sitemap.xml that includes:
 * - Home page (/)
 * - Blog index page (/blog)
 * - All individual blog posts (/blog/[slug])
 * 
 * The sitemap is automatically regenerated on each build, ensuring it stays
 * up-to-date with your latest blog posts.
 * 
 * Next.js will serve this at: https://yourdomain.com/sitemap.xml
 */

// Required for static export - forces this route to be statically generated
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const allPosts = getSortedPostsData();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: allPosts.length > 0 && allPosts[0].date 
        ? new Date(allPosts[0].date) 
        : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic blog post routes
  const blogRoutes: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes];
}

