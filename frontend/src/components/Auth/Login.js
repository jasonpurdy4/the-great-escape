// Login Component
import React, { useState } from 'react';
import { login as loginApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function Login({ onSuccess, onSwitchToRegister }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    try {
      const response = await loginApi({
        email: formData.email,
        password: formData.password
      });

      // Auto-login
      login(response.data.user, response.data.token);

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Login error:', error);

      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
          />
        </div>

        <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {onSwitchToRegister && (
          <p className="switch-auth">
            Don't have an account? <button type="button" onClick={onSwitchToRegister}>Sign Up</button>
          </p>
        )}
      </form>
    </div>
  );
}

export default Login;
