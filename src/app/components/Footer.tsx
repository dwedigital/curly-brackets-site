import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-black text-white py-24">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12">
                    <div className="col-span-1">
                        <Link href="/" className="flex items-center gap-4 mb-8">
                            <Image
                                src="/images/logo.png"
                                alt="Curly Brackets Logo"
                                width={40}
                                height={40}
                                className="bg-white rounded-sm invert"
                            />
                            <span className="text-xl font-bold tracking-tighter">Curly Brackets</span>
                        </Link>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Services</h4>
                        <ul className="space-y-4 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">Storytelling</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Production</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Editing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Connect</h4>
                        <ul className="space-y-4 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-24 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Curly Brackets. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
