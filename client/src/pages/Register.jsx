import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import API_URL from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    name: '',
    password: ''
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = formData.email.trim().toLowerCase();

    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, {
        email,
        type: 'REGISTER'
      });

      setFormData(prev => ({ ...prev, email }));
      setStep(2);
      alert(`OTP sent to ${email}. Please check your inbox.`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = formData.otp.trim();

    if (!/^\d{4}$/.test(otp)) {
      setError('Enter the 4-digit OTP sent to your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp
      });

      setVerificationToken(res.data.verificationToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.msg || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        verificationToken
      });

      login(res.data.token, res.data.isAdmin);
      alert('Verification successful! Account created.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '60px', paddingBottom: '100px' }}>
      <div className="cause-card" style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#1F2937', marginBottom: '5px' }}>Start a Fundraiser</h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            {step === 1 ? 'Step 1: Email Verification' : step === 2 ? 'Step 2: Verify OTP' : 'Step 3: Secure Account'}
          </p>
          <div style={{ height: '4px', background: '#E5E7EB', marginTop: '15px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%', height: '100%', background: '#D97706', transition: 'width 0.3s' }}></div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
            </div>
            <button disabled={loading} className="btn" style={{ width: '100%', padding: '14px', background: '#1F2937', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
              Already registered? <Link to="/login" style={{ color: '#D97706', fontWeight: 'bold', textDecoration: 'none' }}>Login here</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Enter OTP</label>
              <input
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="XXXX"
                maxLength="4"
                value={formData.otp}
                onChange={e => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}
              />
              <button
                type="button"
                disabled={loading}
                onClick={handleVerifyOtp}
                className="btn"
                style={{ width: '100%', marginTop: '15px', padding: '14px', background: '#D97706', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
            >
              Change email
            </button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalRegister} className="fade-in">
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Full Name</label>
              <input
                type="text"
                required
                minLength="2"
                maxLength="80"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength="6"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={inputStyle}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  tabIndex="0"
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    cursor: 'pointer', fontSize: '1.2rem', color: '#9CA3AF', userSelect: 'none'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            <button disabled={loading} className="btn" style={{ width: '100%', padding: '14px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Creating...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  fontSize: '1rem'
};
