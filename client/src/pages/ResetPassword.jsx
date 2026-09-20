import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const isStrongPassword = password =>
  password.length >= 10 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isStrongPassword(password)) {
      setError('Use at least 10 characters with uppercase, lowercase, a number and a special character.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.put(`${API_URL}/api/auth/resetpassword/${token}`, { password });
      navigate('/login', { replace: true, state: { message: 'Password updated. Please sign in.' } });
    } catch (err) {
      setError(err.response?.data?.msg || 'The reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section auth-simple-page">
      <div className="auth-simple-card">
        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h1>Create a new password</h1>
        <p>Use a strong password you do not reuse elsewhere.</p>

        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="auth-field">
            New password
            <input
              className="form-input"
              type="password"
              autoComplete="new-password"
              required
              minLength="10"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <p className="field-help">10+ characters, including uppercase, lowercase, a number and a special character.</p>
          <button disabled={loading} className="primary-button full">
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
