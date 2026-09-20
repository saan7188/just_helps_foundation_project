import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const imageUrl = image => image?.startsWith('http') ? image : `${API_URL}${image || ''}`;
const categories = ['All', 'Food', 'Healthcare', 'Education', 'Shelter', 'Girl Child', 'Emergency'];

export default function Causes() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('category') || 'All';
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = selected === 'All' ? `${API_URL}/api/causes` : `${API_URL}/api/causes?category=${encodeURIComponent(selected)}`;
    axios.get(url)
      .then(res => setCauses(res.data || []))
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="container section">
      <div className="page-intro">
        <span className="eyebrow">EXPLORE</span>
        <h1>Find a cause that matters to you.</h1>
        <p>Browse verified campaigns or choose a category for a general donation.</p>
      </div>

      <div className="filter-row" aria-label="Cause categories">
        {categories.map(category => (
          <button
            key={category}
            type="button"
            aria-pressed={selected === category}
            className={selected === category ? 'filter-active' : 'filter-button'}
            onClick={() => setParams(category === 'All' ? {} : { category })}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="general-donation-card">
        <div>
          <strong>{selected === 'All' ? 'General support' : `${selected} support`}</strong>
          <p>Prefer not to choose one campaign? Make a general contribution to this category.</p>
        </div>
        <Link to={`/donate?category=${encodeURIComponent(selected === 'All' ? 'General' : selected)}`} className="primary-link-button">Donate any amount</Link>
      </div>

      {loading ? <div className="empty-state">Loading campaigns…</div> :
        error ? <div className="empty-state"><h2>Campaigns are temporarily unavailable</h2><p>Please try again in a moment.</p></div> :
        causes.length ? <div className="campaign-grid">{causes.map(cause => {
          const pct = Math.min((Number(cause.collected || 0) / Number(cause.target || 1)) * 100, 100);
          return (
            <article key={cause._id} className="campaign-card">
              <img src={imageUrl(cause.image)} alt="" loading="lazy" />
              <div className="campaign-card-body">
                <span className="category-pill">{cause.category}</span>
                <h2>{cause.title}</h2>
                <p>{cause.subtitle}</p>
                <div className="campaign-card-progress">
                  <div className="campaign-card-money"><span>₹{Number(cause.collected || 0).toLocaleString()} raised</span><span>₹{Number(cause.target || 0).toLocaleString()} goal</span></div>
                  <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                </div>
                <Link to={`/campaign/${cause._id}`} className="primary-link-button">View campaign</Link>
              </div>
            </article>
          );
        })}</div> :
        <div className="empty-state"><h2>No verified campaigns in this category right now.</h2><p>Try another category or make a general contribution.</p></div>}
    </div>
  );
}
