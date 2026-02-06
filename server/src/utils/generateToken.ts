import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { Types } from 'mongoose';

const generateTokens = (res: Response, userId: Types.ObjectId) => {
  // Crear Access Token (Vida corta: 15 min)
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
        expiresIn: '15m', 
    });

  // Crear Refresh Token (Vida larga: 7 días)
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: '1d',
    });

  // Cookie del Access Token 
    res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, 
    });

  // Cookie del Refresh Token 
    res.cookie('jwt-refresh', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        path: '/' 
    });

    return { accessToken, refreshToken };
};

export default generateTokens;