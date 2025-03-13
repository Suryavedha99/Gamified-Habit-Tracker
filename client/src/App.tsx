import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navigation from 'components/Navigation';
import Dashboard from 'pages/Dashboard';
import HabitList from 'pages/HabitList';
import Challenges from 'pages/Challenges';
import Profile from 'pages/Profile';
import Auth from 'pages/Auth';
import { AuthProvider } from 'context/AuthContext';
import PrivateRoute from 'components/PrivateRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/habits"
              element={
                <PrivateRoute>
                  <HabitList />
                </PrivateRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <PrivateRoute>
                  <Challenges />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  );
};

export default App;
