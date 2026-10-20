import { Server } from 'socket.io';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

let ioInstance = null;
const onlineUsers = new Map(); // userId -> Set of socket IDs

export const initSocket = (httpServer) => {
  const isOriginAllowed = (origin, callback) => {
    if (!origin) return callback(null, true);
    const clientUrlEnv = process.env.CLIENT_URL || '';
    const allowedList = clientUrlEnv.split(',').map((u) => u.trim()).filter(Boolean);

    if (
      allowedList.includes(origin) ||
      allowedList.includes('*') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  };

  ioInstance = new Server(httpServer, {
    cors: {
      origin: isOriginAllowed,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Socket authentication middleware
  ioInstance.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('fullName username avatarUrl role status');

      if (!user || user.status === 'suspended') {
        return next(new Error('User unauthorized'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token authentication'));
    }
  });

  ioInstance.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // Set user online in DB
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
      ioInstance.emit('user_presence_changed', { userId, isOnline: true });
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room for notifications & direct updates
    socket.join(`user:${userId}`);

    // Join conversation room with server-side authorization check
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (conversation) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (err) {
        console.error('join_conversation error:', err.message);
      }
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Real-time message sending over Socket
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, clientMessageId, replyTo } = data;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          return socket.emit('error', { message: 'Unauthorized conversation access' });
        }

        // Persist message first in MongoDB
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          content: content || '',
          replyTo: replyTo || undefined,
          readBy: [userId],
          clientMessageId,
        });

        // Update conversation lastMessage
        conversation.lastMessage = {
          text: content || '',
          sender: userId,
          createdAt: new Date(),
        };
        await conversation.save();

        const populated = await Message.findById(message._id)
          .populate('sender', 'fullName username avatarUrl')
          .populate('replyTo', 'content sender');

        // Broadcast to conversation room
        ioInstance.to(`conversation:${conversationId}`).emit('new_message', populated);

        // Notify other participants for unread counts
        conversation.participants.forEach((pId) => {
          if (pId.toString() !== userId) {
            ioInstance.to(`user:${pId}`).emit('conversation_updated', {
              conversationId,
              lastMessage: conversation.lastMessage,
            });
          }
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        fullName: socket.user.fullName,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
        socket.to(`conversation:${conversationId}`).emit('messages_read', {
          conversationId,
          userId,
        });
      } catch (err) {
        console.error('mark_read error:', err.message);
      }
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          const lastSeen = new Date();
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
          ioInstance.emit('user_presence_changed', { userId, isOnline: false, lastSeen });
        }
      }
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized');
  }
  return ioInstance;
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString()) && onlineUsers.get(userId.toString()).size > 0;
};
