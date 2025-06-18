import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../redux/slices/authSlice';
import { Navbar, Container, Button, Badge } from 'react-bootstrap';

const Header = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm mb-3" suppressHydrationWarning>
      <Container fluid>
        <Navbar.Brand className="fw-bold">Task Management System</Navbar.Brand>
        <div className="d-flex align-items-center">
          <span className="me-3 text-secondary">
            {user ? (
              <>
                {user.email} <Badge bg={user.role === 'admin' ? 'danger' : 'info'}>{user.role}</Badge>
              </>
            ) : 'Loading...'}
          </span>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
