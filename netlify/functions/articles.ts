import { Handler } from '@netlify/functions';
import { getSortedPostsData } from '../../src/lib/markdown';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const handler: Handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // In Netlify Functions, we need to resolve paths relative to the function's location
    // Try multiple possible locations for the posts directory
    const possiblePaths = [
      path.join(process.cwd(), 'posts'),
      path.join(__dirname, '../../posts'),
      path.join(__dirname, '../../../posts'),
      '/var/task/posts',
      path.resolve('./posts'),
    ];

    const postsDirectory = possiblePaths.find(p => fs.existsSync(p));
    
    if (!postsDirectory) {
      console.error('Posts directory not found. Tried:', possiblePaths);
      console.error('Current working directory:', process.cwd());
      console.error('__dirname:', __dirname);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Posts directory not found',
          debug: {
            cwd: process.cwd(),
            dirname: __dirname,
            triedPaths: possiblePaths,
          }
        }),
      };
    }

    console.log('Using posts directory:', postsDirectory);

    // Get all posts metadata
    const allPosts = getSortedPostsData();

    // Get full content for each post
    const postsWithContent = allPosts.map((post) => {
      const fullPath = path.join(postsDirectory, `${post.id}.md`);
      
      if (!fs.existsSync(fullPath)) {
        console.warn(`Post file not found: ${fullPath}`);
        return null;
      }

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
    }).filter(post => post !== null);

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
  } catch (error: unknown) {
    console.error('Error fetching articles:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch articles',
        message: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && error instanceof Error && { stack: error.stack }),
      }),
    };
  }
};

