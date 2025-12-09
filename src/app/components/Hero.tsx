import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="mb-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
                        Master the art of code through clear, concise guides.
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Demystifying complex technology, AI, and software engineering concepts for the modern developer.
                    </p>
                    <Link
                        href="#latest-posts"
                        className="inline-block bg-black text-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                    >
                        Start Learning
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
