'use client';

interface TagFilterProps {
    tags: string[];
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

export default function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
    return (
        <div className="flex overflow-x-auto md:flex-wrap gap-2 md:justify-center mb-12 pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
            <button
                onClick={() => onSelectTag(null)}
                className={`flex-none snap-start px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedTag === null
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                All
            </button>
            {tags.map((tag) => (
                <button
                    key={tag}
                    onClick={() => onSelectTag(tag)}
                    className={`flex-none snap-start px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedTag === tag
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
}
