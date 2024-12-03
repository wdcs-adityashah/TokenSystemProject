import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key';

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
        const secretKeyBuffer = new TextEncoder().encode(SECRET_KEY);
        await jwtVerify(token, secretKeyBuffer);
        return true;
    } catch (error) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            console.error('Token has expired. Redirecting to login.');
            return false;
        }
        console.error('Token verification failed:', error);
        return false; 
    }
}

export const RefreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.sendStatus(401);
    }

    try {
        const payload = jwt.verify(refreshToken, SECRET_KEY);
        const newToken = jwt.sign({ email: payload.email }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token: newToken });
    } catch (error) {
        console.error('Refresh token verification failed:', error);
        return res.sendStatus(403); 
    }
};

export const config = {
    matcher: ['/dashboard'], 
};