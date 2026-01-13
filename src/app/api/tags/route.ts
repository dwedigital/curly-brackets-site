import { NextResponse } from 'next/server';
import { CANONICAL_TAGS, getValidTagNames } from '@/lib/tags';

// This API route works in development mode
// In production (static export), the Netlify Function at /.netlify/functions/tags is used
export async function GET() {
    try {
        return NextResponse.json({
            count: CANONICAL_TAGS.length,
            tags: getValidTagNames(),
            tagDefinitions: CANONICAL_TAGS,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}
