import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="mb-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
                        Built by AI. Curated by Human.
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        This entire site - code, content, and imagery - is a living experiment in agentic workflows.
                    </p>
                    <Link
                        href="#latest-posts"
                        className="inline-block bg-black !text-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                    >
                        View the content
                    </Link>
                </div>
                <div className="relative aspect-[21/9] w-full overflow-hidden bg-gray-100">
                    <Image
                        src="/images/hero.png"
                        alt="Dramatic landscape"
                        fill
                        className="object-cover grayscale"
                        priority
                    />
                </div>
            </div>
        </section>
    );
}
