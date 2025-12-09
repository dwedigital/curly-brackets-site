import Image from 'next/image';
import Link from 'next/link';
import { PostData } from '@/lib/markdown';

interface BlogFeedProps {
    posts: PostData[];
}

export default function BlogFeed({ posts }: BlogFeedProps) {
    return (
        <div className="space-y-16">
            {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="block group">
                    <div className="relative aspect-[21/9] bg-gray-100 mb-6 overflow-hidden">
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
                                    <span className="uppercase tracking-widest text-sm">Read Article</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="max-w-2xl">
                        <h3 className="text-2xl font-bold mb-3 group-hover:underline decoration-2 underline-offset-4">
                            {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            A deep dive into the concepts and ideas behind {post.title}. Explore the narrative.
                        </p>
                        <div className="flex items-center text-sm text-gray-500 font-medium uppercase tracking-wider">
                            <span>{post.date}</span>
                            <span className="mx-2">•</span>
                            <span>Read More</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
