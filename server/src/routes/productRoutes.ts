import express from 'express';
import { 
    createProduct, 
    getProductsBySupermarket, 
    updateProduct, 
    deleteProduct 
} from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';
import { create } from 'node:domain';

const router = express.Router();
console.log('Router de Productos inicializado'); 

router.get('/test', (req, res) => {
    console.log('Ping recibido en Productos');
    res.json({ 
        status: 'success', 
        message: 'El Router de PRODUCTOS está conectado y escuchando 📦',
        timestamp: new Date()
    });
});

router.use(protect);
router.get('/supermarket/:supermarketId', getProductsBySupermarket);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;