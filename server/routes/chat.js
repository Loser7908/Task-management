const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { auth } = require('../middleware/auth');

// Get all chats for current user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'email role')
    .populate('messages.sender', 'email role')
    .sort({ lastMessage: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chats' });
  }
});

// Create new chat
router.post('/', auth, async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] }
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    const chat = new Chat({
      participants: [req.user._id, participantId]
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error creating chat' });
  }
});

// Send message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to send messages in this chat' });
    }

    chat.messages.push({
      sender: req.user._id,
      content
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Get chat messages
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'email role');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Get or create a one-to-one chat between current user and admin
router.get('/user-admin', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    // Find the admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    // If current user is admin, return error (no self-chat)
    if (String(req.user._id) === String(admin._id)) {
      return res.status(400).json({ error: 'Admin cannot chat with self' });
    }
    // Find or create the chat
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, admin._id] },
      $expr: { $eq: [{ $size: "$participants" }, 2] }
    })
    .populate('participants', 'email role')
    .populate('messages.sender', 'email role');

    if (!chat) {
      chat = new Chat({ participants: [req.user._id, admin._id] });
      await chat.save();
      chat = await Chat.findById(chat._id)
        .populate('participants', 'email role')
        .populate('messages.sender', 'email role');
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching/creating user-admin chat' });
  }
});

module.exports = router; 