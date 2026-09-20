import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const categories = [
  { name: 'Food', icon: '🍚', text: 'Meals and essential food support' },
  { name: 'Healthcare', icon: '🏥', text: 'Medical and treatment needs' },
  { name: 'Education', icon: '📚', text: 'School and learning support' },
  { name: 'Shelter', icon: '🏠', text: 'Safe places and basic needs' },
  { name: 'Girl Child', icon: '💗', text: 'Essential needs for girls' },
  { name: 'Emergency', icon: '🆘', text: 'Time-sensitive situations' }
];

const imageUrl = image => image?.startsWith('http') ? image : `${API_URL}${image || ''}`;

function CampaignCard({ cause }) {
  const raised = Number(cause.collected || 0);
  const target = Number(cause.target || 1);
  const percent = Math.min((raised / target) * 100, 100);
  const daysLeft = cause.deadline ? Math.ceil((new Date(cause.deadline) - new Date()) / 86400000) : null;

  return (
    <article className="glass-card" style={{ overflow: 'hidden', background: '#fff' }}>
      <img src={imageUrl(cause.image)} alt={cause.title} style={{ width: '100%', height: 190, objectFit: 'cover' }} />
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <span className="category-pill">{cause.category}</span>
          {daysLeft !== null && <span style={{ color: daysLeft <= 3 ? '#B91C1C' : '#6B7280', fontSize: 13, fontWeight: 700 }}>⏳ {daysLeft > 0 ? `${daysLeft} days left` : 'Ending soon'}</span>}
        </div>
        <h3 style={{ margin: '12px 0 7px', fontSize: 20 }}>{cause.title}</h3>
        <p style={{ color: '#6B7280', minHeight: 44 }}>{cause.subtitle}</p>
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
            <span>₹{raised.toLocaleString()} raised</span>
            <span>₹{target.toLocaleString()} goal</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
        </div>
        <Link className="primary-link-button" to={`/campaign/${cause._id}`}>View campaign</Link>
      </div>
    </article>
  );
}

export default function Home({ config }) {
  const navigate = useNavigate();
  const [causes, setCauses] = useState([]);
  const [urgent, setUrgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/causes`),
      axios.get(`${API_URL}/api/causes/urgent`)
    ]).then(([all, urgentRes]) => {
      setCauses(all.data || []);
      setUrgent(urgentRes.data || null);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categoriesToShow = categories;

  return (
    <div>
      <section className="hero container">
        <span className="eyebrow">JUST HELPS FOUNDATION</span>
        <h1>{config?.heroTitle || 'Small Acts. Massive Impact.'}</h1>
        <p>{config?.heroSubtitle || 'A simple way to find a genuine need and make a meaningful difference.'}</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => navigate('/causes')}>Explore causes</button>
          <button className="secondary-button" onClick={() => navigate('/donate?category=Food')}>Donate to food support</button>
        </div>
        <div className="trust-strip">
          <span>🛡️ Verified campaigns</span>
          <span>🔐 Secure account access</span>
          <span>📧 Email receipts</span>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div><span className="eyebrow">FIND YOUR WAY TO HELP</span><h2>What would you like to support?</h2></div>
          <Link to="/causes">See all causes →</Link>
        </div>
        <div className="category-grid">
          {categoriesToShow.map(category => (
            <Link key={category.name} to={`/causes?category=${encodeURIComponent(category.name)}`} className="category-card">
              <span className="category-icon">{category.icon}</span>
              <strong>{category.name}</strong>
              <small>{category.text}</small>
            </Link>
          ))}
        </div>
      </section>

      {urgent && (
        <section className="container section">
          <div className="urgent-banner">
            <div>
              <span className="eyebrow urgent-eyebrow">NEEDS ATTENTION NOW</span>
              <h2>{urgent.title}</h2>
              <p>{urgent.subtitle}</p>
              <Link to={`/campaign/${urgent._id}`} className="primary-link-button">See the urgent need</Link>
            </div>
            <div className="urgent-meta">
              <span>🔴 Deadline approaching</span>
              <strong>₹{Number(urgent.collected || 0).toLocaleString()} raised</strong>
              <small>of ₹{Number(urgent.target || 0).toLocaleString()}</small>
            </div>
          </div>
        </section>
      )}

      <section className="container section">
        <div className="section-heading">
          <div><span className="eyebrow">VERIFIED NEEDS</span><h2>People are asking for help</h2></div>
          <Link to="/causes">Explore all →</Link>
        </div>
        {loading ? <div className="empty-state">Loading verified campaigns…</div> :
          causes.length ? <div className="campaign-grid">{causes.slice(0, 6).map(cause => <CampaignCard key={cause._id} cause={cause} />)}</div> :
          <div className="empty-state">There are no active campaigns right now. Please check back soon.</div>}
      </section>

      <section className="container section">
        <div className="start-card">
          <div>
            <span className="eyebrow">NEED HELP?</span>
            <h2>Start a fundraiser with Just Helps.</h2>
            <p>Register, tell us what happened, provide supporting proof, and submit your campaign for verification.</p>
          </div>
          <Link to="/register" className="primary-link-button">Start a fundraiser</Link>
        </div>
      </section>
    </div>
  );
}
