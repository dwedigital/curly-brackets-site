import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const services = [
    'Full Stack Development',
    'Artificial Intelligence',
    'Cloud Architecture',
    'Software Engineering Patterns',
];

export default function SplitSection() {
    return (
        <section className="mb-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight">Build Better Software</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-[4/3] bg-gray-100">
                        <Image
                            src="/images/architecture.png"
                            alt="Architectural detail"
                            fill
                            className="object-cover grayscale"
                        />
                    </div>
                    <div className="space-y-8">
                        <ul className="space-y-0">
                            {services.map((service) => (
                                <li key={service} className="border-b border-gray-200 py-6 flex justify-between items-center group cursor-pointer hover:bg-gray-50 px-4 transition-colors">
                                    <span className="font-medium">{service}</span>
                                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
