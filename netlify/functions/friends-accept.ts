// Accept friend request
import type { Handler } from '@netlify/functions';
import { sql } from '../shared/db';

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const id = event.path.split('/').pop();

        if (!id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Request ID is required' }),
            };
        }

        const result = await sql`
      UPDATE friend_requests
      SET status = 'ACCEPTED'
      WHERE id = ${id}
      RETURNING id, sender, receiver, status
    `;

        if (result.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Friend request not found' }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result[0]),
        };
    } catch (error) {
        console.error('Accept friend request error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
