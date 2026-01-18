import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/auth/resetpassword/${token}`, { password });
      alert('Password Updated! Please Login.');
      navigate('/login');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.msg || 'Link expired'));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '80px' }}>
      <div className="cause-card" style={{ padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>New Password</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: 'bold' }}>Enter New Password</label>
          <input 
            type="password" 
            required minLength="6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginTop: '5px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd' }} 
          />
          <button className="btn btn-primary" style={{ width: '100%' }}>Update Password</button>
        </form>
      </div>
    </div>
  );
}