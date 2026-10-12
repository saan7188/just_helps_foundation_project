import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const categories = [
  { name: 'Food', amount: 20, title: 'A meal for someone', text: 'Help someone get their next meal.', art: 'food' },
  { name: 'Education', amount: 50, title: 'A step towards learning', text: 'Support books and school essentials.', art: 'education' },
  { name: 'Girl Child', amount: 50, title: 'Essentials for a girl child', text: 'Help provide everyday essentials.', art: 'girl' },
  { name: 'Emergency', amount: 100, title: 'Help when it cannot wait', text: 'Contribute towards urgent needs.', art: 'emergency' },
  { name: 'Elderly Medicines', amount: 100, category: 'Healthcare', title: 'Medicines for older people', text: 'Help an older person access essential medicines.', art: 'medicine' },
  { name: 'Shelter', amount: 100, title: 'A safer place to rest', text: 'Support basic shelter and essentials.', art: 'shelter' }
];

const imageUrl = image => image?.startsWith('http') ? image : `${API_URL}${image || ''}`;

function CauseArt({ type }) {
  const paths = {
    food: <><path d="M4 11h16l-2 9H6l-2-9Z" /><path d="M7 8c0-2 2-2 2-4M12 8c0-2 2-2 2-4M17 8c0-2 2-2 2-4" /></>,
    education: <><path d="m3 8 9-5 9 5-9 5-9-5Z" /><path d="M7 11v5c3 3 7 3 10 0v-5M21 8v7" /></>,
    girl: <><circle cx="12" cy="7" r="3" /><path d="M6 21v-2a6 6 0 0 1 12 0v2M4 11l2 2 3-3M17 10l3 3" /></>,
    emergency: <><path d="M12 3 22 20H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
    medicine: <><path d="M10 3h4M12 3v7M7 10h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z" /><path d="M9 15h6M12 12v6" /></>,
    shelter: <><path d="m3 11 9-8 9 8v9h-6v-6H9v6H3v-9Z" /></>
  };
  return <svg className="cause-art-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

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

export default function Home() {
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
    <div className="home-page">
      <section className="hero hero-visual container">
        <div className="hero-visual-image">
          <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1600&q=90" alt="People supporting one another in a community" fetchPriority="high" />
          <div className="hero-photo-badge"><strong>One act of kindness.</strong><span>A ripple of hope.</span></div>
        </div>
        <div className="hero-visual-copy">
          <h1><span className="brand-just">Just</span> <span className="brand-helps">Helps</span><span className="hero-title-period">.</span></h1>
          <p><span className="text-accent">Even ₹1</span> can help someone take the next step.</p>
          <div className="hero-actions">
            <button className="primary-button donate-one-rupee" onClick={() => navigate('/donate?category=General&amount=1')}>Donate ₹1</button>
            <button className="secondary-button" onClick={() => navigate('/causes')}>Explore needs</button>
          </div>
        </div>
      </section>

      <section className="container section needs-section">
        <div className="section-heading">
          <div><h2>Choose where you can <span className="text-accent">help</span></h2><p>Start with a small amount. Make it count.</p></div>
        </div>
        <div className="category-grid">
          {categories.map(item => (
            <Link key={item.name} to={`/donate?category=${encodeURIComponent(item.category || item.name)}&amount=${item.amount}`} className="category-card cause-choice-card">
              <span className="cause-art"><CauseArt type={item.art} /></span>
              <strong>{item.name}</strong>
              <span className="cause-choice-title">{item.title}</span>
              <small>{item.text}</small>
              <span className="cause-amount">Give ₹{item.amount}</span>
            </Link>
          ))}
        </div>
      </section>

      {urgent && (
        <section className="container section">
          <div className="urgent-banner">
            <div><h2>{urgent.title}</h2><p>{urgent.subtitle}</p><Link to={`/campaign/${urgent._id}`} className="primary-link-button">Help with this need</Link></div>
            <div className="urgent-meta"><strong>₹{Number(urgent.collected || 0).toLocaleString()} raised</strong><small>of ₹{Number(urgent.target || 0).toLocaleString()}</small></div>
          </div>
        </section>
      )}

      <section className="container section">
        <div className="section-heading"><div><h2>Needs people are <span className="text-accent">sharing</span></h2><p>Choose a campaign and read its details before contributing.</p></div><Link to="/causes">All campaigns</Link></div>
        {loading ? <div className="empty-state" aria-live="polite">Loading campaigns…</div> :
          loadError ? <div className="empty-state"><h2>Campaigns are temporarily unavailable</h2><p>Please try again in a moment.</p></div> :
          causes.length ? <div className="campaign-grid">{causes.slice(0, 6).map(cause => <CampaignCard key={cause._id} cause={cause} />)}</div> :
          <div className="empty-state"><h2>No active campaigns right now</h2><p>Please check back soon.</p></div>}
      </section>

      <section className="container section">
        <div className="start-card"><div><h2>Need help for yourself or someone else?</h2><p>Share the details and submit a fundraiser for review.</p></div><Link to="/register" className="primary-link-button">Start a fundraiser</Link></div>
      </section>
    </div>
  );
}
