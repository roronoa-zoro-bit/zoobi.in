// Shared database connection using Neon
import { neon } from '@netlify/neon';

export const sql = neon(process.env.DATABASE_URL || '');

// TypeScript interfaces
export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
    created_at: Date;
    last_active: Date;
}

export interface Message {
    id: number;
    sender: string;
    recipient: string;
    content: string;
    timestamp: Date;
}

export interface FriendRequest {
    id: number;
    sender: string;
    receiver: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    created_at: Date;
}
