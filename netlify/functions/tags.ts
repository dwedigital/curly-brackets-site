import { Handler } from '@netlify/functions';
import { CANONICAL_TAGS, getValidTagNames } from '../../src/lib/tags';

export const handler: Handler = async (event) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                count: CANONICAL_TAGS.length,
                tags: getValidTagNames(),
                tagDefinitions: CANONICAL_TAGS,
            }),
        };
    } catch (error: unknown) {
        console.error('Error fetching tags:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Failed to fetch tags',
                message: error instanceof Error ? error.message : 'Unknown error',
            }),
        };
    }
};
