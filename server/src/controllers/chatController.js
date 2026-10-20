import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import { getIO } from '../sockets/socketManager.js';

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'fullName username avatarUrl roleTitle isOnline lastSeen')
      .populate('team', 'name logoUrl desiredSize')
      .sort({ updatedAt: -1 })
      .lean();

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          readBy: { $ne: userId },
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      conversations: conversationsWithUnread,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrCreateDirectConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user._id;

    if (recipientId === userId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot create conversation with yourself.' });
    }

    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [userId, recipientId], $size: 2 },
    })
      .populate('participants', 'fullName username avatarUrl roleTitle isOnline lastSeen');

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [userId, recipientId],
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'fullName username avatarUrl roleTitle isOnline lastSeen');
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Verify membership
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ success: false, message: 'You are not a participant in this conversation.' });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Message.countDocuments({ conversation: conversationId });
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullName username avatarUrl')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Mark unread messages as read by current user
    await Message.updateMany(
      {
        conversation: conversationId,
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, clientMessageId, replyTo } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Access denied to this conversation.' });
    }

    // Check attachments if files uploaded
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        attachments.push({
          url: `/uploads/${file.filename}`,
          fileType: file.mimetype.startsWith('image/') ? 'image' : 'file',
          originalName: file.originalname,
          size: file.size,
        });
      }
    }

    if (!content && attachments.length === 0) {
      return res.status(400).json({ success: false, message: 'Message content or attachment required.' });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content: content || '',
      attachments,
      replyTo: replyTo || undefined,
      readBy: [userId],
      clientMessageId: clientMessageId || undefined,
    });

    // Update conversation lastMessage
    conversation.lastMessage = {
      text: content || (attachments.length ? 'Sent an attachment' : ''),
      sender: userId,
      createdAt: new Date(),
    };
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName username avatarUrl')
      .populate('replyTo', 'content sender');

    // Emit real-time socket event to conversation room
    try {
      const io = getIO();
      io.to(`conversation:${conversationId}`).emit('new_message', populated);

      // Notify other participants
      const otherParticipants = conversation.participants.filter(
        p => p.toString() !== userId.toString()
      );

      for (const recipientId of otherParticipants) {
        io.to(`user:${recipientId}`).emit('conversation_updated', {
          conversationId,
          lastMessage: conversation.lastMessage,
        });
      }
    } catch {}

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own messages.' });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName username avatarUrl');

    try {
      const io = getIO();
      io.to(`conversation:${message.conversation}`).emit('message_edited', populated);
    } catch {}

    res.status(200).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });

    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message.' });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted.';
    message.attachments = [];
    await message.save();

    try {
      const io = getIO();
      io.to(`conversation:${message.conversation}`).emit('message_deleted', {
        messageId: message._id,
      });
    } catch {}

    res.status(200).json({
      success: true,
      message: 'Message deleted.',
    });
  } catch (error) {
    next(error);
  }
};

export const reactToMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });

    const existingIndex = message.reactions.findIndex(
      r => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      // Toggle off
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    try {
      const io = getIO();
      io.to(`conversation:${message.conversation}`).emit('message_reaction', {
        messageId: message._id,
        reactions: message.reactions,
      });
    } catch {}

    res.status(200).json({
      success: true,
      reactions: message.reactions,
    });
  } catch (error) {
    next(error);
  }
};
