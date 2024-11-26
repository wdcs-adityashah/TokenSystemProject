import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';

// Use a string for the secret key
const SECRET_KEY = 'your_secret_key'; // Use the same secret key for signing and verifying

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
        // Convert the secret key to Uint8Array for jose
        const secretKeyBuffer = new TextEncoder().encode(SECRET_KEY);
        await jwtVerify(token, secretKeyBuffer);
        return true; // Token is valid
    } catch (error) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            console.error('Token has expired. Redirecting to login.');
            return false; // Token is invalid
        }
        console.error('Token verification failed:', error);
        return false; // Token is invalid
    }
}

// Refresh Token function
export const RefreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.sendStatus(401); // Unauthorized
    }

    try {
        // Use the same secret key for verifying the refresh token
        const payload = jwt.verify(refreshToken, SECRET_KEY);
        const newToken = jwt.sign({ email: payload.email }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token: newToken });
    } catch (error) {
        console.error('Refresh token verification failed:', error);
        return res.sendStatus(403); // Forbidden
    }
};

export const config = {
    matcher: ['/dashboard'], // Protect the dashboard route
};