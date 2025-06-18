'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasksStart } from '../../redux/slices/taskSlice';
import { fetchChatsStart, setCurrentChat, fetchChatsSuccess } from '../../redux/slices/chatSlice';
import TaskBoard from '../../components/TaskBoard';
import ChatBox from '../../components/ChatBox';
import Header from '../../components/Header';
import { Container, Row, Col, Toast, ToastContainer } from 'react-bootstrap';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentChat, chats } = useSelector((state) => state.chat);
  const [showChat, setShowChat] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    // Fetch initial data
    dispatch(fetchTasksStart());
    dispatch(fetchChatsStart());

    // Fetch user-admin chat on load
    const fetchUserAdminChat = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chat/user-admin', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const chat = await response.json();
          dispatch(setCurrentChat(chat));
        } else {
          console.error('Failed to fetch user-admin chat');
        }
      } catch (error) {
        console.error('Error fetching user-admin chat:', error);
      }
    };
    fetchUserAdminChat();

    // Fetch all chats for admin
    const fetchAllChats = async () => {
      if (user?.role === 'admin') {
        try {
          const response = await fetch('http://localhost:5000/api/chat', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const chats = await response.json();
            dispatch(fetchChatsSuccess(chats));
            if (chats.length > 0) dispatch(setCurrentChat(chats[0]));
          }
        } catch (error) {
          console.error('Error fetching all chats:', error);
        }
      }
    };
    fetchAllChats();
  }, [user, dispatch]);

  const handleTaskUpdate = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  if (!user) {
    return null; // or loading spinner
  }

  return (
    <div className="dashboard-page" style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Header user={user} />
      
      <Container fluid className="py-4">
        <Row>
          <Col xs={12} md={12} lg={12}>
            <TaskBoard onTaskUpdate={handleTaskUpdate} />
          </Col>
        </Row>
      </Container>
      {/* Floating Chat Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 1050,
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
      {/* Chat Panel */}
      {showChat && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 1060,
            width: user?.role === 'admin' ? '600px' : '370px',
            maxWidth: '95vw',
            height: '520px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
          }}
        >
          {/* Admin chat list sidebar */}
          {user?.role === 'admin' && (
            <div style={{ width: '220px', borderRight: '1px solid #eee', background: '#f7f7f7', overflowY: 'auto' }}>
              <div style={{ padding: '12px', fontWeight: 600, borderBottom: '1px solid #eee' }}>Chats</div>
              {chats && chats.length > 0 ? (
                chats.map(chat => {
                  const partner = chat.participants.find(p => p._id !== user._id);
                  return (
                    <div
                      key={chat._id}
                      onClick={() => dispatch(setCurrentChat(chat))}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        background: currentChat && currentChat._id === chat._id ? '#e9ecef' : 'transparent',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{partner?.email || 'User'}</span>
                      <span style={{ fontSize: '12px', color: '#888' }}>{partner?.role}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '16px', color: '#888' }}>No chats</div>
              )}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px', background: '#f7f7f7', borderBottom: '1px solid #eee' }}>
              <button
                onClick={() => setShowChat(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#888',
                  cursor: 'pointer',
                }}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ChatBox />
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3500} autohide bg="success">
          <Toast.Header>
            <strong className="me-auto">Task Updated</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Update successful! Notification email sent to admin.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
