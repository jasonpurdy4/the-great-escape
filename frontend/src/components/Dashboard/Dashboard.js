// Dashboard - Main logged-in user page
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import BalanceCard from './BalanceCard';
import MyPicks from './MyPicks';
import FutureMatchweeks from './FutureMatchweeks';
import Referral from './Referral';
import './Dashboard.css';

function Dashboard({ onNavigate }) {
  const { user, balance, credits, totalFunds, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch user's active entries from API
      // const response = await getMyEntries();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="loading">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>The Great Escape</h1>
              <p className="welcome-text">Welcome back, {user?.firstName || 'Player'}!</p>
            </div>
            <div className="header-right">
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container dashboard-content">
        {/* Top Row: Balance Card */}
        <div className="dashboard-section">
          <BalanceCard
            balance={balance}
            credits={credits}
            totalFunds={totalFunds}
          />
        </div>

        {/* My Active Picks */}
        <div className="dashboard-section">
          <h2 className="section-title">My Active Picks</h2>
          <MyPicks entries={[]} onRefresh={fetchUserData} />
        </div>

        {/* Referral Section - MASSIVE */}
        <div className="dashboard-section referral-section">
          <Referral userId={user?.id} />
        </div>

        {/* Future Matchweeks */}
        <div className="dashboard-section">
          <h2 className="section-title">Join Future Matchweeks</h2>
          <FutureMatchweeks onJoin={fetchUserData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
