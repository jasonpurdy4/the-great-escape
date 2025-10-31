// Login Modal - Modal wrapper for login
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function LoginModal({ onClose, onLogin }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onLogin(formData.email, formData.password);
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // PayPal OAuth Login Flow
  const handlePayPalLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // Request OAuth authorization URL from backend
      const response = await fetch(`${API_URL}/api/auth/paypal/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirectUri: `${window.location.origin}/auth/paypal/callback`
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize PayPal login');
      }

      // Store state for verification
      sessionStorage.setItem('paypal_oauth_state', data.state);

      // Redirect to PayPal OAuth authorization
      window.location.href = data.authUrl;

    } catch (error) {
      console.error('Error initiating PayPal login:', error);
      setError('Failed to start PayPal login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="login-form">
          <h2>Welcome Back</h2>
          <p className="form-subtitle">Login to your account</p>

          {error && (
            <div className="error-message general-error">{error}</div>
          )}

          {/* PayPal Login Button */}
          <button
            type="button"
            onClick={handlePayPalLogin}
            className="btn btn-paypal btn-large"
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
            </svg>
            {loading ? 'Connecting...' : 'Login with PayPal'}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          {/* Email/Password Login */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Logging in...' : 'Login with Email'}
            </button>
          </form>

          <p className="login-note">
            Don't have an account? Just make a pick to get started!
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
