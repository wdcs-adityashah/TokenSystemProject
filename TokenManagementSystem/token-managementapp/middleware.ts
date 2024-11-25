// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('your_secret_key'); // Use the same secret key

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/adminlogin', req.url));
    }

    const isValidToken = await verifyToken(token);

    if (!isValidToken) {
        return NextResponse.redirect(new URL('/adminlogin', req.url));
    }

    return NextResponse.next();
}

async function verifyToken(token: string): Promise<boolean> {
    try {
        await jwtVerify(token, SECRET_KEY);
        return true; // Token is valid
    } catch (error) {
        console.error('Token verification failed:', error);
        return false; // Token is invalid
    }
}

export const config = {
    matcher: ['/dashboard'], // Protect the dashboard route
};