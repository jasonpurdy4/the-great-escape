// PayPal OAuth Callback Handler
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function PayPalCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Completing PayPal login...');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        // Check for errors from PayPal
        if (error) {
          setStatus('error');
          setMessage(`PayPal login failed: ${error}`);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from PayPal');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Verify state (CSRF protection)
        const savedState = sessionStorage.getItem('paypal_oauth_state');
        if (savedState && state !== savedState) {
          setStatus('error');
          setMessage('Security verification failed. Please try again.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Clear state from storage
        sessionStorage.removeItem('paypal_oauth_state');

        // Exchange code for user info via backend
        setMessage('Verifying your PayPal account...');
        const response = await fetch(`${API_URL}/api/auth/paypal/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            state,
            redirectUri: `${window.location.origin}/auth/paypal/callback`
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to complete PayPal login');
        }

        // Log the user in
        login(data.user, data.token);

        setStatus('success');
        setMessage('Login successful! Redirecting to dashboard...');

        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 1500);

      } catch (error) {
        console.error('PayPal callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to complete PayPal login');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [location, navigate, login, API_URL]);

  return (
    <div className="callback-page">
      <div className="callback-container">
        {status === 'processing' && (
          <div className="callback-spinner">
            <div className="spinner"></div>
          </div>
        )}

        {status === 'success' && (
          <div className="callback-icon success">
            ✓
          </div>
        )}

        {status === 'error' && (
          <div className="callback-icon error">
            ✕
          </div>
        )}

        <h2>{status === 'processing' ? 'Processing...' : status === 'success' ? 'Success!' : 'Error'}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default PayPalCallback;
