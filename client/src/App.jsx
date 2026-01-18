import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Maintenance from './components/Maintenance'; // ✅ FIXED: Importing from components folder

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Create from './pages/Create'; // User Dashboard
import Admin from './pages/Admin';   // Admin Dashboard
import Donate from './pages/Donate';

// ✅ Define Server URL (Production Ready)
const API_URL = "https://justhelpsserver.onrender.com";

function App() {
  const location = useLocation();
  
  // --- SITE CONFIG STATE ---
  const [config, setConfig] = useState({
    heroTitle: "Small Acts. Massive Impact.",
    heroSubtitle: "Your donation changes lives.",
    maintenanceMode: false,
    announcement: ""
  });
  const [loadingConfig, setLoadingConfig] = useState(true);

  // 1. Fetch Site Settings from Backend on Load
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/site`);
        if (res.data) {
          setConfig(res.data);
        }
      } catch (err) {
        console.error("Failed to load site config. Using defaults.", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  // 2. Maintenance Mode Logic
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');
  
  if (!loadingConfig && config.maintenanceMode && !isAdminRoute) {
    return <Maintenance announcement={config.announcement} />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Navbar is always visible */}
      <Navbar />

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        <Routes>
          {/* HOME: Passes config so Hero Text is dynamic */}
          <Route path="/" element={<Home config={config} />} />
          
          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* DASHBOARDS */}
          <Route path="/create" element={<Create />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* DONATION FLOW */}
          <Route path="/donate/:id" element={<Donate />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
