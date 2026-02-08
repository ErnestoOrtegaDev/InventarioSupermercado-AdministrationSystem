import { Request, Response } from 'express';
import Supermarket from '../models/Supermarket';

// @desc    Obtener todos los supermercados
// @route   GET /api/supermarkets
// @access  Private (Admin/Worker/Provider)
export const getSupermarkets = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }
        const { role, supermarket } = req.user; 

        let query = { active: true }; 

        // LÓGICA DE ROLES:
        
        // CASO A: Admin o Proveedor -> Ven TODOS los supermercados
        if (role === 'admin' || role === 'provider') {
        } 
        
        // CASO B: Manager o Worker -> Solo ven SU supermercado
        else if (role === 'manager' || role === 'worker') {
            if (!supermarket) {
                res.status(400).json({ message: 'Usuario sin supermercado asignado' });
                return;
            }
            Object.assign(query, { _id: supermarket });
        }

        const supermarkets = await Supermarket.find(query);
        res.json(supermarkets);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener supermercados' });
    }
};

// @desc    Crear un supermercado
// @route   POST /api/supermarkets
// @access  Private (Admin Only)
export const createSupermarket = async (req: Request, res: Response): Promise<void> => {
    try {
        // Nota: req.user vendrá del middleware
        if (!req.user) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }

        const { name, address, phone } = req.body;

        const supermarketExists = await Supermarket.findOne({ name });
        if (supermarketExists) {
            res.status(400).json({ message: 'Ya existe un supermercado con ese nombre' });
            return;
        }

        const supermarket = await Supermarket.create({
            name,
            address,
            phone,
            createdBy: req.user._id 
        });

        res.status(201).json(supermarket);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al crear supermercado' });
    }
};

// @desc    Actualizar un supermercado
// @route   PUT /api/supermarkets/:id
// @access  Private (Admin Only)
export const updateSupermarket = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const supermarket = await Supermarket.findById(id);

        if (!supermarket) {
            res.status(404).json({ message: 'Supermercado no encontrado' });
            return;
        }

        const updatedSupermarket = await Supermarket.findByIdAndUpdate(id, req.body, {
            new: true, 
            runValidators: true
        });

        res.json(updatedSupermarket);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar' });
    }
};

// @desc    Eliminar (Soft Delete) un supermercado
// @route   DELETE /api/supermarkets/:id
// @access  Private (Admin Only)
export const deleteSupermarket = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const supermarket = await Supermarket.findById(id);

        if (!supermarket) {
            res.status(404).json({ message: 'Supermercado no encontrado' });
            return;
        }

        // Soft delete: Solo cambiamos active a false
        supermarket.active = false;
        await supermarket.save();

        res.json({ message: 'Supermercado eliminado (archivado) correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
};