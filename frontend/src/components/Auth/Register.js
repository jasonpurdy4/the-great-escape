// Register Component - User registration form
import React, { useState } from 'react';
import { register } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

function Register({ onSuccess, onSwitchToLogin, includePayment = false }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    state: '',
    city: '',
    addressLine1: '',
    zipCode: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';

    // DOB validation (must be 18+)
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    // State validation
    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    // Basic address fields
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.addressLine1) newErrors.addressLine1 = 'Address is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        state: formData.state.toUpperCase(),
        city: formData.city,
        addressLine1: formData.addressLine1,
        zipCode: formData.zipCode
      });

      // Auto-login after successful registration
      login(response.data.user, response.data.token);

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Registration error:', error);

      if (error.response?.data?.error) {
        if (error.response.data.error.includes('Email already registered')) {
          setErrors({ email: 'This email is already registered' });
        } else if (error.response.data.error.includes('not available in')) {
          setErrors({ state: error.response.data.error });
        } else {
          setErrors({ general: error.response.data.error });
        }
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <h2>Create Your Account</h2>
      {includePayment && (
        <p className="form-subtitle">Sign up to lock in your pick!</p>
      )}

      {errors.general && (
        <div className="error-message general-error">{errors.general}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name Fields */}
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password * (min 8 characters)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label>Date of Birth * (18+ required)</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            className={errors.dateOfBirth ? 'error' : ''}
          />
          {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
        </div>

        {/* Address Fields */}
        <div className="form-group">
          <label>Street Address *</label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className={errors.addressLine1 ? 'error' : ''}
          />
          {errors.addressLine1 && <span className="error-text">{errors.addressLine1}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="error-text">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              maxLength="2"
              placeholder="NY"
              className={errors.state ? 'error' : ''}
            />
            {errors.state && <span className="error-text">{errors.state}</span>}
          </div>

          <div className="form-group">
            <label>ZIP Code *</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              maxLength="10"
              className={errors.zipCode ? 'error' : ''}
            />
            {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {onSwitchToLogin && (
          <p className="switch-auth">
            Already have an account? <button type="button" onClick={onSwitchToLogin}>Login</button>
          </p>
        )}
      </form>
    </div>
  );
}

export default Register;
