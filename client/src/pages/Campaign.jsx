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
    axios.get(`${API_URL}/api/causes/${id}`)
      .then(res => setCause(res.data))
      .catch(() => setCause(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="empty-state">Loading campaign…</div>;
  if (!cause) return <div className="empty-state"><h2>Campaign not found</h2><Link to="/causes">Back to causes</Link></div>;

  const raised = Number(cause.collected || 0);
  const target = Number(cause.target || 1);
  const pct = Math.min((raised / target) * 100, 100);
  const remaining = Math.max(target - raised, 0);
  const days = cause.deadline ? Math.ceil((new Date(cause.deadline) - new Date()) / 86400000) : null;
  const goalReached = remaining === 0;

  return (
    <div className="container section campaign-detail">
      <div className="campaign-detail-grid">
        <div>
          <img src={imageUrl(cause.image)} alt={cause.title} className="campaign-hero-image" />
          <div className="verified-note" aria-label="Campaign verified by Just Helps">✓ Verified campaign</div>
        </div>

        <div className="campaign-summary">
          <span className="category-pill">{cause.category}</span>
          <h1>{cause.title}</h1>
          <p className="lead">{cause.subtitle}</p>

          <div className="campaign-progress-summary">
            <div className="money-row">
              <strong>₹{raised.toLocaleString()} raised</strong>
              <span>of ₹{target.toLocaleString()}</span>
            </div>
            <div className="progress-track big" aria-label={`${Math.round(pct)} percent of goal raised`}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <small className="progress-caption">
              {goalReached ? 'Goal reached' : `₹${remaining.toLocaleString()} still needed`}
            </small>
          </div>

          {days !== null && (
            <div className={days <= 3 ? 'deadline danger' : 'deadline'}>
              ⏳ {days > 0 ? `${days} days remaining` : 'Deadline reached'}
            </div>
          )}

          {goalReached ? (
            <div className="goal-reached">This campaign has reached its recorded goal.</div>
          ) : (
            <Link to={`/donate/${cause._id}`} className="primary-link-button full-width-action">Donate to this campaign</Link>
          )}
        </div>
      </div>

      <div className="story-card">
        <span className="eyebrow">THE STORY</span>
        <h2>Why this help matters</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{cause.description}</p>
      </div>

      <div className="verification-card">
        <strong>What verified means</strong>
        <p>The campaign creator submitted information and supporting documents for review. Just Helps reviews the submitted information before a campaign is published.</p>
        {cause.verificationNote && <p className="verification-note-detail"><strong>Review note:</strong> {cause.verificationNote}</p>}
      </div>
    </div>
  );
}
