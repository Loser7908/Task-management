'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';

export default function AuthCheck() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      try {
        // Check if user is already logged in (token exists in localStorage)
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        
        if (token && userString) {
          try {
            const user = JSON.parse(userString);
            // Restore auth state from localStorage
            dispatch(loginSuccess({
              user,
              token
            }));
          } catch (error) {
            console.error('Failed to parse user data from localStorage', error);
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
  }, [dispatch]);

  // This component doesn't render anything
  return <div suppressHydrationWarning />;
}