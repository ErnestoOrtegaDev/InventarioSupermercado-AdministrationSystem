import { Request, Response } from 'express';
import Product from '../models/Product';

// @desc    Obtener productos de UN supermercado específico
// @route   GET /api/products/supermarket/:supermarketId
export const getProductsBySupermarket = async (req: Request, res: Response) => {
    try {
        const { supermarketId } = req.params;
        const products = await Product.find({ 
            supermarket: supermarketId, 
            active: true 
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

// @desc    Crear Producto
// @route   POST /api/products
// @access  Private (Admin/Worker)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, sku, price, stock, minStock, supermarket, category } = req.body;

        const product = await Product.create({
            name,
            sku,
            price,
            stock,
            minStock,
            supermarket,
            category
        });

        res.status(201).json(product);
    } catch (error: any) {
        // Manejo de error por SKU duplicado
        if (error.code === 11000) {
            res.status(400).json({ message: 'El SKU ya existe en este supermercado' });
            return;
        }
        res.status(500).json({ message: 'Error al crear producto' });
    }
};

// @desc    Actualizar Producto (y verificar Alerta de Stock)
// @route   PUT /api/products/:id
// @access  Private (Worker/Provider)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { stock, price, name } = req.body;

        // Buscamos el producto actual
        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }

        // Actualizamos
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        // LOGICA DE ALERTA
        // Si el stock nuevo es menor o igual al mínimo...
        if (updatedProduct && updatedProduct.stock <= updatedProduct.minStock) {
            // Enviamos un flag en la respuesta para que el Front sepa.
            console.log(`⚠️ ALERTA DE STOCK: El producto ${updatedProduct.name} se está agotando.`);
            
            res.json({
                ...updatedProduct.toObject(),
                alert: true, // Flag para el frontend
                alertMessage: `Stock Crítico: Solo quedan ${updatedProduct.stock} unidades`
            });
            return;
        }

        res.json(updatedProduct);

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

// @desc    Eliminar Producto (Soft Delete)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await Product.findByIdAndUpdate(id, { active: false });
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
};