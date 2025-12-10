import { Code, Terminal, Cpu, Globe, Database, Layers, Command, Hash } from 'lucide-react';

const topics = [
    { name: 'AI & ML', icon: Cpu },
    { name: 'Web Dev', icon: Globe },
    { name: 'DevOps', icon: Terminal },
    { name: 'Algorithms', icon: Code },
    { name: 'System Design', icon: Layers },
    { name: 'Databases', icon: Database },
    { name: 'Security', icon: Hash },
    { name: 'Cloud', icon: Command },
];

export default function FeatureGrid() {
    return (
        <section className="py-24 bg-gray-50 mb-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Exploring technology, from neural networks to distributed systems.
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
                    {topics.map((topic) => (
                        <div key={topic.name} className="bg-white p-12 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors group cursor-pointer">
                            <topic.icon className="w-8 h-8 mb-4 text-gray-400 group-hover:text-black transition-colors" />
                            <span className="font-semibold tracking-tight">{topic.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
