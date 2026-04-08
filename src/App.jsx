import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '/src/context/AuthContext.jsx';
import LoginPage from '/src/pages/Auth/LoginPage/LoginPage.jsx';
import RegisterPage from '/src/pages/Auth/RegisterPage/RegisterPage.jsx';
import VerifyOTP from '/src/pages/Auth/VerifyOTP/VerifyOTP.jsx';
import RegisterDetailsPage from '/src/pages/Auth/RegisterDetailsPage/RegisterDetailsPage.jsx';
import ForgotPassword from '/src/pages/Auth/ForgotPassword/ForgotPassword.jsx';
import ResetPassword from '/src/pages/Auth/ResetPassword/ResetPassword.jsx';
import Dashboard from '/src/pages/Dashboard/Dashboard.jsx';
import ProfilePage from '/src/pages/Profile/ProfilePage.jsx';
import Navbar from '/src/components/layout/Navbar/Navbar.jsx';
import '/src/index.css';

const SpinnerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner-icon">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <SpinnerIcon />
          <span style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Initializing secure connection...</span>
      </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Layout = () => (
  <div className="app-layout">
    <Navbar />
    <main className="main-content mesh-gradient">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/register-details" element={<RegisterDetailsPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes with Navbar */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
