import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Form, Button, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { fetchMessagesStart, fetchMessagesSuccess, fetchMessagesFailure, addMessage } from '../redux/slices/chatSlice';
import { api } from '../utils/api';
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || 'your-secret-key';

const ChatBox = () => {
  const dispatch = useDispatch();
  const { messages, currentChat, loading, error } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [messageStatus, setMessageStatus] = useState({});
  const [reconnectDelay, setReconnectDelay] = useState(2000);
  const [messageQueue, setMessageQueue] = useState([]);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);

  const decryptMessage = (encryptedContent) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedContent, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return 'Error decrypting message';
    }
  };

  useEffect(() => {
    if (currentChat) {
      fetchMessages();
    }
  }, [currentChat]);

  useEffect(() => {
    let socket;
    let isUnmounted = false;
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    function connectWebSocket() {
      setConnectionError(null);
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
      socket = new window.WebSocket(`${wsUrl}?token=${token}`);
      wsRef.current = socket;

      socket.onopen = () => {
        if (isUnmounted) return;
        setIsConnected(true);
        setConnectionError(null);
        setReconnectDelay(2000); // reset delay on successful connect
        // Send queued messages
        if (messageQueue.length > 0) {
          messageQueue.forEach(msg => socket.send(JSON.stringify(msg)));
          setMessageQueue([]);
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const decryptedMessage = {
            ...message,
            content: decryptMessage(message.content)
          };
          dispatch(addMessage(decryptedMessage));
          scrollToBottom();
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      socket.onclose = () => {
        if (isUnmounted) return;
        setIsConnected(false);
        setConnectionError('Disconnected. Reconnecting...');
        // Exponential backoff for reconnect
        reconnectTimeout.current = setTimeout(() => {
          setReconnectDelay(prev => Math.min(prev * 2, 30000));
          connectWebSocket();
        }, reconnectDelay);
      };

      socket.onerror = (error) => {
        setConnectionError('WebSocket error.');
        setIsConnected(false);
      };
    }

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
    // eslint-disable-next-line
  }, [user, reconnectDelay]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!currentChat) return;
    dispatch(fetchMessagesStart());
    try {
      const data = await api.get(`/chat/${currentChat._id}/messages`);
      const decryptedMessages = data.map(msg => ({
        ...msg,
        content: decryptMessage(msg.content)
      }));
      dispatch(fetchMessagesSuccess(decryptedMessages));
    } catch (error) {
      dispatch(fetchMessagesFailure(error.message));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || !user) return;
    const message = {
      chatId: currentChat._id,
      content: newMessage,
      sender: user._id,
    };
    setMessageStatus(prev => ({ ...prev, [Date.now()]: 'sending' }));
    if (isConnected && wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setMessageQueue(prev => [...prev, message]);
    }
    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getChatPartner = () => {
    if (!currentChat || !currentChat.participants) return null;
    return currentChat.participants.find(p => p._id !== user._id);
  };

  const chatPartner = getChatPartner();

  if (!currentChat || !user) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 text-secondary">
        {!user ? "Please log in to access chat" : "Select a chat to start messaging"}
      </div>
    );
  }

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
        <div>
          <h5 className="mb-0 d-flex align-items-center">
            {chatPartner?.email}
            <Badge bg={chatPartner?.role === 'admin' ? 'primary' : 'secondary'} className="ms-2">
              {chatPartner?.role}
            </Badge>
          </h5>
        </div>
        <div className="d-flex align-items-center">
          <span 
            className={`d-inline-block rounded-circle me-2 ${isConnected ? 'bg-success' : 'bg-danger'}`} 
            style={{ width: '8px', height: '8px' }}
          ></span>
          <small className="text-secondary">
            {isConnected ? 'Connected' : connectionError || 'Disconnected'}
          </small>
        </div>
      </Card.Header>

      {error && (
        <Alert variant="danger" className="m-0 border-0 rounded-0">
          {error}
        </Alert>
      )}
      {connectionError && !isConnected && (
        <Alert variant="warning" className="m-0 border-0 rounded-0">
          {connectionError}
        </Alert>
      )}

      <Card.Body className="p-3 overflow-auto" style={{ height: 'calc(100vh - 250px)' }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <ListGroup variant="flush" className="chat-messages">
            {messages.map((message) => (
              <ListGroup.Item
                key={message._id}
                className={`chat-message ${message.sender === user._id ? 'sent' : 'received'} border-0`}
              >
                <div className="d-flex flex-column">
                  <p className="mb-1">{message.content}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-end" style={{ opacity: 0.7 }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
            <div ref={messagesEndRef} />
          </ListGroup>
        )}
      </Card.Body>

      <Card.Footer className="bg-white border-top p-3">
        <Form onSubmit={handleSendMessage}>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="border-0 bg-light"
            />
            <Button
              type="submit"
              variant={isConnected ? 'primary' : 'secondary'}
              disabled={!isConnected || !newMessage.trim()}
              className="px-4"
            >
              Send
            </Button>
          </div>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default ChatBox;
