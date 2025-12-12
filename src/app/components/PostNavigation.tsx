import Link from 'next/link';
import { PostData } from '@/lib/markdown';

interface PostNavigationProps {
    previous: PostData | null;
    next: PostData | null;
}

export default function PostNavigation({ previous, next }: PostNavigationProps) {
    if (!previous && !next) {
        return null;
    }

    return (
        <nav className="w-full border-t border-gray-200 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
                    {/* Previous Post - Aligned to Left on desktop, Top on mobile */}
                    {previous && (
                        <Link
                            href={`/blog/${previous.id}`}
                            className="flex items-center bg-black text-white px-6 py-4 group hover:bg-gray-800 transition-colors duration-300 w-full md:max-w-md md:w-auto"
                        >
                            <div className="flex items-center gap-4">
                                {/* Left Arrow */}
                                <svg
                                    className="w-8 h-8 flex-shrink-0 text-white group-hover:-translate-x-1 transition-transform duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase tracking-widest text-white opacity-70 mb-1">
                                        Previous
                                    </span>
                                    <span className="font-bold text-sm md:text-base line-clamp-2 text-white">
                                        {previous.title}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}


                    {/* Next Post - Aligned to Right on desktop, Bottom on mobile */}
                    {next && (
                        <Link
                            href={`/blog/${next.id}`}
                            className="flex items-center bg-black text-white px-6 py-4 group hover:bg-gray-800 transition-colors duration-300 w-full md:max-w-md md:w-auto md:ml-auto"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col text-right">
                                    <span className="text-xs uppercase tracking-widest text-white opacity-70 mb-1">
                                        Next
                                    </span>
                                    <span className="font-bold text-sm md:text-base line-clamp-2 text-white">
                                        {next.title}
                                    </span>
                                </div>
                                {/* Right Arrow */}
                                <svg
                                    className="w-8 h-8 flex-shrink-0 text-white group-hover:translate-x-1 transition-transform duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
