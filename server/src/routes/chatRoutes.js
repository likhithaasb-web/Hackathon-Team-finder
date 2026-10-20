import express from 'express';
import {
  getConversations,
  getOrCreateDirectConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
import { messageLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations/direct', getOrCreateDirectConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post(
  '/conversations/:conversationId/messages',
  messageLimiter,
  upload.array('attachments', 3),
  sendMessage
);
router.put('/messages/:messageId', editMessage);
router.delete('/messages/:messageId', deleteMessage);
router.post('/messages/:messageId/reactions', reactToMessage);

export default router;
