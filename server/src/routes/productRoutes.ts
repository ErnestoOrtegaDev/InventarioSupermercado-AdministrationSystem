import express from 'express';
import { 
    createProduct, 
    getProductsBySupermarket, 
    updateProduct, 
    deleteProduct 
} from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.get('/supermarket/:supermarketId', getProductsBySupermarket);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;