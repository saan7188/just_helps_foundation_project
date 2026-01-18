import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ✅ 1. Define Server URL centrally
const API_URL = "https://justhelpsserver.onrender.com";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Use API_URL
      await axios.put(`${API_URL}/api/auth/resetpassword/${token}`, { password });
      alert('✅ Password Updated Successfully! Please Login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('❌ Error: ' + (err.response?.data?.msg || 'Link expired or invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '80px' }}>
      <div className="cause-card" style={{ padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#1F2937' }}>New Password</h2>
        <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '20px', fontSize: '0.9rem' }}>
          Please create a strong password.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Enter New Password</label>
          <input 
            type="password" 
            required minLength="6"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' }} 
          />
          <button disabled={loading} className="btn" style={{ width: '100%', padding: '12px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
