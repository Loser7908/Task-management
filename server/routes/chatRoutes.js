// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const {
  getChats,
  createChat,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');

const auth = require('../middleware/authMiddleware');

// Use only auth middleware
router.use(auth);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', sendMessage);

module.exports = router;
