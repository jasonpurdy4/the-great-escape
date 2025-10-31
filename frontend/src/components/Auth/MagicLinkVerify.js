// Magic Link Verification Page
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function MagicLinkVerify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setError('No token provided');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/magic-link/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify magic link');
        }

        // Successfully verified - log the user in
        if (data.token && data.user) {
          // Store the JWT token
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Update auth context
          login(data.user, data.token);

          setStatus('success');

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          throw new Error('Invalid response from server');
        }

      } catch (error) {
        console.error('Magic link verification error:', error);
        setStatus('error');
        setError(error.message || 'Failed to verify magic link');
      }
    };

    verifyToken();
  }, [token, API_URL, login, navigate]);

  return (
    <div className="callback-page">
      <div className="callback-container">
        {status === 'verifying' && (
          <>
            <div className="callback-spinner">
              <div className="spinner"></div>
            </div>
            <h2>Verifying Magic Link</h2>
            <p>Please wait while we log you in...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="callback-icon success">✓</div>
            <h2>Login Successful!</h2>
            <p>Redirecting you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="callback-icon error">✗</div>
            <h2>Verification Failed</h2>
            <p>{error}</p>
            <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--medium-grey)' }}>
              This link may have expired or been used already.
            </p>
            <button
              className="btn btn-primary btn-large"
              style={{ marginTop: '24px' }}
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MagicLinkVerify;
