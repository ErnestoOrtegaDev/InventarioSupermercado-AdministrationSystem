import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// @desc    Obtener lista de todos los usuarios
// @route   GET /api/users
// @access  Privado (Idealmente solo Admin)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }

        const { role, supermarket } = req.user; // Obtenemos los datos de quien hace la petición

        let query = {}; // Por defecto, una consulta vacía (trae todo)

        // LÓGICA DE NEGOCIO PARA VER USUARIOS:
        if (role === 'manager') {
            // Si es manager, obligatoriamente solo puede ver a los de SU supermercado
            query = { supermarket: supermarket };
        } 
        // Si es 'admin', la query se queda vacía y trae a TODOS.

        const users = await User.find(query)
            .select('-password')
            .populate('supermarket', 'name address'); 
            
        res.status(200).json(users);
    } catch (error) {
        console.error(`[Error in getUsers]: ${error}`);
        res.status(500).json({ message: 'Error interno al obtener la lista de usuarios' });
    }
};

// @desc    Crear un nuevo usuario (Trabajador, Gerente, etc.)
// @route   POST /api/users
// @access  Privado (Idealmente solo Admin)
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, email, password, role, supermarket, active } = req.body;

        // Verificación de existencia para evitar duplicados
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'El correo proporcionado ya está registrado' });
            return;
        }


        // Creación del registro en base de datos
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: password,
            role: role || 'worker',
            // Si el rol es global (admin/provider) o no enviaron sucursal, lo dejamos indefinido
            supermarket: supermarket || undefined, 
            status: active ?? true
        });

        // Recuperamos el usuario recién creado con sus relaciones (populate)
        const populatedUser = await User.findById(newUser._id)
            .select('-password')
            .populate('supermarket', 'name');

        res.status(201).json(populatedUser);
    } catch (error) {
        console.error(`[Error in createUser]: ${error}`);
        res.status(500).json({ message: 'Error interno al crear el usuario' });
    }
};

// @desc    Actualizar datos o rol de un usuario existente
// @route   PUT /api/users/:id
// @access  Privado (Idealmente solo Admin)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { password, ...updateData } = req.body;

        // Manejo condicional de la contraseña (solo si el cliente envía una nueva)
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Limpieza de relaciones inconsistentes
        // Si el usuario cambia a un rol global, debemos desvincularlo de cualquier sucursal
        if (updateData.role === 'admin' || updateData.role === 'provider' || !updateData.supermarket) {
            updateData.$unset = { supermarket: 1 }; // Operador de MongoDB para eliminar el campo
            delete updateData.supermarket;          // Lo quitamos del objeto de actualización
        }

        // Actualización y retorno del nuevo documento (new: true)
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true } // runValidators asegura que el Enum de 'role' se respete
        ).select('-password').populate('supermarket', 'name');

        if (!updatedUser) {
            res.status(404).json({ message: 'Usuario no encontrado en la base de datos' });
            return;
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(`[Error in updateUser]: ${error}`);
        res.status(500).json({ message: 'Error interno al actualizar el usuario' });
    }
};

// @desc    Desactivar un usuario (Soft Delete)
// @route   DELETE /api/users/:id
// @access  Privado (Idealmente solo Admin)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        // Aplicamos Soft Delete cambiando el status a false para no perder el historial
        const user = await User.findByIdAndUpdate(id, { status: false });
        
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        res.status(200).json({ message: 'Usuario dado de baja correctamente' });
    } catch (error) {
        console.error(`[Error in deleteUser]: ${error}`);
        res.status(500).json({ message: 'Error interno al dar de baja al usuario' });
    }
};