// SignupPayment Modal - Combined registration + PayPal payment flow
import React, { useState, useEffect, useRef } from 'react';
import { register } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Payment.css';

function SignupPayment({
  selectedTeam,
  match,
  matchday,
  onClose,
  onComplete
}) {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1 = Register, 2 = Payment
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
  const [registeredUser, setRegisteredUser] = useState(null);
  const paypalButtonsRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleRegister = async (e) => {
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

      // Store user data but don't auto-login yet (wait for payment)
      setRegisteredUser(response.data);

      // Move to payment step
      setStep(2);
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

  // Load PayPal SDK when step 2 is reached
  useEffect(() => {
    if (step === 2 && !window.paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;
      script.addEventListener('load', () => {
        renderPayPalButtons();
      });
      document.body.appendChild(script);
    } else if (step === 2 && window.paypal) {
      renderPayPalButtons();
    }
  }, [step]);

  const renderPayPalButtons = () => {
    if (!paypalButtonsRef.current || !window.paypal) return;

    // Clear existing buttons
    paypalButtonsRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 55
      },
      createOrder: async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/create-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${registeredUser.token}`
            },
            body: JSON.stringify({
              amount: 10.00,
              description: `The Great Escape - Matchday ${matchday} Entry`
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to create order');
          }

          return data.orderId;
        } catch (error) {
          console.error('Create order error:', error);
          setErrors({ general: 'Failed to create PayPal order. Please try again.' });
          throw error;
        }
      },
      onApprove: async (data) => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/capture-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${registeredUser.token}`
            },
            body: JSON.stringify({
              orderId: data.orderID,
              poolId: matchday, // Pool ID corresponds to matchday number
              teamId: selectedTeam.id,
              matchId: match.id
            })
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Payment failed');
          }

          // Now login the user with their token
          login(registeredUser.user, registeredUser.token);

          // Call completion callback with pick details
          if (onComplete) {
            onComplete({
              team: selectedTeam,
              match: match,
              matchday: matchday,
              entry: result.entry
            });
          }
        } catch (error) {
          console.error('Capture order error:', error);
          setErrors({ general: error.message || 'Payment failed. Please try again.' });
        }
      },
      onError: (err) => {
        console.error('PayPal error:', err);
        setErrors({ general: 'PayPal error occurred. Please try again.' });
      }
    }).render(paypalButtonsRef.current);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const ukTime = date.toLocaleString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });
    const estTime = date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    });
    return { uk: ukTime, est: estTime };
  };

  const opponent = match.homeTeam.id === selectedTeam.id
    ? match.awayTeam.name
    : match.homeTeam.name;

  const times = formatDate(match.utcDate);

  return (
    <div className="confirmation-overlay" onClick={onClose}>
      <div className="confirmation-modal signup-payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        {/* Header - Show selected team */}
        <div className="modal-header">
          <h2>{step === 1 ? 'Create Your Account' : 'Complete Payment'}</h2>
        </div>

        {/* Selected Pick Summary */}
        <div className="pick-summary">
          <img
            src={selectedTeam.crest}
            alt={selectedTeam.name}
            className="modal-crest"
          />
          <div className="pick-details">
            <h3>{selectedTeam.name}</h3>
            <p className="pick-opponent">vs {opponent}</p>
            <div className="pick-match-time">
              <div>🇬🇧 {times.uk}</div>
              <div>🇺🇸 {times.est} EST</div>
            </div>
            <div className="matchday-badge">Matchday {matchday}</div>
          </div>
        </div>

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleRegister} className="signup-form">
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
              {loading ? 'Creating Account...' : 'Continue to Payment →'}
            </button>
          </form>
        )}

        {/* Step 2: PayPal Payment */}
        {step === 2 && (
          <div className="payment-step">
            <div className="payment-info">
              <div className="price-display">
                <span className="price-label">Entry Fee:</span>
                <span className="price-amount">$10.00</span>
              </div>
              <p className="payment-note">
                Complete your payment to lock in your pick!
              </p>
            </div>

            <div className="paypal-buttons-container" ref={paypalButtonsRef}></div>

            <p className="payment-footer-note">
              You can't change this pick once payment is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SignupPayment;
