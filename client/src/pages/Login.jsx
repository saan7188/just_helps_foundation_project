import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  
  // MODES
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // DATA
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. SEND OTP
  const handleSendOtp = async () => {
    if (!formData.email) return setError("Please enter your email first.");
    setLoading(true);
    setError('');
    try {
      await axios.post('https://just-helps-foundation-project.vercel.app/api/auth/send-otp', { 
        email: formData.email, 
        type: 'LOGIN'
      });
      setOtpSent(true);
      alert("✅ OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 2. SUBMIT LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (useOtp) {
        res = await axios.post('https://just-helps-foundation-project.vercel.app/api/auth/login-with-otp', {
          email: formData.email,
          otp: formData.otp
        });
      } else {
        res = await axios.post('https://just-helps-foundation-project.vercel.app/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
      }

      // Success
      localStorage.setItem('token', res.data.token);
      
      // Stop Loading immediately
      setLoading(false);

      // Check Admin Flag
      if (res.data.isAdmin) {
        alert("🔐 Welcome Admin!");
        navigate('/admin');
      } else {
        alert("✅ Welcome back!");
        navigate('/create');
      }

    } catch (err) {
      setLoading(false); // FIXED: Turn off loading on error
      console.error(err);
      setError(err.response?.data?.msg || 'Login failed. Check server connection.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 75px)', background: '#F9FAFB' }}>
      
      {/* IMAGE SIDE */}
      <div className="login-image-panel" style={{ 
        flex: 1, backgroundImage: 'url("https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1000")',
        backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}></div>
        <div style={{ position: 'absolute', bottom: '60px', left: '60px', color: 'white' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Your kindness<br/>saves lives.</h2>
        </div>
      </div>

      {/* FORM SIDE */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', background: 'white' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Fundraiser Login</h1>
          <p style={{ color: '#6B7280', marginBottom: '30px' }}>Manage your campaigns and track donations.</p>

          {error && <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>⚠️ {error}</div>}

          {/* TOGGLE */}
          <div style={{ display: 'flex', marginBottom: '25px', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
            <button 
              type="button" onClick={() => { setUseOtp(false); setError(''); }}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', background: !useOtp ? 'white' : 'transparent', fontWeight: '600', cursor: 'pointer' }}
            >
              Password Login
            </button>
            <button 
              type="button" onClick={() => { setUseOtp(true); setError(''); }}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', background: useOtp ? 'white' : 'transparent', fontWeight: '600', cursor: 'pointer' }}
            >
              OTP Login
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email Address</label>
              <input 
                type="email" required placeholder="name@example.com"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                style={inputStyle}
              />
            </div>

            {!useOtp && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: '600' }}>Password</label>
                  <Link to="/forgot-password" style={{ color: '#D97706', fontSize: '0.85rem' }}>Forgot?</Link>
                </div>
                <input 
                  type="password" required placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  style={inputStyle}
                />
              </div>
            )}

            {useOtp && (
              <div className="fade-in" style={{ marginBottom: '20px' }}>
                {!otpSent ? (
                  <button type="button" onClick={handleSendOtp} disabled={loading} style={{ ...btnStyle, background: '#4B5563' }}>
                    {loading ? 'Sending...' : 'Send Login OTP'}
                  </button>
                ) : (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Enter OTP</label>
                    <input 
                      type="text" required placeholder="XXXX"
                      value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})}
                      style={{ ...inputStyle, letterSpacing: '5px', textAlign: 'center', fontSize: '1.2rem' }}
                    />
                  </div>
                )}
              </div>
            )}

            {(!useOtp || (useOtp && otpSent)) && (
              <button disabled={loading} type="submit" style={btnStyle}>
                {loading ? 'Verifying...' : 'Secure Login'}
              </button>
            )}
          </form>

          <p style={{ textAlign: 'center', marginTop: '25px', color: '#6B7280' }}>
            New here? <Link to="/register" style={{ color: '#D97706', fontWeight: 'bold' }}>Create Account</Link>
          </p>

        </div>
      </div>
      <style>{`@media (max-width: 900px) { .login-image-panel { display: none !important; } }`}</style>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' };
const btnStyle = { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#D97706', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' };