// ReferralModal - Shows after successful pick to encourage referrals
import React, { useState } from 'react';
import './ReferralModal.css';

function ReferralModal({ onClose, referralCode }) {
  const [copied, setCopied] = useState(false);

  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
  const referralLink = `${FRONTEND_URL}/?ref=${referralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="referral-overlay" onClick={onClose}>
      <div className="referral-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="referral-content">
          <div className="referral-icon">🎁</div>
          <h2>Share The Great Escape</h2>
          <p className="referral-subtitle">
            Invite friends and you both win!
          </p>

          <div className="referral-incentive">
            <div className="incentive-item">
              <div className="incentive-icon">💰</div>
              <div className="incentive-text">
                <strong>You get $10</strong>
                <span>When a friend joins</span>
              </div>
            </div>
            <div className="incentive-divider">+</div>
            <div className="incentive-item">
              <div className="incentive-icon">🎉</div>
              <div className="incentive-text">
                <strong>Friend gets $10</strong>
                <span>On their first entry</span>
              </div>
            </div>
          </div>

          <div className="referral-code-section">
            <label>Your Referral Code</label>
            <div className="referral-code-display">{referralCode}</div>
          </div>

          <div className="referral-link-section">
            <label>Your Referral Link</label>
            <div className="referral-link-box">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="referral-link-input"
              />
              <button
                onClick={handleCopyLink}
                className={`copy-btn ${copied ? 'copied' : ''}`}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          <p className="referral-note">
            Share your link with friends and start earning! Credits are added to your account when they make their first entry.
          </p>

          <button onClick={onClose} className="btn btn-primary btn-large">
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReferralModal;
