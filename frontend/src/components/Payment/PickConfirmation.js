// Pick Confirmation Modal - Payment-first flow with PayPal sandbox
import React, { useEffect, useRef, useState } from 'react';
import './Payment.css';

function PickConfirmation({
  selectedTeam,
  match,
  poolId,
  onClose,
  onSuccess
}) {
  const paypalRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedTeam || !match) return;
    console.log('PickConfirmation mounted');
    console.log('poolId:', poolId);
    console.log('selectedTeam:', selectedTeam);
    console.log('PayPal Client ID:', process.env.REACT_APP_PAYPAL_CLIENT_ID);
    console.log('API URL:', process.env.REACT_APP_API_URL);

    // Load PayPal SDK
    const loadPayPalScript = () => {
      if (!process.env.REACT_APP_PAYPAL_CLIENT_ID) {
        setError('PayPal Client ID not configured');
        setLoading(false);
        console.error('REACT_APP_PAYPAL_CLIENT_ID is missing!');
        return;
      }

      if (window.paypal) {
        console.log('PayPal SDK already loaded, rendering button');
        renderPayPalButton();
        return;
      }

      console.log('Loading PayPal SDK...');
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;
      script.addEventListener('load', () => {
        console.log('PayPal SDK loaded successfully');
        renderPayPalButton();
      });
      script.addEventListener('error', () => {
        console.error('Failed to load PayPal SDK');
        setError('Failed to load PayPal');
        setLoading(false);
      });
      document.body.appendChild(script);
    };

    const renderPayPalButton = () => {
      if (!paypalRef.current) {
        console.error('paypalRef.current is null!');
        return;
      }

      console.log('Rendering PayPal button...');
      window.paypal.Buttons({
        createOrder: async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/guest/create-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                poolId,
                teamId: selectedTeam.id,
                teamName: selectedTeam.name,
                matchId: match.id
              })
            });
            const data = await response.json();
            return data.data.orderId;
          } catch (err) {
            console.error('Error creating order:', err);
            setError('Failed to create payment order');
            throw err;
          }
        },
        onApprove: async (data) => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/guest/capture-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID })
            });
            const result = await response.json();

            if (result.success) {
              onSuccess(result.data);
            } else {
              setError(result.error || 'Payment failed');
            }
          } catch (err) {
            console.error('Error capturing payment:', err);
            setError('Failed to process payment');
          }
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          setError('Payment error occurred');
        }
      }).render(paypalRef.current);

      setLoading(false);
    };

    loadPayPalScript();
  }, [selectedTeam, match, poolId, onSuccess]);

  if (!selectedTeam || !match) return null;

  const opponent = match.homeTeam.id === selectedTeam.id
    ? match.awayTeam.name
    : match.homeTeam.name;

  return (
    <div className="confirmation-overlay" onClick={onClose}>
      <div className="confirmation-modal pick-confirmation" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="modal-content">
          <img
            src={selectedTeam.crest}
            alt={selectedTeam.name}
            className="modal-crest large-crest"
          />
          <h1 className="team-pick-name">{selectedTeam.name}</h1>
          <p className="modal-opponent">vs {opponent}</p>

          <p className="modal-subtitle">$10 Entry</p>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-box">
              Loading payment options...
            </div>
          )}

          <div ref={paypalRef} className="paypal-button-container"></div>
        </div>
      </div>
    </div>
  );
}

export default PickConfirmation;
