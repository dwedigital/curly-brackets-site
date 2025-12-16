import { Handler } from '@netlify/functions';
import { getSortedPostsData } from '../../src/lib/markdown';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const handler: Handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get all posts metadata
    const allPosts = getSortedPostsData();

    // Get full content for each post
    const postsDirectory = path.join(process.cwd(), 'posts');
    const postsWithContent = allPosts.map((post) => {
      const fullPath = path.join(postsDirectory, `${post.id}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        id: post.id,
        slug: post.id,
        title: post.title,
        date: post.date,
        tags: post.tags || [],
        content: matterResult.content,
        image: post.image,
      };
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        count: postsWithContent.length,
        articles: postsWithContent,
      }),
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch articles' }),
    };
  }
};

