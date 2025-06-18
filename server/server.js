// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Chat = require('./models/Chat');
const User = require('./models/User');
const { encrypt, decrypt } = require('./utils/crypto');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/chat', require('./routes/chat'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', async (ws, req) => {
  try {
    // Extract token from URL query parameters
    const url = new URL(req.url, 'ws://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      ws.close(1008, 'User not found');
      return;
    }

    // Store user info in WebSocket connection
    ws.userId = user._id;
    ws.userRole = user.role;

    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const { chatId, content, sender } = JSON.parse(message);

        // Verify the chat exists and user is a participant
        const chat = await Chat.findById(chatId)
          .populate('participants', 'email role');

        if (!chat) {
          ws.send(JSON.stringify({ error: 'Chat not found' }));
          return;
        }

        if (!chat.participants.some(p => p._id.toString() === user._id.toString())) {
          ws.send(JSON.stringify({ error: 'Not authorized to send messages in this chat' }));
          return;
        }

        // Encrypt message content
        const encryptedContent = encrypt(content);

        // Add message to chat
        const newMessage = {
          sender: user._id,
          content: encryptedContent,
          timestamp: new Date()
        };

        chat.messages.push(newMessage);
        await chat.save();

        // Broadcast message to all participants in the chat
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN &&
              chat.participants.some(p => p._id.toString() === client.userId)) {
            client.send(JSON.stringify({
              ...newMessage,
              content: encryptedContent, // Send encrypted content
              chatId: chat._id
            }));
          }
        });
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({ error: 'Error processing message' }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log('Client disconnected');
    });

  } catch (error) {
    console.error('WebSocket connection error:', error);
    ws.close(1011, 'Internal server error');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
