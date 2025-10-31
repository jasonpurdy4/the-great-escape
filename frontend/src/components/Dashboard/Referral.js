// Referral - MASSIVE referral component with social sharing
import React, { useState, useEffect } from 'react';
import './Referral.css';

function Referral({ userId }) {
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    creditsEarned: 0,
    pendingCredits: 0
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, [userId]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from API
      // For now, generate a mock referral code
      const mockCode = `TGE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setReferralCode(mockCode);

      // Mock stats
      setReferralStats({
        totalReferrals: 3,
        creditsEarned: 30,
        pendingCredits: 10
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${referralCode}`;
  };

  const copyToClipboard = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const link = getReferralLink();
    const text = `Join me on The Great Escape! Pick winning Premier League teams each week and compete to be the last one standing. We both get $10 free when you sign up!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareOnWhatsApp = () => {
    const link = getReferralLink();
    const text = `Join me on The Great Escape! 🏆\n\nPick winning Premier League teams each week and compete to be the last one standing.\n\nWe both get $10 free when you sign up! 💰\n\n${link}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const link = getReferralLink();
    const subject = 'Join me on The Great Escape!';
    const body = `Hey!\n\nI've been playing The Great Escape - a Premier League survival pool where you pick winning teams each week and compete to be the last one standing.\n\nUse my referral link and we both get $10 free:\n${link}\n\nLet's see who can survive longer!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return <div className="loading">Loading referral info...</div>;
  }

  return (
    <div className="referral-component massive">
      {/* Hero Section */}
      <div className="referral-hero">
        <div className="referral-hero-content">
          <div className="referral-icon">🎁</div>
          <h2 className="referral-title">Get $10 Free!</h2>
          <p className="referral-subtitle">
            Invite a friend and you BOTH get $10 credit when they join
          </p>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="referral-link-section">
        <div className="referral-link-header">
          <h3>Your Referral Link</h3>
          <p>Share this link with your friends</p>
        </div>

        <div className="referral-link-box">
          <input
            type="text"
            value={getReferralLink()}
            readOnly
            className="referral-link-input"
          />
          <button
            onClick={copyToClipboard}
            className={`btn-copy ${copied ? 'copied' : ''}`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        <div className="referral-code-display">
          <span className="code-label">Your code:</span>
          <span className="code-value">{referralCode}</span>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div className="referral-share-section">
        <h3>Share with Friends</h3>
        <div className="share-buttons">
          <button onClick={shareOnTwitter} className="share-btn twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            <span>Share on Twitter</span>
          </button>

          <button onClick={shareOnWhatsApp} className="share-btn whatsapp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>Share on WhatsApp</span>
          </button>

          <button onClick={shareViaEmail} className="share-btn email">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Share via Email</span>
          </button>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="referral-stats-section">
        <h3>Your Referral Stats</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{referralStats.totalReferrals}</div>
            <div className="stat-label">Friends Joined</div>
          </div>

          <div className="stat-box earned">
            <div className="stat-icon">💰</div>
            <div className="stat-number">${(referralStats.creditsEarned / 100).toFixed(0)}</div>
            <div className="stat-label">Credits Earned</div>
          </div>

          <div className="stat-box pending">
            <div className="stat-icon">⏱</div>
            <div className="stat-number">${(referralStats.pendingCredits / 100).toFixed(0)}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Referral;
