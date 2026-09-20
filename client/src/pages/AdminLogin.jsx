import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { useAuth } from '../context/AuthContext';

const adminImage = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/admin-login`, form);
      login(res.data.token, true);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-visual" style={{ backgroundImage: `url("${adminImage}")` }}>
        <div className="admin-login-overlay" />
        <div className="admin-login-copy">
          <span className="eyebrow">JUST HELPS • ADMIN</span>
          <h1>Run the work behind every helping hand.</h1>
          <p>Review campaigns, verify proof, monitor demo donations and keep the foundation experience up to date.</p>
        </div>
      </section>

      <section className="admin-login-panel">
        <div className="admin-login-card">
          <div className="admin-lock">🔐</div>
          <span className="eyebrow">PRIVATE ACCESS</span>
          <h2>Admin sign in</h2>
          <p className="admin-login-muted">This is separate from fundraiser accounts.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={submit}>
            <label className="admin-login-label">
              Admin username
              <input
                className="form-input"
                value={form.username}
                autoComplete="username"
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Enter admin username"
                required
              />
            </label>

            <label className="admin-login-label">
              Admin password
              <input
                className="form-input"
                type="password"
                value={form.password}
                autoComplete="current-password"
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter admin password"
                required
              />
            </label>

            <button className="primary-button full" disabled={loading}>
              {loading ? 'Signing in…' : 'Open admin dashboard'}
            </button>
          </form>

          <button className="text-button" onClick={() => navigate('/')}>← Back to Just Helps</button>
        </div>
      </section>
    </main>
  );
}
