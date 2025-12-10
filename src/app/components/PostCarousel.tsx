import Link from 'next/link';
import Image from 'next/image';
import { PostData } from '@/lib/markdown';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface PostCarouselProps {
    posts: PostData[];
}

export default function PostCarousel({ posts }: PostCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="relative group">
            {posts.length > 3 && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {posts.map((post) => (
                    <div key={post.id} className="w-[85vw] md:w-[384px] shrink-0 snap-start">
                        <Link href={`/blog/${post.id}`} className="block group/card h-full flex flex-col">
                            <div className="relative h-64 w-full bg-gray-100 mb-4 overflow-hidden">
                                {post.image ? (
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover grayscale group-hover/card:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gray-200 group-hover/card:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <span className="uppercase tracking-widest text-xs">Read</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {post.tags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="text-lg font-bold mb-2 leading-tight group-hover/card:underline decoration-2 underline-offset-4">
                                    {post.title}
                                </h3>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    {post.date}
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {posts.length > 3 && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}
