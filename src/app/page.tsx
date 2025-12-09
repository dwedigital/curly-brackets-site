import { getSortedPostsData } from '@/lib/markdown';
import Header from '@/app/components/Header';
import Hero from '@/app/components/Hero';
import FeatureGrid from '@/app/components/FeatureGrid';
import SplitSection from '@/app/components/SplitSection';
import FilteredPosts from '@/app/components/FilteredPosts';
import Footer from '@/app/components/Footer';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-grow">
        <Hero />
        <FeatureGrid />
        <SplitSection />
        <FilteredPosts posts={allPostsData} />
      </main>
      <Footer />
    </div>
  );
}
