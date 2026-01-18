import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './apiconfig'; // ✅ Hosting Ready

// COMPONENTS
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Maintenance from './components/Maintenance'; 

// PAGES
import Home from './pages/Home';
import Donate from './pages/Donate';
import Login from './pages/Login';
import Create from './pages/Create';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
// ❌ Profile Import Removed

function App() {
  const location = useLocation();
  const [siteConfig, setSiteConfig] = useState({ 
    heroTitle: '', heroSubtitle: '', maintenanceMode: false, announcement: '' 
  });
  const [loadingConfig, setLoadingConfig] = useState(true);

  // 1. FETCH SITE CONFIG (God Mode)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/site`);
        setSiteConfig(res.data);
      } catch (err) {
        console.error("Failed to load site config:", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  // 2. MAINTENANCE MODE CHECK
  // Allow access ONLY to Login, Register, Admin, and Forgot Password
  const isProtectedPath = !['/login', '/admin', '/register', '/forgot-password', '/reset-password'].some(path => location.pathname.startsWith(path));
  
  if (!loadingConfig && siteConfig.maintenanceMode && isProtectedPath) {
    return <Maintenance announcement={siteConfig.announcement} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop /> 
      <Navbar />

      <div style={{ flex: 1 }}>
        <Routes>
          {/* Pass config to Home for Dynamic Hero Text */}
          <Route path="/" element={<Home config={siteConfig} />} />
          
          <Route path="/donate/:id" element={<Donate />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<Create />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </div>

      <Footer />    
    </div>
  );
}

export default App;