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

  useEffect(() => {
    const url = selected === 'All' ? `${API_URL}/api/causes` : `${API_URL}/api/causes?category=${encodeURIComponent(selected)}`;
    axios.get(url).then(res => setCauses(res.data || [])).catch(console.error).finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="container section">
      <div className="page-intro">
        <span className="eyebrow">EXPLORE</span>
        <h1>Find a cause that matters to you.</h1>
        <p>Browse verified campaigns or choose a category for a general donation.</p>
      </div>
      <div className="filter-row">
        {categories.map(category => <button key={category} className={selected === category ? 'filter-active' : 'filter-button'} onClick={() => setParams(category === 'All' ? {} : { category })}>{category}</button>)}
      </div>
      <div className="general-donation-card">
        <div><strong>{selected === 'All' ? 'General support' : `${selected} support`}</strong><p>Prefer not to choose one campaign? Make a general contribution to this category.</p></div>
        <Link to={`/donate?category=${encodeURIComponent(selected === 'All' ? 'General' : selected)}`} className="primary-link-button">Donate any amount</Link>
      </div>
      {loading ? <div className="empty-state">Loading campaigns…</div> :
        causes.length ? <div className="campaign-grid">{causes.map(cause => {
          const pct = Math.min((Number(cause.collected || 0) / Number(cause.target || 1)) * 100, 100);
          return <article key={cause._id} className="glass-card" style={{ overflow: 'hidden', background: '#fff' }}>
            <img src={imageUrl(cause.image)} alt={cause.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            <div style={{ padding: 20 }}>
              <span className="category-pill">{cause.category}</span>
              <h3 style={{ margin: '12px 0 7px' }}>{cause.title}</h3>
              <p style={{ color: '#6B7280' }}>{cause.subtitle}</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:14 }}><strong>₹{Number(cause.collected || 0).toLocaleString()}</strong><span>₹{Number(cause.target || 0).toLocaleString()}</span></div>
              <Link to={`/campaign/${cause._id}`} className="primary-link-button">View campaign</Link>
            </div>
          </article>;
        })}</div> : <div className="empty-state">No verified campaigns in this category right now.</div>}
    </div>
  );
}
