// Pick Confirmation Modal - Simple "Create Account" or "Login"
import React from 'react';
import './Payment.css';

function PickConfirmation({
  selectedTeam,
  match,
  onClose,
  onConfirm
}) {
  if (!selectedTeam || !match) return null;

  const opponent = match.homeTeam.id === selectedTeam.id
    ? match.awayTeam.name
    : match.homeTeam.name;

  const handleCreateAccount = () => {
    // For now, just trigger onConfirm which will show SignupPayment
    onConfirm();
  };

  const handleLogin = () => {
    // TODO: Show login modal
    alert('Login functionality coming soon!');
  };

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

          <p className="modal-subtitle">$10 entry fee to lock in this pick</p>
        </div>

        <div className="modal-actions">
          <button onClick={handleCreateAccount} className="btn btn-primary btn-large">
            Create Account
          </button>
          <button onClick={handleLogin} className="btn btn-secondary btn-large">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default PickConfirmation;
