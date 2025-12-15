'use client';

import { useState } from 'react';
import { PostData } from '@/lib/markdown';
import PostGrid from './PostGrid';
import TagFilter from './TagFilter';
import Pagination from './Pagination';

interface FilteredPostGridProps {
    posts: PostData[];
}

export default function FilteredPostGrid({ posts }: FilteredPostGridProps) {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const POSTS_PER_PAGE = 6;

    const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || []))).sort();

    const filteredPosts = selectedTag
        ? posts.filter((post) => post.tags?.includes(selectedTag))
        : posts;

    // Reset pagination when tag filter changes
    const handleTagSelect = (tag: string | null) => {
        setSelectedTag(tag);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const displayedPosts = filteredPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of grid on page change for better UX
        const gridElement = document.getElementById('post-grid-top');
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div>
            <div id="post-grid-top" className="scroll-mt-24"></div>
            <TagFilter
                tags={allTags}
                selectedTag={selectedTag}
                onSelectTag={handleTagSelect}
            />
            <div className="mt-12">
                <PostGrid posts={displayedPosts} />

                <div className="mt-16">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
}
