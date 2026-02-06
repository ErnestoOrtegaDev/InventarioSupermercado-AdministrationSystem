import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

interface DecodedToken {
    userId: string;
    iat: number;
    exp: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {
            // Decodificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

            // Buscar usuario en BD y adjuntarlo a la request
            // Excluimos password y campos sensibles
            const user = await User.findById(decoded.userId).select('-password');
            
            if (!user) {
                res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
                return;
            }

            req.user = user;
            next(); 
        } catch (error) {
            res.status(401).json({ message: 'No autorizado, token inválido' });
        }
    } else {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

// Middleware para verificar Roles
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Administrador' });
    }
};