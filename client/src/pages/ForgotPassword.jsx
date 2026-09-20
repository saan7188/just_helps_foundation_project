import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');

    try {
      await axios.post(`${API_URL}/api/auth/forgotpassword`, { email: email.trim().toLowerCase() });
      setMsg('Check your email for the reset link.');
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to send the reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section auth-simple-page">
      <div className="auth-simple-card">
        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h1>Reset your password</h1>
        <p>Enter your email to receive a secure password-reset link.</p>

        {msg && <div className="form-success" role="status">{msg}</div>}
        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="auth-field">
            Email address
            <input
              className="form-input"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <button className="primary-button full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <Link to="/login" className="auth-back-link">← Back to login</Link>
      </div>
    </div>
  );
}
