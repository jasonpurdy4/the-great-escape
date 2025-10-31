// Dashboard - Main logged-in user page
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import BalanceCard from './BalanceCard';
import MyPicks from './MyPicks';
import FutureMatchweeks from './FutureMatchweeks';
import Referral from './Referral';
import ReferralModal from '../ReferralModal';
import './Dashboard.css';

function Dashboard() {
  const { user, balance, credits, totalFunds, logout, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUserData();

    // Show referral modal for new users (first time on dashboard)
    const hasSeenReferralModal = localStorage.getItem('hasSeenReferralModal');
    if (!hasSeenReferralModal && user) {
      setShowReferralModal(true);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user's entries
      const entriesResponse = await fetch(`${API_URL}/api/entries/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const entriesData = await entriesResponse.json();

      if (entriesData.success) {
        // Transform snake_case API response to camelCase for frontend
        const transformedEntries = entriesData.data.map(entry => ({
          id: entry.id,
          poolId: entry.pool_gameweek,
          entryNumber: entry.entry_number,
          status: entry.status,
          createdAt: entry.created_at,
          eliminatedGameweek: entry.eliminated_gameweek,
          totalPicks: entry.total_picks,
          winningPicks: entry.winning_picks,
          losingPicks: entry.losing_picks,
          poolStatus: entry.pool_status,
          // Include the latest pick if available
          currentPick: entry.latest_pick ? {
            matchday: entry.latest_pick.gameweek,
            team: {
              id: entry.latest_pick.team_id,
              name: entry.latest_pick.team_name,
              crest: entry.latest_pick.team_crest
            },
            result: entry.latest_pick.result || 'pending',
            pickedAt: entry.latest_pick.picked_at
          } : null
        }));
        setEntries(transformedEntries);
      }

      // Fetch user's stats
      const statsResponse = await fetch(`${API_URL}/api/entries/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handleCloseReferralModal = () => {
    setShowReferralModal(false);
    localStorage.setItem('hasSeenReferralModal', 'true');
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
            onRefresh={fetchUserData}
          />
        </div>

        {/* My Active Picks */}
        <div className="dashboard-section">
          <h2 className="section-title">My Active Picks</h2>
          <MyPicks entries={entries} onRefresh={fetchUserData} />
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

      {/* Referral Modal - Shows for new users */}
      {showReferralModal && user?.referralCode && (
        <ReferralModal
          onClose={handleCloseReferralModal}
          referralCode={user.referralCode}
        />
      )}
    </div>
  );
}

export default Dashboard;
