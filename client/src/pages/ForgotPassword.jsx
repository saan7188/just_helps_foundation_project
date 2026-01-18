import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// ✅ 1. Define Server URL centrally
const API_URL = "https://justhelpsserver.onrender.com";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Use API_URL here
      await axios.post(`${API_URL}/api/auth/forgotpassword`, { email });
      setMsg('✅ Check your email for the reset link.');
      setError('');
    } catch (err) {
      console.error("Forgot Password Error:", err);
      setError('❌ ' + (err.response?.data?.msg || 'Error sending email. Try again.'));
      setMsg('');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '80px' }}>
      <div className="cause-card" style={{ padding: '30px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginBottom: '10px', color: '#1F2937' }}>Reset Password</h2>
        <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '0.9rem' }}>
          Enter your email to receive a secure link.
        </p>

        {msg && <div style={{ color: '#065F46', marginBottom: '15px', background: '#D1FAE5', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }}>{msg}</div>}
        {error && <div style={{ color: '#991B1B', marginBottom: '15px', background: '#FEE2E2', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            required
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' }} 
          />
          <button className="btn" style={{ width: '100%', padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Send Link</button>
        </form>

        <Link to="/login" style={{ display: 'block', marginTop: '20px', color: '#6B7280', fontSize: '0.9rem', textDecoration: 'none' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
