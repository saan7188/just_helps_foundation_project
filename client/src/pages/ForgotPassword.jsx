import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://https://just-helps-foundation-project.vercel.app/api/auth/forgotpassword', { email });
      setMsg('✅ Check your email for the reset link.');
      setError('');
    } catch (err) {
      setError('❌ ' + (err.response?.data?.msg || 'Error sending email'));
      setMsg('');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '80px' }}>
      <div className="cause-card" style={{ padding: '30px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '10px' }}>Reset Password</h2>
        <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '0.9rem' }}>
          Enter your email to receive a secure link.
        </p>

        {msg && <div style={{ color: 'green', marginBottom: '10px', background: '#ecfdf5', padding: '10px' }}>{msg}</div>}
        {error && <div style={{ color: 'red', marginBottom: '10px', background: '#fef2f2', padding: '10px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            required
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd' }} 
          />
          <button className="btn btn-primary" style={{ width: '100%' }}>Send Link</button>
        </form>

        <Link to="/login" style={{ display: 'block', marginTop: '20px', color: '#6B7280', fontSize: '0.9rem' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}