import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import User from '../models/User';
import generateTokens from '../utils/generateToken';
import { sendEmail } from '../utils/sendEmail';

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Verificar si ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'El usuario ya existe' });
            return;
        }

        // Crear usuario
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role 
        });

        if (user) {
            // Generar Token y Cookie
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

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Buscar usuario 
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Generar Token y Cookie
            generateTokens(res, user._id);

        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role, // <--- ESTE ES EL IMPORTANTE
            supermarket: user.supermarket
        };

        res.json({
            message: 'Inicio de sesión exitoso',
            user: userData // Enviamos el objeto limpio
        });
    } else {
        res.status(401).json({ message: 'Email o contraseña inválidos' });
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// @desc    Refrescar Access Token
// @route   POST /api/auth/refresh
// @access  Public 
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        // Leer el Refresh Token de la cookie
        const refreshToken = req.cookies['jwt-refresh'];

        if (!refreshToken) {
            res.status(401).json({ message: 'No autorizado, no hay refresh token' });
            return;
        }

        // Verificar el Refresh Token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };

        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({ message: 'Usuario no encontrado' });
            return;
        }

        // Emitimos NUEVOS tokens (Access nuevo + Refresh nuevo)
        generateTokens(res, user._id);

        res.json({ message: 'Token refrescado exitosamente' });

    } catch (error) {
        // Si el refresh token expiró o es inválido, forzamos logout
        res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
        res.cookie('jwt-refresh', '', { httpOnly: true, expires: new Date(0) });
        res.status(403).json({ message: 'Refresh token inválido o expirado' });
    }
};

// @desc    Cerrar Sesión
// @route   POST /api/auth/logout
export const logoutUser = (req: Request, res: Response) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.cookie('jwt-refresh', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
};

// @desc    Obtener usuario actual (Profile)
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.user viene del middleware 'protect'
        if (!req.user) {
            res.status(401).json({ message: 'No autorizado' });
            return;
        }
        
        // CORRECCIÓN: Usamos _id en lugar de id
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

// @desc    Solicitar recuperación de contraseña
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Mandamos 404 pero un mensaje genérico por seguridad (para que no adivinen correos)
            res.status(404).json({ message: 'Si el correo existe, se enviará un enlace de recuperación.' });
            return;
        }

        // Generar un Token aleatorio de 20 caracteres
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Guardar el token en el usuario y darle 15 minutos de vida
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        await user.save();

        // Crear la URL que apuntará a tu Frontend (React)
        // OJO: Esta URL la crearemos en el frontend en el siguiente paso
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // Crear el diseño del correo
        const message = `
            <h2>Recuperación de Contraseña - StockMaster</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
            <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Restablecer Contraseña</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">Si no solicitaste este cambio, ignora este correo. El enlace caducará en 15 minutos.</p>
        `;

        // 5. Enviar el correo
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

        // 1. Buscar al usuario que tenga ese token Y que el token no haya expirado
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() } // $gt significa "Greater Than" (Mayor que ahora)
        });

        if (!user) {
            res.status(400).json({ message: 'El token es inválido o ha expirado' });
            return;
        }

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Limpiar los campos del token para que no se pueda volver a usar
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la contraseña' });
    }
};