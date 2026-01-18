// User signup endpoint
import type { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { sql } from '../shared/db';
import { generateToken } from '../shared/auth';

export const handler: Handler = async (event) => {
    // CORS headers
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
        const { username, email, firstName, lastName, secret } = JSON.parse(event.body || '{}');

        if (!username || !email || !secret) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Username, email, and password are required' }),
            };
        }

        // Check if user exists
        const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username} OR email = ${email}
    `;

        if (existingUser.length > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({ error: 'Username or email already exists' }),
            };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(secret, 10);

        // Create user
        const newUser = await sql`
      INSERT INTO users (username, email, password_hash, first_name, last_name)
      VALUES (${username}, ${email}, ${passwordHash}, ${firstName || ''}, ${lastName || ''})
      RETURNING id, username, email, first_name, last_name
    `;

        // Generate JWT
        const token = generateToken({ username, email });

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                token,
                username: newUser[0].username,
                email: newUser[0].email,
                firstName: newUser[0].first_name,
                lastName: newUser[0].last_name,
                id: newUser[0].id,
            }),
        };
    } catch (error) {
        console.error('Signup error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
