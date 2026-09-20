import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const statusMeta = {
  pending: ['Under review', 'status-pending'],
  approved: ['Live', 'status-approved'],
  rejected: ['Not approved', 'status-rejected'],
  more_info: ['More information needed', 'status-pending'],
  paused: ['Paused', 'status-rejected'],
  completed: ['Completed', 'status-approved']
};

export default function Dashboard() {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    axios.get(`${API_URL}/api/causes/mine`, { headers: { 'x-auth-token': localStorage.getItem('token') } })
      .then(res => setCauses(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="container section">
      <div className="page-intro">
        <span className="eyebrow">YOUR FUNDRAISERS</span>
        <h1>Keep track of every campaign.</h1>
        <p>Each fundraiser has its own verification status, goal and progress.</p>
      </div>
      <div style={{ marginBottom: 25 }}><Link to="/create" className="primary-link-button">+ Start a new fundraiser</Link></div>
      {loading ? <div className="empty-state">Loading your campaigns…</div> :
        causes.length ? <div className="dashboard-list">{causes.map(cause => {
          const meta = statusMeta[cause.status || (cause.isVerified ? 'approved' : 'pending')] || statusMeta.pending;
          const pct = Math.min((Number(cause.collected || 0) / Number(cause.target || 1)) * 100, 100);
          return <article key={cause._id} className="dashboard-card">
            <div>
              <span className={`status-pill ${meta[1]}`}>{meta[0]}</span>
              <h2>{cause.title}</h2>
              <p>{cause.subtitle}</p>
              {cause.verificationNote && <div className="info-card compact-info"><strong>Review note</strong><p>{cause.verificationNote}</p></div>}
            </div>
            <div className="dashboard-progress">
              <div><strong>₹{Number(cause.collected || 0).toLocaleString()}</strong> / ₹{Number(cause.target || 0).toLocaleString()}</div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              <small>{Math.round(pct)}% raised · {cause.deadline ? `Deadline ${new Date(cause.deadline).toLocaleDateString()}` : 'No deadline'}</small>
            </div>
            {cause.status === 'approved' && <Link to={`/campaign/${cause._id}`} className="secondary-link-button">View public campaign</Link>}
          </article>;
        })}</div> :
        <div className="empty-state"><h2>No fundraiser yet</h2><p>Start with a sample template and submit your story for verification.</p><Link to="/create" className="primary-link-button">Start a fundraiser</Link></div>}
    </div>
  );
}
