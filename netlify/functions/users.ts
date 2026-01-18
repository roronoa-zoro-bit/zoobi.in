// Get all users endpoint
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
        const users = await sql`
      SELECT id, username, email, first_name, last_name, last_active
      FROM users
      ORDER BY username ASC
    `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(users),
        };
    } catch (error) {
        console.error('Get users error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
