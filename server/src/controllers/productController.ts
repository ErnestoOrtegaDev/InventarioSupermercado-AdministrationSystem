import { Request, Response } from 'express';
import { recordKardexMovement } from '../utils/kardexLogger';
import Product from '../models/Product';
import Notification from '../models/Notification';

// @desc    Get all active products for a specific supermarket
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

// @desc    Create a new product and record initial stock in Kardex
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

        await recordKardexMovement(
            product._id,
            product.supermarket,
            0, // EThe previous stock is 0 because it's a new product
            product.stock,
            'Inventario inicial (Alta de producto)'
        );

        res.status(201).json(product);
    } catch (error: any) {
        // Manage duplicate SKU error (code 11000 in MongoDB)
        if (error.code === 11000) {
            res.status(400).json({ message: 'El SKU ya existe en este supermercado' });
            return;
        }
        res.status(500).json({ message: 'Error al crear producto' });
    }
};

// @desc    Update product details and manage stock changes with Kardex and notifications
// @route   PUT /api/products/:id
// @access  Private (Worker/Provider)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Search for the existing product to get the old stock value before updating
        const oldProduct = await Product.findById(id);
        if (!oldProduct) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }

        // Update the product with the new data
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        // Validation: Check if the product was updated successfully
        if (!updatedProduct) {
            res.status(404).json({ message: 'Error al obtener el producto actualizado' });
            return;
        }

        // LOGIC FOR KARDEX MOVEMENT
        // Verify if the stock has changed, if it has, we record the movement in the Kardex
        await recordKardexMovement(
            updatedProduct._id,
            updatedProduct.supermarket,
            oldProduct.stock,       // That it was before the update
            updatedProduct.stock,   // That it is after the update
            'Actualización manual de producto'
        );

        // LOGIC FOR STOCK ALERT
        // If the new stock is less than or equal to the minimum...
        if (updatedProduct.stock <= updatedProduct.minStock) {
            
            // Create a notification for the supermarket about the critical stock level
            await Notification.create({
                type: 'STOCK_ALERT',
                message: `El producto ${updatedProduct.name} tiene stock crítico (${updatedProduct.stock} uds).`,
                supermarket: updatedProduct.supermarket,
                product: updatedProduct._id
            });
            
            // Send the response with an alert message about the critical stock level
            res.json({
                ...updatedProduct.toObject(),
                alert: true, 
                alertMessage: `Stock Crítico: Solo quedan ${updatedProduct.stock} unidades`
            });
            return;
        }

        // If the stock is not critical, we simply return the updated product without an alert
        res.json(updatedProduct);

    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

// @desc    Delete a product (Soft Delete) and record the total exit in Kardex
// @route   DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        // Find the product to get its current stock before marking it as inactive
        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }
        
        // Do a soft delete by marking the product as inactive instead of removing it from the database
        await Product.findByIdAndUpdate(id, { active: false });
        
        // Record the total exit of the product in the Kardex, since it is being removed from active inventory
        await recordKardexMovement(
            product._id,           
            product.supermarket,  
            product.stock,         
            0,                     // The newest useful stock is 0 because it was deactivated
            'Baja del sistema (Producto inactivo)'
        );
        
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
};