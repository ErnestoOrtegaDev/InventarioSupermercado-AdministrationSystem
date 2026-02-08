import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'

import User from '../models/User';
import generateTokens from '../utils/generateToken';

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