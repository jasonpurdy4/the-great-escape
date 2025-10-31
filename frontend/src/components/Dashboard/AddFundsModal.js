// Add Funds Modal - PayPal integration for adding money to balance
import React, { useState, useEffect } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../../context/AuthContext';
import './AddFundsModal.css';

function AddFundsModal({ onClose, onSuccess }) {
  const { token, refreshUser } = useAuth();
  const [amount, setAmount] = useState('10.00');
  const [customAmount, setCustomAmount] = useState('');
  const [showPayPal, setShowPayPal] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const predefinedAmounts = ['10.00', '25.00', '50.00', '100.00'];

  const handleAmountSelect = (value) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
      setAmount(value);
    }
  };

  const handleContinue = () => {
    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount < 5) {
      alert('Minimum amount is $5.00');
      return;
    }
    if (finalAmount > 1000) {
      alert('Maximum amount is $1000.00');
      return;
    }
    setShowPayPal(true);
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/payments/add-funds/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data.orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (data) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/payments/add-funds/capture-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: data.orderID
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to capture payment');
      }

      // Refresh balance
      await refreshUser();

      // Success!
      alert(`Success! $${amount} has been added to your balance.`);
      if (onSuccess) {
        onSuccess(result.data);
      }
      onClose();
    } catch (error) {
      console.error('Error capturing payment:', error);
      alert('Payment processing failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const onError = (err) => {
    console.error('PayPal error:', err);
    alert('Payment failed. Please try again.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-funds-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>Add Funds</h2>
          <p className="modal-subtitle">Add money to your balance for future entries</p>
        </div>

        {!showPayPal ? (
          <div className="amount-selection">
            <label>Select Amount</label>

            <div className="amount-buttons">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  className={`amount-btn ${amount === amt && !customAmount ? 'selected' : ''}`}
                  onClick={() => handleAmountSelect(amt)}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="custom-amount">
              <label>Or enter custom amount</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="0.00"
                  className="amount-input"
                />
              </div>
              <div className="amount-limits">Minimum: $5.00 • Maximum: $1,000.00</div>
            </div>

            <button
              onClick={handleContinue}
              className="btn btn-primary btn-large"
              disabled={!amount || parseFloat(amount) < 5}
            >
              Continue to Payment
            </button>
          </div>
        ) : (
          <div className="paypal-section">
            <div className="payment-summary">
              <div className="summary-row">
                <span>Amount:</span>
                <strong>${parseFloat(amount).toFixed(2)}</strong>
              </div>
              <div className="summary-note">
                This amount will be added to your withdrawable balance
              </div>
            </div>

            <div className="paypal-buttons-container">
              {loading ? (
                <div className="loading">Processing payment...</div>
              ) : (
                <PayPalButtons
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                  style={{
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'pay'
                  }}
                />
              )}
            </div>

            <button
              onClick={() => setShowPayPal(false)}
              className="btn btn-secondary"
              disabled={loading}
            >
              ← Back to Amount Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddFundsModal;
