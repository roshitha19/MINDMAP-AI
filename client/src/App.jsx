import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import AppLayout from './layouts/AppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';

// Protected Feature Pages
import DashboardPage from './pages/DashboardPage';
import UniversePage from './pages/UniversePage';
import SubjectsPage from './pages/SubjectsPage';
import GraphGeneratorPage from './pages/GraphGeneratorPage';
import AITutorPage from './pages/AITutorPage';
import QuizCenterPage from './pages/QuizCenterPage';
import RevisionCenterPage from './pages/RevisionCenterPage';
import LearningPathsPage from './pages/LearningPathsPage';
import ResourceLibraryPage from './pages/ResourceLibraryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-darkest flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cosmic-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (Redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/universe" element={<UniversePage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/generator" element={<GraphGeneratorPage />} />
              <Route path="/tutor" element={<AITutorPage />} />
              <Route path="/quizzes" element={<QuizCenterPage />} />
              <Route path="/revisions" element={<RevisionCenterPage />} />
              <Route path="/paths" element={<LearningPathsPage />} />
              <Route path="/resources" element={<ResourceLibraryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
