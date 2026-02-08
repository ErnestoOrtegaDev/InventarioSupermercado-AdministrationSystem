import express from 'express';
import { loginUser, logoutUser, registerUser, refreshToken, getProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.get('/profile', protect, getProfile);

export default router;