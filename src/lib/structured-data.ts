import { PostData } from './markdown';

// Get base URL - use environment variable or default
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin;
  }
  // Server-side: use environment variable or default
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://curlybrackets.dev';
}

// Extract description from HTML content (first paragraph or first 160 chars)
export function extractDescription(contentHtml?: string, maxLength: number = 160): string {
  if (!contentHtml) {
    return 'Curly Brackets - Articles about web development, AI, and the future of the web.';
  }

  // Remove HTML tags and get plain text
  const textContent = contentHtml
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Get first paragraph or first maxLength characters
  const firstParagraph = textContent.split('\n')[0] || textContent;
  
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  // Truncate to last complete word before maxLength
  const truncated = firstParagraph.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

// Generate Article schema.org JSON-LD structured data
export function generateArticleStructuredData(postData: PostData): object {
  const baseUrl = getBaseUrl();
  const articleUrl = `${baseUrl}/blog/${postData.id}`;
  const imageUrl = postData.image 
    ? `${baseUrl}${postData.image.startsWith('/') ? '' : '/'}${postData.image}`
    : `${baseUrl}/images/logo.webp`;

  // Format date for schema.org (ISO 8601)
  const datePublished = postData.date ? new Date(postData.date).toISOString() : new Date().toISOString();
  
  // Extract description
  const description = extractDescription(postData.contentHtml);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: postData.title,
    description: description,
    image: imageUrl,
    datePublished: datePublished,
    dateModified: datePublished, // Use same date if no modified date available
    author: {
      '@type': 'Organization',
      name: 'Curly Brackets',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Curly Brackets',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: postData.tags && postData.tags.length > 0 ? postData.tags[0] : 'Technology',
    keywords: postData.tags ? postData.tags.join(', ') : 'web development, programming, technology',
    inLanguage: 'en-US',
    url: articleUrl,
  };
}

// Generate BlogPosting schema (more specific than Article)
export function generateBlogPostingStructuredData(postData: PostData): object {
  const baseUrl = getBaseUrl();
  const articleUrl = `${baseUrl}/blog/${postData.id}`;
  const imageUrl = postData.image 
    ? `${baseUrl}${postData.image.startsWith('/') ? '' : '/'}${postData.image}`
    : `${baseUrl}/images/logo.webp`;

  const datePublished = postData.date ? new Date(postData.date).toISOString() : new Date().toISOString();
  const description = extractDescription(postData.contentHtml);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postData.title,
    description: description,
    image: imageUrl,
    datePublished: datePublished,
    dateModified: datePublished,
    author: {
      '@type': 'Organization',
      name: 'Curly Brackets',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Curly Brackets',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: postData.tags && postData.tags.length > 0 ? postData.tags[0] : 'Technology',
    keywords: postData.tags ? postData.tags.join(', ') : 'web development, programming, technology',
    inLanguage: 'en-US',
    url: articleUrl,
  };
}

// Generate BlogCollectionPage schema for blog listing page
export function generateBlogCollectionStructuredData(posts: PostData[]): object {
  const baseUrl = getBaseUrl();
  const blogUrl = `${baseUrl}/blog`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog Archive | Curly Brackets',
    description: 'Latest articles, tutorials, and insights on coding, AI, and technology.',
    url: blogUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          headline: post.title,
          url: `${baseUrl}/blog/${post.id}`,
          datePublished: post.date ? new Date(post.date).toISOString() : undefined,
        },
      })),
    },
  };
}

