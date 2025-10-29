import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import TeamSelection from './components/TeamSelection';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'team-selection', or 'dashboard'

  // Auto-navigate to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && currentPage === 'landing') {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, currentPage]);

  const renderPage = () => {
    if (loading) {
      return (
        <div className="loading-screen">
          <div className="loading">Loading...</div>
        </div>
      );
    }

    // If authenticated, show dashboard unless specifically on team-selection
    if (isAuthenticated && currentPage !== 'team-selection') {
      return <Dashboard onNavigate={setCurrentPage} />;
    }

    switch(currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'team-selection':
        return <TeamSelection onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
