import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-black text-white py-24">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16">
                    <Link href="/" className="flex items-center gap-4 mb-8 md:mb-0">
                        <Image
                            src="/images/logo.png"
                            alt="Curly Brackets Logo"
                            width={40}
                            height={40}
                            className="bg-white rounded-sm invert"
                        />
                        <span className="text-xl font-bold tracking-tighter">Curly Brackets</span>
                    </Link>
                    <ul className="flex space-x-8 text-sm text-gray-300">
                        <li>
                            <Link href="/" className="hover:text-white transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/blog" className="hover:text-white transition-colors">
                                Blog
                            </Link>
                        </li>
                        <li>
                            <a href="https://github.com/dwedigital/curly-brackets-site" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                GitHub
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="mt-24 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Curly Brackets. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
