import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User';
import generateTokens from '../utils/generateToken';
import { sendEmail } from '../utils/sendEmail';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Verify if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'El usuario ya existe' });
            return;
        }

        // Create User
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role 
        });

        if (user) {
            // Generate Token and Cookie
            generateTokens(res, user._id);

            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos' });
        }
    } catch (error) {
        console.log(error); 
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Search for user by email and include password field
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Generate Token and Cookie
            generateTokens(res, user._id);

        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role, 
            supermarket: user.supermarket
        };

        res.json({
            message: 'Inicio de sesión exitoso',
            user: userData // Send user data to frontend (except password)
        });
    } else {
        res.status(401).json({ message: 'Email o contraseña inválidos' });
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public 
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        // Read Refresh Token from cookie
        const refreshToken = req.cookies['jwt-refresh'];

        if (!refreshToken) {
            res.status(401).json({ message: 'No autorizado, no hay refresh token' });
            return;
        }

        // Verify Refresh Token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };

        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({ message: 'Usuario no encontrado' });
            return;
        }

        // Broadcast new Access Token
        generateTokens(res, user._id);

        res.json({ message: 'Token refrescado exitosamente' });

    } catch (error) {
        // If token is invalid or expired, clear cookies
        res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
        res.cookie('jwt-refresh', '', { httpOnly: true, expires: new Date(0) });
        res.status(403).json({ message: 'Refresh token inválido o expirado' });
    }
};

// @desc    Logout user (clean cookies)
// @route   POST /api/auth/logout
export const logoutUser = (req: Request, res: Response) => {
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(0),
        secure: isProduction,
        sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    };

    res.cookie('token', '', cookieOptions);
    
    res.cookie('jwt', '', cookieOptions);
    res.cookie('jwt-refresh', '', cookieOptions);

    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.user comes from the authMiddleware after verifying the JWT
        if (!req.user) {
            res.status(401).json({ message: 'No autorizado' });
            return;
        }
        
        const user = await User.findById(req.user._id)
        .select('-password')
        .populate('supermarket', 'name');
        
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
};

// @desc    Request password reset (send email with token)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Send 404 error to prevent email enumeration, but don't reveal that the email doesn't exist
            res.status(404).json({ message: 'Si el correo existe, se enviará un enlace de recuperación.' });
            return;
        }

        // Generate a random token using crypto
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Save the token and its expiration time in the user's document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // Create the email message with a nice design
        const message = `
            <h2>Recuperación de Contraseña - StockMaster</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
            <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Restablecer Contraseña</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">Si no solicitaste este cambio, ignora este correo. El enlace caducará en 15 minutos.</p>
        `;

        // Send the email using the utility function
        await sendEmail({
            email: user.email,
            subject: 'Recuperación de Contraseña',
            message,
        });

        res.status(200).json({ message: 'Correo enviado con éxito' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
};

// @desc    Restablecer contraseña usando el token
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Search for user with the matching reset token and check if it's not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() } // $gt means "greater than", so we check if the expiration time is in the future
        });

        if (!user) {
            res.status(400).json({ message: 'El token es inválido o ha expirado' });
            return;
        }

        user.password = password;

        // Clean up the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la contraseña' });
    }
};