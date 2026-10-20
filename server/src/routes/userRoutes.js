import express from 'express';
import {
  getUsers,
  getUserById,
  getUserByUsername,
  getUserRecommendations,
  deleteAccount,
} from '../controllers/userController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalProtect, getUsers);
router.get('/recommendations', protect, getUserRecommendations);
router.get('/username/:username', getUserByUsername);
router.get('/:id', optionalProtect, getUserById);
router.delete('/me', protect, deleteAccount);

export default router;
