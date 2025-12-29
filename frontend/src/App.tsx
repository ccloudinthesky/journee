import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TripProvider } from './contexts/TripContext';
import { initializeMockData } from './services/mockData';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Explore from './pages/Explore';

function App() {
  useEffect(() => {
    // Initialize mock data on app start
    initializeMockData();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <TripProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/explore/:tripId" element={<Explore />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TripProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;