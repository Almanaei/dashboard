import express from 'express';
import { sendMessage, getConversation, markAsRead, editMessage, deleteMessage, reactToMessage, getConversations } from '../controllers/MessageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all conversations
router.get('/list', getConversations);

// Send a new message
router.post('/', sendMessage);

// Get conversation with another user
router.get('/conversation/:user_id', getConversation);

// Mark message as read
router.put('/:message_id/read', markAsRead);

// Edit message
router.put('/:message_id', editMessage);

// Delete message
router.delete('/:message_id', deleteMessage);

// Add reaction to message
router.post('/:message_id/reactions', reactToMessage);

export default router; 