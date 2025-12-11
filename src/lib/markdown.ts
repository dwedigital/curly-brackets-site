import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface PostData {
    id: string;
    date: string;
    title: string;
    tags?: string[];
    image?: string | null;
    contentHtml?: string;
    [key: string]: any;
}

export function getSortedPostsData(): PostData[] {
    // Create posts directory if it doesn't exist
    if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory);
    }

    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id
        const id = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        // Check if a hero image exists for this post
        const imagesDirectory = path.join(process.cwd(), 'public/images/posts');
        const imagePath = path.join(imagesDirectory, `${id}.png`);
        const image = fs.existsSync(imagePath) ? `/images/posts/${id}.png` : null;

        // Combine the data with the id
        return {
            id,
            image,
            ...matterResult.data,
        } as PostData;
    });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getAllPostIds() {
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames.map((fileName) => {
        return {
            params: {
                slug: fileName.replace(/\.md$/, ''),
            },
        };
    });
}

export async function getPostData(id: string): Promise<PostData> {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use unified pipeline to convert markdown into HTML string with highlighting
    const processedContent = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // Check if a hero image exists for this post
    const imagesDirectory = path.join(process.cwd(), 'public/images/posts');
    const imagePath = path.join(imagesDirectory, `${id}.png`);
    const image = fs.existsSync(imagePath) ? `/images/posts/${id}.png` : null;

    // Combine the data with the id, contentHtml, and image
    return {
        id,
        contentHtml,
        image,
        ...(matterResult.data as { date: string; title: string; tags?: string[] }),
    };
}

export interface AdjacentPosts {
    previous: PostData | null;
    next: PostData | null;
}

export function getAdjacentPosts(currentPostId: string): AdjacentPosts {
    const allPosts = getSortedPostsData();
    const currentIndex = allPosts.findIndex((post) => post.id === currentPostId);

    if (currentIndex === -1) {
        return { previous: null, next: null };
    }

    // Since posts are sorted newest first:
    // - previous post (older) is at index + 1
    // - next post (newer) is at index - 1
    const previous = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    const next = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

    return { previous, next };
}
