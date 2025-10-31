// BalanceCard - Shows user's balance, credits, and total funds
import React, { useState } from 'react';
import AddFundsModal from './AddFundsModal';
import './BalanceCard.css';

function BalanceCard({ balance, credits, totalFunds, onRefresh }) {
  const [showAddFunds, setShowAddFunds] = useState(false);

  const formatCurrency = (cents) => {
    return (cents / 100).toFixed(2);
  };

  const handleAddFunds = () => {
    setShowAddFunds(true);
  };

  const handleAddFundsSuccess = () => {
    setShowAddFunds(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="balance-card">
      <div className="balance-header">
        <h2>Your Funds</h2>
        <button onClick={handleAddFunds} className="btn btn-primary">
          Add Funds
        </button>
      </div>

      <div className="balance-grid">
        {/* Total Funds - Prominent */}
        <div className="balance-item total-funds">
          <div className="balance-label">Total Available</div>
          <div className="balance-amount total">
            ${formatCurrency(totalFunds)}
          </div>
          <div className="balance-note">Balance + Credits</div>
        </div>

        {/* Balance - Withdrawable */}
        <div className="balance-item">
          <div className="balance-icon">💰</div>
          <div className="balance-info">
            <div className="balance-label">Balance</div>
            <div className="balance-amount">${formatCurrency(balance)}</div>
            <div className="balance-note">Withdrawable</div>
          </div>
        </div>

        {/* Credits - Non-withdrawable */}
        <div className="balance-item">
          <div className="balance-icon">🎁</div>
          <div className="balance-info">
            <div className="balance-label">Credits</div>
            <div className="balance-amount">${formatCurrency(credits)}</div>
            <div className="balance-note">Entry-only</div>
          </div>
        </div>
      </div>

      <div className="balance-explainer">
        <div className="explainer-item">
          <strong>Balance:</strong> Winnings and deposits. Can be withdrawn anytime.
        </div>
        <div className="explainer-item">
          <strong>Credits:</strong> Referral bonuses. Can only be used for entry fees.
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <AddFundsModal
          onClose={() => setShowAddFunds(false)}
          onSuccess={handleAddFundsSuccess}
        />
      )}
    </div>
  );
}

export default BalanceCard;
