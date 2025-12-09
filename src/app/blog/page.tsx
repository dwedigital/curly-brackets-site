import { getSortedPostsData } from '@/lib/markdown';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import FilteredPostGrid from '@/app/components/FilteredPostGrid';

export const metadata = {
    title: 'Blog | Curly Brackets',
    description: 'Latest articles, tutorials, and insights on coding, AI, and technology.',
};

export default function BlogIndex() {
    const allPostsData = getSortedPostsData();

    return (
        <div className="min-h-screen flex flex-col bg-white text-black">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
                        The Archive
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Explore our collection of articles on software engineering, design patterns, and the future of tech.
                    </p>
                </div>

                <FilteredPostGrid posts={allPostsData} />
            </main>
            <Footer />
        </div>
    );
}
