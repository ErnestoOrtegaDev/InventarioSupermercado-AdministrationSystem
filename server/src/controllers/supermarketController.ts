import { Request, Response } from 'express';
import Supermarket from '../models/Supermarket';

// @desc    Get all supermarkets (with role-based access control)
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

        // RBAC:
        
        // CASE A: Admin o Provider -> Seen all supermarkets
        if (role === 'admin' || role === 'provider') {
        } 
        
        // CASE B: Manager o Worker -> Seen only assigned supermarket
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

// @desc    Create a new supermarket
// @route   POST /api/supermarkets
// @access  Private (Admin Only)
export const createSupermarket = async (req: Request, res: Response): Promise<void> => {
    try {
        // Note: req.user is populated by auth middleware
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

// @desc    Update a supermarket
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

// @desc    Delete (soft delete) a supermarket
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

        // Soft delete: Only change active status to false
        supermarket.active = false;
        await supermarket.save();

        res.json({ message: 'Supermercado eliminado (archivado) correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
};