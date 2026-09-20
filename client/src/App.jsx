import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from './api';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Maintenance from './components/Maintenance';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';

import Home from './pages/Home';
import Causes from './pages/Causes';
import Campaign from './pages/Campaign';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Create from './pages/Create';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Donate from './pages/Donate';
import DonationResult from './pages/DonationResult';

function App() {
  const location = useLocation();
  const [config, setConfig] = useState({
    heroTitle: 'Small Acts. Massive Impact.',
    heroSubtitle: 'A simple way to find a genuine need and make a meaningful difference.',
    maintenanceMode: false,
    announcement: ''
  });
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/site`);
        if (res.data) setConfig(res.data);
      } catch (err) {
        console.error('Failed to load site config. Using defaults.', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  const isOpenRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password');

  if (!loadingConfig && config.maintenanceMode && !isOpenRoute) {
    return <Maintenance announcement={config.announcement} />;
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home config={config} />} />
          <Route path="/causes" element={<Causes />} />
          <Route path="/campaign/:id" element={<Campaign />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donate/:id" element={<Donate />} />
          <Route path="/donation-result" element={<DonationResult />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
