// JWT helper functions
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'zoobi-secret-key-change-in-production';
const JWT_EXPIRATION = '24h';

export interface JWTPayload {
    username: string;
    email: string;
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
}

export function extractToken(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
