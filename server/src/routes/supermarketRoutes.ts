import express from 'express';
import { 
    createSupermarket, 
    getSupermarkets, 
    updateSupermarket, 
    deleteSupermarket 
} from '../controllers/supermarketController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();


router.get('/', protect, getSupermarkets);
router.post('/', protect,  adminOnly, createSupermarket);
router.put('/:id', protect,  adminOnly, updateSupermarket);
router.delete('/:id', protect, adminOnly, deleteSupermarket);

export default router;