import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    return (
        <header className="py-8 mb-12 border-b border-gray-200">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <Image
                        src="/images/logo.png"
                        alt="Curly Brackets Logo"
                        width={50}
                        height={50}
                        className="bg-white rounded-sm"
                    />
                    <span className="text-2xl font-bold tracking-tighter">Curly Brackets</span>
                </Link>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="/" className="hover:text-gray-600 transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/blog" className="hover:text-gray-600 transition-colors">
                                Blog
                            </Link>
                        </li>
                        <li>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
                                GitHub
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
