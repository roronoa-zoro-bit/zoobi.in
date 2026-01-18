// Send a message
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
        const { sender, recipient, content } = JSON.parse(event.body || '{}');

        if (!sender || !recipient || !content) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Sender, recipient, and content are required' }),
            };
        }

        const message = await sql`
      INSERT INTO messages (sender, recipient, content)
      VALUES (${sender}, ${recipient}, ${content})
      RETURNING id, sender, recipient, content, timestamp
    `;

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(message[0]),
        };
    } catch (error) {
        console.error('Send message error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
