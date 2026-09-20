import { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';

const tokenConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [causes, setCauses] = useState([]);
  const [donations, setDonations] = useState([]);
  const [site, setSite] = useState({ heroTitle:'', heroSubtitle:'', maintenanceMode:false, announcement:'' });
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [c, d, s] = await Promise.all([
        axios.get(`${API_URL}/api/causes/admin/all`, tokenConfig()),
        axios.get(`${API_URL}/api/payment/all`, tokenConfig()),
        axios.get(`${API_URL}/api/site`)
      ]);
      setCauses(c.data || []);
      setDonations(d.data || []);
      setSite(s.data || site);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const review = async (cause, status) => {
    try {
      await axios.put(`${API_URL}/api/causes/${cause._id}`, {
        status,
        isVerified: status === 'approved',
        verificationNote: note.trim()
      }, tokenConfig());
      setSelected(null); setNote(''); await load();
    } catch (err) { alert(err.response?.data?.msg || 'Unable to update campaign'); }
  };

  const saveSite = async e => {
    e.preventDefault();
    await axios.put(`${API_URL}/api/site`, site, tokenConfig());
    alert('Site settings updated.');
  };

  const pending = causes.filter(c => ['pending','more_info'].includes(c.status || (!c.isVerified ? 'pending' : 'approved')));
  const active = causes.filter(c => c.status === 'approved' || (!c.status && c.isVerified));
  const total = donations.filter(d => d.paymentStatus !== 'cancelled').reduce((sum, d) => sum + Number(d.totalPaid || 0), 0);

  if (loading) return <div className="empty-state">Loading admin dashboard…</div>;

  return (
    <div className="admin-page">
      <div className="container section">
        <div className="admin-header"><div><span className="eyebrow">JUST HELPS ADMIN</span><h1>Trust, campaigns and transactions.</h1></div><span className="admin-badge">Admin only</span></div>

        <div className="admin-tabs">{['overview','requests','campaigns','transactions','settings'].map(item => <button key={item} className={tab===item?'admin-tab active':'admin-tab'} onClick={() => setTab(item)}>{item}</button>)}</div>

        {tab === 'overview' && <div className="stats-grid">
          <Stat label="Pending requests" value={pending.length} accent="orange" />
          <Stat label="Live campaigns" value={active.length} accent="green" />
          <Stat label="Successful donations" value={donations.filter(d => d.paymentStatus === 'success').length} accent="blue" />
          <Stat label="Recorded value" value={`₹${total.toLocaleString()}`} accent="dark" />
        </div>}

        {tab === 'requests' && <section>
          <div className="admin-section-title"><h2>Campaign requests</h2><span>{pending.length} waiting</span></div>
          <div className="admin-list">{pending.map(cause => <CampaignRow key={cause._id} cause={cause} onReview={() => {setSelected(cause);setNote(cause.verificationNote || '')}} />)}</div>
          {!pending.length && <div className="empty-state">No campaign requests waiting for review.</div>}
        </section>}

        {tab === 'campaigns' && <section>
          <div className="admin-section-title"><h2>Campaign status</h2><span>{active.length} live</span></div>
          <div className="admin-list">{causes.map(cause => <CampaignRow key={cause._id} cause={cause} onReview={() => {setSelected(cause);setNote(cause.verificationNote || '')}} />)}</div>
        </section>}

        {tab === 'transactions' && <section>
          <div className="admin-section-title"><h2>Transactions</h2><span>{donations.length} records</span></div>
          <div className="transaction-table"><table><thead><tr><th>Date</th><th>Transaction</th><th>Campaign</th><th>Donor</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            {donations.map(d => <tr key={d._id}><td>{new Date(d.date).toLocaleString()}</td><td>{d.transactionId}</td><td>{d.causeTitle}</td><td>{d.isAnonymous ? 'Anonymous' : d.donorEmail}</td><td>₹{Number(d.totalPaid).toLocaleString()}</td><td><span className={`status-pill ${d.paymentStatus==='success'?'status-approved':d.paymentStatus==='cancelled'?'status-pending':'status-rejected'}`}>{d.paymentStatus}</span></td></tr>)}
          </tbody></table></div>
        </section>}

        {tab === 'settings' && <form className="form-card" onSubmit={saveSite}>
          <h2>Site settings</h2>
          <label>Hero title<input className="form-input" value={site.heroTitle || ''} onChange={e=>setSite({...site,heroTitle:e.target.value})} /></label>
          <label>Hero subtitle<textarea className="form-input" rows="3" value={site.heroSubtitle || ''} onChange={e=>setSite({...site,heroSubtitle:e.target.value})} /></label>
          <label>Announcement<textarea className="form-input" rows="3" value={site.announcement || ''} onChange={e=>setSite({...site,announcement:e.target.value})} /></label>
          <label className="checkbox-row"><input type="checkbox" checked={Boolean(site.maintenanceMode)} onChange={e=>setSite({...site,maintenanceMode:e.target.checked})}/> Maintenance mode</label>
          <button className="primary-button">Save settings</button>
        </form>}
      </div>

      {selected && <div className="modal-backdrop"><div className="review-modal">
        <button className="modal-close" onClick={()=>setSelected(null)}>×</button>
        <span className="eyebrow">CAMPAIGN REVIEW</span><h2>{selected.title}</h2>
        <p>{selected.description}</p>
        <div className="review-facts"><span>Category: {selected.category}</span><span>Goal: ₹{Number(selected.target).toLocaleString()}</span><span>Deadline: {selected.deadline ? new Date(selected.deadline).toLocaleDateString() : '—'}</span><span>Creator: {selected.createdBy?.email || '—'}</span></div>
        <h3>Verification documents</h3>
        <div className="proof-list">{(selected.proofFiles || []).map((file,i)=><a key={file} href={file.startsWith('http')?file:`${API_URL}${file}`} target="_blank" rel="noreferrer">Proof document {i+1} ↗</a>)}</div>
        <label>Review note<textarea className="form-input" rows="3" value={note} onChange={e=>setNote(e.target.value)} placeholder="Required when asking for more information or rejecting." /></label>
        <div className="review-actions"><button className="approve-button" onClick={()=>review(selected,'approved')}>Approve & publish</button><button className="more-button" onClick={()=>review(selected,'more_info')}>Request more info</button><button className="reject-button" onClick={()=>review(selected,'rejected')}>Reject</button></div>
      </div></div>}
    </div>
  );
}

function Stat({label,value,accent}) {
  return <div className={`stat-card ${accent}`}><span>{label}</span><strong>{value}</strong></div>;
}
function CampaignRow({cause,onReview}) {
  const status = cause.status || (cause.isVerified ? 'approved' : 'pending');
  return <article className="admin-row"><div><span className="status-pill status-pending">{status}</span><h3>{cause.title}</h3><p>{cause.subtitle}</p></div><div className="admin-row-meta"><strong>₹{Number(cause.collected||0).toLocaleString()} / ₹{Number(cause.target||0).toLocaleString()}</strong><button className="secondary-button" onClick={onReview}>Review</button></div></article>;
}
