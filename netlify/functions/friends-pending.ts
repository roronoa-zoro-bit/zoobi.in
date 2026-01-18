// Get pending friend requests
import type { Handler } from '@netlify/functions';
import { sql } from '../shared/db';

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const username = event.queryStringParameters?.username;

        if (!username) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Username is required' }),
            };
        }

        const requests = await sql`
      SELECT id, sender, receiver, status, created_at
      FROM friend_requests
      WHERE receiver = ${username} AND status = 'PENDING'
      ORDER BY created_at DESC
    `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(requests),
        };
    } catch (error) {
        console.error('Get pending requests error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
