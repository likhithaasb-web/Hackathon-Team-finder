import Connection from '../models/Connection.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { getIO } from '../sockets/socketManager.js';

export const sendRequest = async (req, res, next) => {
  try {
    const { recipientId, message } = req.body;
    const requesterId = req.user._id;

    if (recipientId.toString() === requesterId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a teammate request to yourself.',
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check existing connection
    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'You are already connected with this user.' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'A teammate request is already pending between you.' });
      }
      // If previous was rejected or withdrawn, allow re-requesting
      existing.status = 'pending';
      existing.requester = requesterId;
      existing.recipient = recipientId;
      existing.message = message || '';
      await existing.save();

      // Create notification
      const notif = await Notification.create({
        recipient: recipientId,
        sender: requesterId,
        type: 'teammate_request',
        title: 'New Teammate Request',
        message: `${req.user.fullName} sent you a teammate connection request.`,
        data: { connectionId: existing._id, requesterId },
      });

      // Socket emit
      try {
        const io = getIO();
        io.to(`user:${recipientId}`).emit('notification', notif);
        io.to(`user:${recipientId}`).emit('connection_updated', { connectionId: existing._id, status: 'pending' });
      } catch {}

      return res.status(200).json({
        success: true,
        message: 'Teammate request sent!',
        connection: existing,
      });
    }

    const newConnection = await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      message: message || '',
      status: 'pending',
    });

    // Create persistent notification
    const notification = await Notification.create({
      recipient: recipientId,
      sender: requesterId,
      type: 'teammate_request',
      title: 'New Teammate Request',
      message: `${req.user.fullName} sent you a teammate connection request.`,
      data: { connectionId: newConnection._id, requesterId },
    });

    // Real-time socket delivery
    try {
      const io = getIO();
      io.to(`user:${recipientId}`).emit('notification', notification);
      io.to(`user:${recipientId}`).emit('connection_updated', { connectionId: newConnection._id, status: 'pending' });
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Teammate request sent successfully.',
      connection: newConnection,
    });
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const incoming = await Connection.find({ recipient: userId, status: 'pending' })
      .populate('requester', 'fullName username avatarUrl roleTitle skills college experienceLevel')
      .sort({ createdAt: -1 });

    const outgoing = await Connection.find({ requester: userId, status: 'pending' })
      .populate('recipient', 'fullName username avatarUrl roleTitle skills college experienceLevel')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      incoming,
      outgoing,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToRequest = async (req, res, next) => {
  try {
    const { id } = req.params; // connection id
    const { action } = req.body; // 'accept' | 'reject'
    const userId = req.user._id;

    const connection = await Connection.findOne({
      _id: id,
      recipient: userId,
      status: 'pending',
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found or already handled.',
      });
    }

    if (action === 'accept') {
      connection.status = 'accepted';
      await connection.save();

      // Ensure conversation exists between the two users
      let conversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [connection.requester, connection.recipient] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type: 'direct',
          participants: [connection.requester, connection.recipient],
        });
      }

      // Notify requester
      const notification = await Notification.create({
        recipient: connection.requester,
        sender: userId,
        type: 'request_accepted',
        title: 'Teammate Request Accepted!',
        message: `${req.user.fullName} accepted your teammate request. You can now chat and team up!`,
        data: { conversationId: conversation._id, userId },
      });

      try {
        const io = getIO();
        io.to(`user:${connection.requester}`).emit('notification', notification);
        io.to(`user:${connection.requester}`).emit('connection_updated', {
          connectionId: connection._id,
          status: 'accepted',
          user: req.user,
        });
      } catch {}

      return res.status(200).json({
        success: true,
        message: 'Teammate request accepted!',
        connection,
        conversationId: conversation._id,
      });
    } else if (action === 'reject') {
      connection.status = 'rejected';
      await connection.save();

      return res.status(200).json({
        success: true,
        message: 'Teammate request declined.',
        connection,
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }
  } catch (error) {
    next(error);
  }
};

export const withdrawRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const connection = await Connection.findOneAndDelete({
      _id: id,
      requester: userId,
      status: 'pending',
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Pending request not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Teammate request withdrawn.',
    });
  } catch (error) {
    next(error);
  }
};

export const getConnections = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted',
    })
      .populate('requester', 'fullName username avatarUrl roleTitle skills college isOnline lastSeen')
      .populate('recipient', 'fullName username avatarUrl roleTitle skills college isOnline lastSeen')
      .sort({ updatedAt: -1 });

    const connectedUsers = connections.map(c => {
      const isRequester = c.requester._id.toString() === userId.toString();
      const otherUser = isRequester ? c.recipient : c.requester;
      return {
        connectionId: c._id,
        connectedSince: c.updatedAt,
        user: otherUser,
      };
    });

    res.status(200).json({
      success: true,
      connections: connectedUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const removeConnection = async (req, res, next) => {
  try {
    const { id } = req.params; // connection id
    const userId = req.user._id;

    const connection = await Connection.findOneAndDelete({
      _id: id,
      $or: [{ requester: userId }, { recipient: userId }],
    });

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Connection removed.',
    });
  } catch (error) {
    next(error);
  }
};
