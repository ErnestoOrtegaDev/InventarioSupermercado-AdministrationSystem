import express from 'express';
import { loginUser, logoutUser, registerUser, refreshToken, getProfile, resetPassword, forgotPassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.get('/profile', protect, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;