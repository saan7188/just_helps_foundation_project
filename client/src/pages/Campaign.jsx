import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const imageUrl = image => image?.startsWith('http') ? image : `${API_URL}${image || ''}`;

export default function Campaign() {
  const { id } = useParams();
  const [cause, setCause] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/causes/${id}`).then(res => setCause(res.data)).catch(() => setCause(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="empty-state">Loading campaign…</div>;
  if (!cause) return <div className="empty-state"><h2>Campaign not found</h2><Link to="/causes">Back to causes</Link></div>;

  const raised = Number(cause.collected || 0);
  const target = Number(cause.target || 1);
  const pct = Math.min((raised / target) * 100, 100);
  const days = cause.deadline ? Math.ceil((new Date(cause.deadline) - new Date()) / 86400000) : null;

  return (
    <div className="container section campaign-detail">
      <div className="campaign-detail-grid">
        <div>
          <img src={imageUrl(cause.image)} alt={cause.title} className="campaign-hero-image" />
          <div className="verified-note">🛡️ Verified by Just Helps</div>
        </div>
        <div className="campaign-summary">
          <span className="category-pill">{cause.category}</span>
          <h1>{cause.title}</h1>
          <p className="lead">{cause.subtitle}</p>
          <div className="progress-track big"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          <div className="money-row"><strong>₹{raised.toLocaleString()} raised</strong><span>of ₹{target.toLocaleString()}</span></div>
          {days !== null && <div className={days <= 3 ? 'deadline danger' : 'deadline'}>⏳ {days > 0 ? `${days} days remaining` : 'Deadline reached'}</div>}
          <Link to={`/donate/${cause._id}`} className="primary-link-button">Donate to this campaign</Link>
        </div>
      </div>
      <div className="story-card">
        <span className="eyebrow">THE STORY</span>
        <h2>Why this help matters</h2>
        <p style={{ whiteSpace:'pre-wrap' }}>{cause.description}</p>
      </div>
      <div className="verification-card">
        <strong>What verified means</strong>
        <p>The campaign creator submitted information and supporting documents for review. Only approved campaigns are shown publicly.</p>
      </div>
    </div>
  );
}
