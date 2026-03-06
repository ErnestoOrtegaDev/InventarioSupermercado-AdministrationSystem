import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { Types } from 'mongoose';

const generateTokens = (res: Response, userId: Types.ObjectId) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Create Access Token (Short-lived: 15 minutes)
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
        expiresIn: '15m', 
    });

    // Create Refresh Token (Long-lived: 1 day)
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: '1d',
    });

    // Common cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // false en localhost, true en Render
        sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    };

    // Cookie from Access Token
    res.cookie('jwt', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Cookie from Refresh Token
    res.cookie('jwt-refresh', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/' 
    });

    return { accessToken, refreshToken };
};

export default generateTokens;