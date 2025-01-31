import Message from '../models/Message.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/attachments',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).array('attachments', 5); // Max 5 files

// Helper function to check if messaging is allowed
const canSendMessage = async (senderId, recipientId) => {
  const [sender, recipient] = await Promise.all([
    User.findByPk(senderId),
    User.findByPk(recipientId)
  ]);

  // Admin can message anyone
  if (sender.role === 'admin') return true;

  // Regular users can only message admins
  if (sender.role === 'user') {
    return recipient.role === 'admin';
  }

  return false;
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'File upload error: ' + err.message });
      }

      const { recipient_id, content } = req.body;
      const sender_id = req.user.id;

      if (!recipient_id || !content) {
        return res.status(400).json({ error: 'Recipient and message content are required' });
      }

      // Check if recipient exists
      const recipient = await User.findByPk(recipient_id);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // Check if sender has permission to message this recipient
      const isAllowed = await canSendMessage(sender_id, recipient_id);
      if (!isAllowed) {
        return res.status(403).json({ error: 'You can only send messages to administrators' });
      }

      // Process attachments if any
      const attachments = req.files ? req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      })) : [];

      const message = await Message.create({
        sender_id,
        recipient_id,
        content,
        attachments
      });

      // Load sender and recipient info
      const messageWithUsers = await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'username', 'avatar'] },
          { model: User, as: 'recipient', attributes: ['id', 'username', 'avatar'] }
        ]
      });

      // Emit socket event if recipient is online
      if (req.io) {
        const recipientSocket = req.io.sockets.sockets.get(recipient.socket_id);
        if (recipientSocket) {
          recipientSocket.emit('new_message', messageWithUsers);
        }
      }

      res.status(201).json(messageWithUsers);
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    const message = await Message.findOne({
      where: {
        id: message_id,
        sender_id: user_id,
        deleted_at: null
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    await message.update({
      content,
      edited_at: new Date()
    });

    // Load sender and recipient info
    const updatedMessage = await Message.findByPk(message_id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'recipient', attributes: ['id', 'username', 'avatar'] }
      ]
    });

    // Emit socket event if recipient is online
    if (req.io) {
      const recipient = await User.findByPk(message.recipient_id);
      if (recipient && recipient.socket_id) {
        const recipientSocket = req.io.sockets.sockets.get(recipient.socket_id);
        if (recipientSocket) {
          recipientSocket.emit('message_edited', updatedMessage);
        }
      }
    }

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const user_id = req.user.id;

    const message = await Message.findOne({
      where: {
        id: message_id,
        sender_id: user_id
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    await message.update({ deleted_at: new Date() });

    // Emit socket event if recipient is online
    if (req.io) {
      const recipient = await User.findByPk(message.recipient_id);
      if (recipient && recipient.socket_id) {
        const recipientSocket = req.io.sockets.sockets.get(recipient.socket_id);
        if (recipientSocket) {
          recipientSocket.emit('message_deleted', { message_id });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Add or update reaction
export const reactToMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const { reaction } = req.body;
    const user_id = req.user.id;

    const message = await Message.findByPk(message_id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Get current reactions and update
    let reactions = message.reactions || [];
    const existingReactionIndex = reactions.findIndex(r => r.user_id === user_id);
    
    if (existingReactionIndex !== -1) {
      if (reaction) {
        reactions[existingReactionIndex].reaction = reaction;
      } else {
        reactions.splice(existingReactionIndex, 1);
      }
    } else if (reaction) {
      reactions.push({
        user_id,
        reaction,
        created_at: new Date()
      });
    }

    await message.update({ reactions });

    // Load sender and recipient info
    const updatedMessage = await Message.findByPk(message_id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'recipient', attributes: ['id', 'username', 'avatar'] }
      ]
    });

    // Emit socket event if recipient is online
    if (req.io) {
      const recipient = await User.findByPk(message.recipient_id);
      if (recipient && recipient.socket_id) {
        const recipientSocket = req.io.sockets.sockets.get(recipient.socket_id);
        if (recipientSocket) {
          recipientSocket.emit('message_reaction', {
            message_id,
            reactions
          });
        }
      }
    }

    res.json({ success: true, reactions });
  } catch (error) {
    console.error('Error updating reaction:', error);
    res.status(500).json({ error: 'Failed to update reaction' });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { user_id } = req.params;
    const current_user_id = req.user.id;

    // Check if the conversation is allowed
    const isAllowed = await canSendMessage(current_user_id, user_id) || 
                     await canSendMessage(user_id, current_user_id);
    
    if (!isAllowed) {
      return res.status(403).json({ error: 'You can only view conversations with administrators' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: current_user_id, recipient_id: user_id },
          { sender_id: user_id, recipient_id: current_user_id }
        ],
        deleted_at: null
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'recipient', attributes: ['id', 'username', 'avatar'] }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const current_user_id = req.user.id;

    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: current_user_id },
          { recipient_id: current_user_id }
        ],
        deleted_at: null
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'initials']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'email', 'initials']
        }
      ],
      order: [['created_at', 'DESC']],
      group: [
        sequelize.literal(`CASE 
          WHEN sender_id = ${current_user_id} THEN recipient_id 
          ELSE sender_id 
        END`)
      ]
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { message_id } = req.params;
    const user_id = req.user.id;

    const message = await Message.findByPk(message_id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only recipient can mark message as read
    if (message.recipient_id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await message.update({ read_at: new Date() });

    // Notify sender if online
    if (req.io) {
      const sender = await User.findByPk(message.sender_id);
      if (sender && sender.socket_id) {
        const senderSocket = req.io.sockets.sockets.get(sender.socket_id);
        if (senderSocket) {
          senderSocket.emit('message_read', { message_id });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
}; 