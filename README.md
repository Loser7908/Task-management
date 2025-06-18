# Task Management System

A simplified task management system (like Trello Lite) with real-time chat functionality and secure communication.

## Features

- User Authentication (Admin and User roles)
- Task Management with Drag & Drop
- Real-time Chat between Users and Admins
- Email Notifications for Task Updates
- Encrypted Request/Response Communication
- Responsive Design

## Tech Stack

### Frontend
- Next.js
- Redux Toolkit
- React Bootstrap
- WebSocket for real-time chat
- CryptoJS for encryption

### Backend
- Node.js with Express
- MongoDB
- JWT Authentication
- WebSocket
- Nodemailer
- CryptoJS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Gmail account (for email notifications)

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd task-management-system
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables

Create `.env` file in the server directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/task_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
ENCRYPTION_KEY=your-32-character-encryption-key
NODE_ENV=development
```

Create `.env` file in the frontend directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

4. Start the development servers

```bash
# Start backend server
cd server
npm run dev

# Start frontend server
cd ../frontend
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/signup - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Tasks
- GET /api/tasks - List all tasks
- POST /api/tasks - Create new task (Admin only)
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task (Admin only)

### Chat
- GET /api/chat - List all chats
- POST /api/chat - Create new chat
- POST /api/chat/:chatId/messages - Send message
- GET /api/chat/:chatId/messages - Get chat messages

## Security Features

- JWT Authentication
- Request/Response Encryption using CryptoJS
- Role-based Access Control
- Secure WebSocket Communication

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 