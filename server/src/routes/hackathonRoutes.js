import express from 'express';
import {
  getHackathons,
  getFeaturedHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
} from '../controllers/hackathonController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalProtect, getHackathons);
router.get('/featured', getFeaturedHackathons);
router.get('/:id', optionalProtect, getHackathonById);
router.post('/', protect, createHackathon);
router.put('/:id', protect, updateHackathon);
router.delete('/:id', protect, deleteHackathon);

export default router;
