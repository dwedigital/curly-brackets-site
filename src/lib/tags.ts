/**
 * Canonical tags for blog posts.
 * LLMs should query /api/tags to get this list when creating new posts.
 */

export interface TagDefinition {
    name: string;
    category: 'language' | 'framework' | 'domain' | 'database' | 'concept' | 'tool' | 'meta';
    description: string;
}

export const CANONICAL_TAGS: TagDefinition[] = [
    // Languages
    { name: 'Python', category: 'language', description: 'Python programming language' },
    { name: 'JavaScript', category: 'language', description: 'JavaScript programming language' },
    { name: 'TypeScript', category: 'language', description: 'TypeScript programming language' },
    { name: 'Go', category: 'language', description: 'Go/Golang programming language' },
    { name: 'Bash', category: 'language', description: 'Bash scripting and shell commands' },
    { name: 'Ruby', category: 'language', description: 'Ruby programming language' },
    { name: 'SQL', category: 'language', description: 'SQL and database queries' },

    // Frameworks
    { name: 'React', category: 'framework', description: 'React library and ecosystem' },
    { name: 'Node.js', category: 'framework', description: 'Node.js runtime and server-side JavaScript' },
    { name: 'Next.js', category: 'framework', description: 'Next.js React framework' },

    // Domains
    { name: 'Web Development', category: 'domain', description: 'General web development topics' },
    { name: 'DevOps', category: 'domain', description: 'DevOps practices, CI/CD, infrastructure' },
    { name: 'Data Engineering', category: 'domain', description: 'Data pipelines, ETL, data processing' },
    { name: 'Machine Learning', category: 'domain', description: 'ML models, training, inference' },
    { name: 'AI', category: 'domain', description: 'Artificial intelligence, LLMs, AI agents' },
    { name: 'CLI', category: 'domain', description: 'Command-line interfaces and terminal tools' },
    { name: 'Backend', category: 'domain', description: 'Backend development and server architecture' },

    // Databases
    { name: 'Databases', category: 'database', description: 'General database topics, SQL/NoSQL' },
    { name: 'Vector Databases', category: 'database', description: 'Vector databases for embeddings and similarity search' },

    // Concepts
    { name: 'API', category: 'concept', description: 'API design, REST, GraphQL' },
    { name: 'Automation', category: 'concept', description: 'Task automation, scripting, workflows' },
    { name: 'Performance', category: 'concept', description: 'Performance optimization, profiling' },
    { name: 'Serverless', category: 'concept', description: 'Serverless architecture and functions' },
    { name: 'Edge Computing', category: 'concept', description: 'Edge functions and distributed computing' },
    { name: 'Architecture', category: 'concept', description: 'Software architecture and system design' },
    { name: 'Testing', category: 'concept', description: 'Testing strategies, frameworks, best practices' },
    { name: 'Security', category: 'concept', description: 'Security best practices and vulnerability prevention' },

    // Tools
    { name: 'GitHub Actions', category: 'tool', description: 'GitHub Actions CI/CD workflows' },
    { name: 'Docker', category: 'tool', description: 'Docker containers and containerization' },

    // Meta
    { name: 'Beginner Guide', category: 'meta', description: 'Introductory content for beginners' },
    { name: 'Best Practices', category: 'meta', description: 'Industry best practices and patterns' },
    { name: 'Tutorial', category: 'meta', description: 'Step-by-step tutorial content' },
];

/** Get all valid tag names */
export function getValidTagNames(): string[] {
    return CANONICAL_TAGS.map(tag => tag.name);
}

/** Check if a tag is valid */
export function isValidTag(tag: string): boolean {
    return CANONICAL_TAGS.some(t => t.name.toLowerCase() === tag.toLowerCase());
}

/** Get tags by category */
export function getTagsByCategory(category: TagDefinition['category']): TagDefinition[] {
    return CANONICAL_TAGS.filter(tag => tag.category === category);
}

/** Find closest matching tag (for migration suggestions) */
export function findClosestTag(tag: string): string | null {
    const lower = tag.toLowerCase();

    // Exact match (case-insensitive)
    const exact = CANONICAL_TAGS.find(t => t.name.toLowerCase() === lower);
    if (exact) return exact.name;

    // Common mappings
    const mappings: Record<string, string> = {
        'ai agents': 'AI',
        'llm': 'AI',
        'rag': 'AI',
        'mcp': 'AI',
        'asyncio': 'Python',
        'scripting': 'Bash',
        'backend architecture': 'Architecture',
        'software architecture': 'Architecture',
        'software engineering': 'Architecture',
        'clean code': 'Best Practices',
        'debugging': 'Testing',
        'web scraping': 'Automation',
        'web performance': 'Performance',
        'playwright': 'Testing',
        'real-time': 'Web Development',
        'nosql': 'Databases',
        'express': 'Node.js',
        'netlify': 'Serverless',
        'n8n': 'Automation',
        'orchestration': 'Data Engineering',
        'algorithms': 'Architecture',
        'computer science': 'Architecture',
        'open source': 'Best Practices',
        'productivity': 'Automation',
        'search': 'Databases',
        'beginner guide': 'Beginner Guide',
    };

    return mappings[lower] || null;
}
