import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  socialLogin,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRequest, registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/social-login', authLimiter, socialLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateRequest(updateProfileSchema), updateProfile);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;
