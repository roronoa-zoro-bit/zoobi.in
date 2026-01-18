// Send friend request
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
        const { sender, receiver } = JSON.parse(event.body || '{}');

        if (!sender || !receiver) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Sender and receiver are required' }),
            };
        }

        // Check if request already exists
        const existing = await sql`
      SELECT id FROM friend_requests
      WHERE (sender = ${sender} AND receiver = ${receiver})
         OR (sender = ${receiver} AND receiver = ${sender})
    `;

        if (existing.length > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({ error: 'Friend request already exists' }),
            };
        }

        // Create friend request
        const request = await sql`
      INSERT INTO friend_requests (sender, receiver, status)
      VALUES (${sender}, ${receiver}, 'PENDING')
      RETURNING id, sender, receiver, status, created_at
    `;

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(request[0]),
        };
    } catch (error) {
        console.error('Friend request error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
