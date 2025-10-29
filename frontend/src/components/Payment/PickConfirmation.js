// Pick Confirmation Modal - "Lock in Arsenal?"
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Payment.css';

function PickConfirmation({
  selectedTeam,
  match,
  matchday,
  onClose,
  onConfirm
}) {
  const { isAuthenticated, balance, credits, totalFunds } = useAuth();

  if (!selectedTeam || !match) return null;

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

  const handleLockIn = () => {
    onConfirm(selectedTeam, match);
  };

  return (
    <div className="confirmation-overlay" onClick={onClose}>
      <div className="confirmation-modal pick-confirmation" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>Lock in Your Pick?</h2>
        </div>

        <div className="modal-content">
          <img
            src={selectedTeam.crest}
            alt={selectedTeam.name}
            className="modal-crest large-crest"
          />
          <h1 className="team-pick-name">{selectedTeam.name}</h1>

          <p className="modal-opponent">vs {opponent}</p>

          <div className="modal-match-time">
            <div>🇬🇧 {times.uk}</div>
            <div>🇺🇸 {times.est} EST</div>
          </div>

          <div className="matchday-badge-large">Matchday {matchday}</div>

          {!isAuthenticated && (
            <div className="info-box">
              <p className="modal-warning">
                ⚠️ Create an account and pay $10 to lock in this pick
              </p>
            </div>
          )}

          {isAuthenticated && (
            <div className="payment-options-preview">
              <div className="funds-summary">
                <div className="fund-item">
                  <span>Balance:</span>
                  <strong>${balance.toFixed(2)}</strong>
                </div>
                <div className="fund-item">
                  <span>Credits:</span>
                  <strong>${credits.toFixed(2)}</strong>
                </div>
                <div className="fund-item total">
                  <span>Total Funds:</span>
                  <strong>${totalFunds.toFixed(2)}</strong>
                </div>
              </div>

              {totalFunds >= 10 ? (
                <div className="success-box">
                  ✓ You have sufficient funds to lock in this pick!
                </div>
              ) : (
                <div className="info-box">
                  You'll pay ${(10 - totalFunds).toFixed(2)} with PayPal
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary btn-large">
            Cancel
          </button>
          <button onClick={handleLockIn} className="btn btn-primary btn-huge lock-in-button">
            {isAuthenticated ? 'Lock It In - $10' : 'Lock It In'}
          </button>
        </div>

        {!isAuthenticated && (
          <p className="modal-footer-note">
            You can't change this pick once locked in!
          </p>
        )}
      </div>
    </div>
  );
}

export default PickConfirmation;
