// Login Modal - Modal wrapper for magic link login
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function LoginModal({ onClose, onLogin }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [devMagicLink, setDevMagicLink] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/magic-link/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setLinkSent(true);

      // In development, show the magic link for easy testing
      if (data.magicLink) {
        setDevMagicLink(data.magicLink);
      }
    } catch (error) {
      setError(error.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="login-form">
          <h2>Welcome Back</h2>
          <p className="form-subtitle">
            {linkSent ? 'Check your email!' : 'Login to your account'}
          </p>

          {error && (
            <div className="error-message general-error">{error}</div>
          )}

          {linkSent ? (
            <div className="magic-link-sent">
              <div className="success-message">
                <h3>Magic link sent! 🪄</h3>
                <p>We've sent a login link to <strong>{email}</strong></p>
                <p>Click the link in your email to login instantly.</p>
                <p className="expiry-note">The link expires in 15 minutes.</p>
              </div>

              {devMagicLink && (
                <div className="dev-magic-link">
                  <p><strong>Development Mode:</strong></p>
                  <p>Click here to test: <a href={devMagicLink} target="_blank" rel="noopener noreferrer">Open Magic Link</a></p>
                </div>
              )}

              <button
                className="btn btn-secondary btn-large"
                onClick={() => {
                  setLinkSent(false);
                  setEmail('');
                  setDevMagicLink('');
                }}
              >
                Send Another Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          )}

          <p className="login-note">
            Don't have an account? Just make a pick to get started!
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
