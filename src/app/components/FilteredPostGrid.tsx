'use client';

import { useState } from 'react';
import { PostData } from '@/lib/markdown';
import PostGrid from './PostGrid';
import TagFilter from './TagFilter';

interface FilteredPostGridProps {
    posts: PostData[];
}

export default function FilteredPostGrid({ posts }: FilteredPostGridProps) {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || []))).sort();

    const filteredPosts = selectedTag
        ? posts.filter((post) => post.tags?.includes(selectedTag))
        : posts;

    return (
        <div>
            <TagFilter
                tags={allTags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
            />
            <div className="mt-12">
                <PostGrid posts={filteredPosts} />
            </div>
        </div>
    );
}
