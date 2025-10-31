import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import TeamSelection from './components/TeamSelection';
import Dashboard from './components/Dashboard/Dashboard';
import PoolDetails from './components/PoolDetails/PoolDetails';
import './App.css';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/team-selection" element={<TeamSelection />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pool/:entryId"
          element={
            <ProtectedRoute>
              <PoolDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
