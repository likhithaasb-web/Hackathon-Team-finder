import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/team/:teamId', getTasks);
router.post('/team/:teamId', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;
