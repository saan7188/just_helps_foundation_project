import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from './api';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Maintenance from './components/Maintenance';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Create from './pages/Create';
import Admin from './pages/Admin';
import Donate from './pages/Donate';

function App() {
  const location = useLocation();

  const [config, setConfig] = useState({
    heroTitle: "Small Acts. Massive Impact.",
    heroSubtitle: "Your donation changes lives.",
    maintenanceMode: false,
    announcement: ""
  });
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/site`);
        if (res.data) setConfig(res.data);
      } catch (err) {
        console.error("Failed to load site config. Using defaults.", err);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  const isAdminRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password');

  if (!loadingConfig && config.maintenanceMode && !isAdminRoute) {
    return <Maintenance announcement={config.announcement} />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home config={config} />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          <Route path="/donate/:id" element={<Donate />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
