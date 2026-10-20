import express from 'express';
import {
  sendRequest,
  getRequests,
  respondToRequest,
  withdrawRequest,
  getConnections,
  removeConnection,
} from '../controllers/connectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/request', sendRequest);
router.get('/requests', getRequests);
router.put('/requests/:id', respondToRequest);
router.delete('/requests/:id', withdrawRequest);
router.get('/', getConnections);
router.delete('/:id', removeConnection);

export default router;
