import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CitizenDashboard from './pages/CitizenDashboard';

function isAdminUser(user) {
  return user?.role === 'admin' || user?.role === 'manager';
}
function isCitizenUser(user) {
  return user?.role === 'citizen';
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020b05' }}>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: '#00ff8833', borderTopColor: '#00ff88' }}
          />
          <div className="font-orbitron text-sm" style={{ color: '#00ff88' }}>
            INITIALIZING FRIDAY...
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (role === 'admin' && !isAdminUser(user)) {
    return <Navigate to="/citizen" replace />;
  }

  if (role === 'citizen' && !isCitizenUser(user)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={isAdminUser(user) ? '/admin' : '/citizen'} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/manager" element={<Navigate to="/admin" replace />} />

      <Route
        path="/citizen"
        element={
          <ProtectedRoute role="citizen">
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
