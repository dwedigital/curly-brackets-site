import { getAllPostIds, getPostData, getAdjacentPosts } from '@/lib/markdown';
import Header from '@/app/components/Header';
import { Metadata } from 'next';
import Footer from '@/app/components/Footer';
import PostNavigation from '@/app/components/PostNavigation';
import Image from 'next/image';
import { generateBlogPostingStructuredData, extractDescription, getBaseUrl } from '@/lib/structured-data';

export async function generateStaticParams() {
    const paths = getAllPostIds();
    return paths.map((path) => ({
        slug: path.params.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const postData = await getPostData(slug);
    const description = extractDescription(postData.contentHtml);
    const baseUrl = getBaseUrl();
    const imageUrl = postData.image
        ? `${baseUrl}${postData.image.startsWith('/') ? '' : '/'}${postData.image}`
        : `${baseUrl}/images/logo.webp`;

    return {
        title: `${postData.title} | Curly Brackets`,
        description: description,
        openGraph: {
            title: postData.title,
            description: description,
            images: [imageUrl],
            type: 'article',
            publishedTime: postData.date ? new Date(postData.date).toISOString() : undefined,
            tags: postData.tags,
        },
        twitter: {
            card: 'summary_large_image',
            title: postData.title,
            description: description,
            images: [imageUrl],
        },
    };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getPostData(slug);
    const adjacentPosts = getAdjacentPosts(slug);
    const structuredData = generateBlogPostingStructuredData(postData);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <div className="min-h-screen flex flex-col bg-white text-black">
                <Header />
                <main className="flex-grow">
                    {postData.image && (
                        <div className="relative w-full h-[40vh] mb-16 overflow-hidden bg-gray-100">
                            <Image
                                src={postData.image}
                                alt={postData.title}
                                fill
                                className="object-cover grayscale"
                                priority
                            />
                        </div>
                    )}

                    <article className="container mx-auto px-4 max-w-4xl mb-8">
                        <header className="mb-16 text-center">
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
                                {postData.title}
                            </h1>
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-lg text-gray-500 font-medium uppercase tracking-widest">
                                    {postData.date}
                                </div>
                                {postData.tags && postData.tags.length > 0 && (
                                    <div className="flex gap-2">
                                        {postData.tags.map((tag) => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </header>

                        {!postData.image && <div className="w-full h-px bg-gray-200 mb-16"></div>}

                        <div
                            className="prose prose-xl prose-neutral mx-auto prose-headings:font-bold prose-headings:tracking-tight prose-a:bg-black prose-a:text-white prose-a:px-1 prose-a:py-0.5 prose-a:no-underline hover:prose-a:bg-gray-800 transition-colors"
                            dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }}
                        />
                    </article>
                    <PostNavigation previous={adjacentPosts.previous} next={adjacentPosts.next} />
                </main>
                <Footer />
            </div>
        </>
    );
}
