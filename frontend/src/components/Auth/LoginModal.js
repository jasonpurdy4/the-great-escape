// Login Modal - Modal wrapper for login
import React, { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
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
  const [showPayPalLogin, setShowPayPalLogin] = useState(false);

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

  // PayPal Login Flow
  const createPayPalLoginOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/paypal-login/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create login order');
      }

      return data.orderId;
    } catch (error) {
      console.error('Error creating PayPal login order:', error);
      setError('Failed to initialize PayPal login. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onPayPalApprove = async (data) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/paypal-login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to verify PayPal login');
      }

      // Log the user in with the returned token
      login(result.user, result.token);
      onClose();
    } catch (error) {
      console.error('Error verifying PayPal login:', error);
      setError(error.message || 'PayPal login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onPayPalError = (err) => {
    console.error('PayPal error:', err);
    setError('PayPal authentication failed. Please try again.');
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
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="login-note">
            Don't have login credentials? Just make a pick to create your account!
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
