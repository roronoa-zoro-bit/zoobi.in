// User login endpoint
import type { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { sql } from '../shared/db';
import { generateToken } from '../shared/auth';

export const handler: Handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
        const { username, secret } = JSON.parse(event.body || '{}');

        if (!username || !secret) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Username and password are required' }),
            };
        }

        // Find user
        const users = await sql`
      SELECT id, username, email, password_hash, first_name, last_name
      FROM users
      WHERE username = ${username}
    `;

        if (users.length === 0) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' }),
            };
        }

        const user = users[0];

        // Verify password
        const isValid = await bcrypt.compare(secret, user.password_hash);

        if (!isValid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' }),
            };
        }

        // Update last active
        await sql`
      UPDATE users
      SET last_active = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

        // Generate JWT
        const token = generateToken({ username: user.username, email: user.email });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                token,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                id: user.id,
            }),
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
