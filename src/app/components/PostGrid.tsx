import Image from 'next/image';
import Link from 'next/link';
import { PostData } from '@/lib/markdown';

interface PostGridProps {
    posts: PostData[];
}

export default function PostGrid({ posts }: PostGridProps) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="block group flex flex-col h-full">
                    <div className="relative aspect-[4/3] bg-gray-100 mb-6 overflow-hidden">
                        {post.image ? (
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover grayscale group-hover:scale-105 transition-transform duration-700"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gray-200 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    <span className="uppercase tracking-widest text-xs">Read</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex-grow">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h3 className="text-xl font-bold mb-3 leading-tight group-hover:underline decoration-2 underline-offset-4">
                            {post.title}
                        </h3>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-auto">
                            {post.date}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
