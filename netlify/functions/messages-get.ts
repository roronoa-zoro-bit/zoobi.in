// Get messages between two users
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
        const { user1, user2 } = event.queryStringParameters || {};

        if (!user1 || !user2) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Both user1 and user2 are required' }),
            };
        }

        const messages = await sql`
      SELECT id, sender, recipient, content, timestamp
      FROM messages
      WHERE (sender = ${user1} AND recipient = ${user2})
         OR (sender = ${user2} AND recipient = ${user1})
      ORDER BY timestamp ASC
    `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(messages),
        };
    } catch (error) {
        console.error('Get messages error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
