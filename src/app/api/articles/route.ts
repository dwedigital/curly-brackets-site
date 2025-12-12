import { NextResponse } from 'next/server';
import { getSortedPostsData } from '@/lib/markdown';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Required for API routes when using static export
export const dynamic = 'force-dynamic';

export async function GET() {
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
                image: post.image
            };
        });

        return NextResponse.json({
            count: postsWithContent.length,
            articles: postsWithContent
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch articles' },
            { status: 500 }
        );
    }
}
