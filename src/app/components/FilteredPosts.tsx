'use client';

import { useState } from 'react';
import { PostData } from '@/lib/markdown';
import PostCarousel from './PostCarousel';
import TagFilter from './TagFilter';

interface FilteredPostsProps {
    posts: PostData[];
}

export default function FilteredPosts({ posts }: FilteredPostsProps) {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Extract unique tags from all posts
    const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || []))).sort();

    // Filter posts based on selected tag
    const filteredPosts = selectedTag
        ? posts.filter((post) => post.tags?.includes(selectedTag))
        : posts;

    return (
        <section id="latest-posts" className="mb-24">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight mb-8">Articles</h2>
                    <TagFilter
                        tags={allTags}
                        selectedTag={selectedTag}
                        onSelectTag={setSelectedTag}
                    />
                </div>
                <PostCarousel posts={filteredPosts} />
            </div>
        </section>
    );
}
