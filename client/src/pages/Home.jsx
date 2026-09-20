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
    <article className="campaign-card">
      <img src={imageUrl(cause.image)} alt="" loading="lazy" />
      <div className="campaign-card-body">
        <div className="campaign-card-meta">
          <span className="category-pill">{cause.category}</span>
          {daysLeft !== null && <span className={daysLeft <= 3 ? 'days-left danger-text' : 'days-left'}>{daysLeft > 0 ? `${daysLeft} days left` : 'Ending soon'}</span>}
        </div>
        <h3>{cause.title}</h3>
        <p>{cause.subtitle}</p>
        <div className="campaign-card-progress">
          <div className="campaign-card-money"><span>₹{raised.toLocaleString()} raised</span><span>₹{target.toLocaleString()} goal</span></div>
          <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/causes`),
      axios.get(`${API_URL}/api/causes/urgent`)
    ]).then(([all, urgentRes]) => {
      setCauses(all.data || []);
      setUrgent(urgentRes.data || null);
    }).catch(err => {
      console.error(err);
      setLoadError(true);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero hero-visual container">
        <div className="hero-visual-image">
          <img
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1600&q=90"
            alt="People supporting one another in a community"
            fetchPriority="high"
          />
          <div className="hero-photo-badge"><strong>Real needs.</strong><span>Human stories.</span></div>
        </div>

        <div className="hero-visual-copy">
          <span className="eyebrow">JUST HELPS FOUNDATION</span>
          <h1>{config?.heroTitle || 'Small Acts. Massive Impact.'}</h1>
          <p>{config?.heroSubtitle || 'A simple way to find a genuine need and make a meaningful difference.'}</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate('/causes')}>Explore causes</button>
            <button className="secondary-button" onClick={() => navigate('/donate?category=Food')}>Donate now</button>
          </div>
          <div className="trust-strip trust-left" aria-label="Platform principles">
            <span>✓ Verified campaigns</span>
            <span>✓ Secure access</span>
            <span>✓ Digital receipts</span>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div><span className="eyebrow">FIND YOUR WAY TO HELP</span><h2>What would you like to support?</h2></div>
          <Link to="/causes">See all causes →</Link>
        </div>
        <div className="category-grid">
          {categories.map(category => (
            <Link key={category.name} to={`/causes?category=${encodeURIComponent(category.name)}`} className="category-card">
              <span className="category-icon" aria-hidden="true">{category.icon}</span>
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
              <span>Deadline approaching</span>
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
        {loading ? <div className="empty-state" aria-live="polite">Loading verified campaigns…</div> :
          loadError ? <div className="empty-state"><h2>Campaigns are temporarily unavailable</h2><p>Please try again in a moment.</p></div> :
          causes.length ? <div className="campaign-grid">{causes.slice(0, 6).map(cause => <CampaignCard key={cause._id} cause={cause} />)}</div> :
          <div className="empty-state"><h2>No active campaigns right now</h2><p>Please check back soon.</p></div>}
      </section>

      <section className="container section">
        <div className="section-heading">
          <div><span className="eyebrow">HOW JUST HELPS WORKS</span><h2>Simple for donors. Careful for campaigns.</h2></div>
        </div>
        <div className="principles-grid">
          <article className="principle-card"><span>01</span><h3>Find a real need</h3><p>Browse campaigns by category, urgency and clear fundraising goals.</p></article>
          <article className="principle-card"><span>02</span><h3>See what was verified</h3><p>Campaigns are reviewed with supporting information before they become public.</p></article>
          <article className="principle-card"><span>03</span><h3>Make a clear contribution</h3><p>Choose a campaign, select an amount and receive a transparent demo receipt.</p></article>
        </div>
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
