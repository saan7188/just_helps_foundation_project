import { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';

const tokenConfig = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [causes, setCauses] = useState([]);
  const [donations, setDonations] = useState([]);
  const [site, setSite] = useState({ heroTitle: '', heroSubtitle: '', maintenanceMode: false, announcement: '' });
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const review = async (cause, status) => {
    if ((status === 'rejected' || status === 'more_info') && !note.trim()) {
      alert('Add a review note before taking this action.');
      return;
    }

    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/causes/${cause._id}`, {
        status,
        isVerified: status === 'approved',
        verificationNote: note.trim()
      }, tokenConfig());

      setSelected(null);
      setNote('');
      await load();
    } catch (err) {
      alert(err.response?.data?.msg || 'Unable to update campaign');
    } finally {
      setSaving(false);
    }
  };

  const removeFromPublic = async cause => {
    const confirmed = window.confirm(
      `Remove “${cause.title}” from the public campaigns page? The campaign record will be kept in the admin system.`
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/causes/${cause._id}`, {
        status: 'paused',
        isVerified: false,
        verificationNote: 'Removed from public campaigns by admin.'
      }, tokenConfig());
      await load();
    } catch (err) {
      alert(err.response?.data?.msg || 'Unable to remove campaign');
    } finally {
      setSaving(false);
    }
  };

  const updateCampaign = async event => {
    event.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('title', editing.title.trim());
      data.append('subtitle', editing.subtitle.trim());
      data.append('description', editing.description.trim());
      data.append('category', editing.category.trim() || 'General');
      data.append('target', String(Number(editing.target)));
      data.append('deadline', editing.deadline);
      if (editing.imageFile) data.append('image', editing.imageFile);

      await axios.put(
        `${API_URL}/api/causes/${editing._id}`,
        data,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );

      setEditing(null);
      await load();
    } catch (err) {
      alert(err.response?.data?.msg || 'Unable to update campaign');
    } finally {
      setSaving(false);
    }
  };

  const openProof = async (causeId, index) => {
    try {
      const response = await axios.get(`${API_URL}/api/causes/${causeId}/proof/${index}`, {
        ...tokenConfig(),
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noreferrer';
      anchor.download = `just-helps-proof-${index + 1}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert(err.response?.data?.msg || 'Unable to open the proof document.');
    }
  };

  const saveSite = async event => {
    event.preventDefault();
    try {
      await axios.put(`${API_URL}/api/site`, site, tokenConfig());
      alert('Site settings updated.');
    } catch (err) {
      alert(err.response?.data?.msg || 'Unable to save site settings.');
    }
  };

  const pending = causes.filter(c => ['pending', 'more_info'].includes(c.status || (!c.isVerified ? 'pending' : 'approved')));
  const active = causes.filter(c => c.status === 'approved' || (!c.status && c.isVerified));
  const total = donations
    .filter(d => d.paymentStatus !== 'cancelled')
    .reduce((sum, d) => sum + Number(d.totalPaid || 0), 0);

  if (loading) return <div className="empty-state">Loading admin dashboard…</div>;

  return (
    <div className="admin-page">
      <div className="container section">
        <div className="admin-header">
          <div>
            <span className="eyebrow">JUST HELPS ADMIN</span>
            <h1>One place to run the foundation.</h1>
            <p className="admin-header-copy">Review new requests, manage published campaigns and keep the public experience current.</p>
          </div>
          <span className="admin-badge">Private admin</span>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          {['overview', 'requests', 'campaigns', 'transactions', 'settings'].map(item => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? 'admin-tab active' : 'admin-tab'}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div className="stats-grid">
              <Stat label="Waiting for review" value={pending.length} accent="orange" />
              <Stat label="Published campaigns" value={active.length} accent="green" />
              <Stat label="Successful donations" value={donations.filter(d => d.paymentStatus === 'success').length} accent="blue" />
              <Stat label="Recorded value" value={`₹${total.toLocaleString()}`} accent="dark" />
            </div>

            <div className="admin-workflow-card">
              <div>
                <span className="eyebrow">WORKFLOW</span>
                <h2>Review → publish → manage</h2>
                <p>New campaigns enter the review queue. Once approved, they appear publicly and move into the campaign management view.</p>
              </div>
              <div className="workflow-steps">
                <span><b>01</b> Review proof</span>
                <span><b>02</b> Approve & publish</span>
                <span><b>03</b> Update or remove</span>
              </div>
            </div>
          </>
        )}

        {tab === 'requests' && (
          <section>
            <div className="admin-section-title"><h2>Campaign requests</h2><span>{pending.length} waiting</span></div>
            <div className="admin-list">
              {pending.map(cause => (
                <CampaignRow
                  key={cause._id}
                  cause={cause}
                  actionLabel="Review"
                  onAction={() => { setSelected(cause); setNote(cause.verificationNote || ''); }}
                />
              ))}
            </div>
            {!pending.length && <div className="empty-state">No campaign requests waiting for review.</div>}
          </section>
        )}

        {tab === 'campaigns' && (
          <section>
            <div className="admin-section-title">
              <div>
                <h2>Published campaigns</h2>
                <p>Only live campaigns appear here. Each one has two management actions: update or remove from public view.</p>
              </div>
              <span>{active.length} live</span>
            </div>

            <div className="admin-list">
              {active.map(cause => (
                <CampaignRow
                  key={cause._id}
                  cause={cause}
                  published
                  onUpdate={() => setEditing({
                    ...cause,
                    deadline: cause.deadline ? new Date(cause.deadline).toISOString().slice(0, 10) : '',
                    imageFile: null
                  })}
                  onRemove={() => removeFromPublic(cause)}
                  disabled={saving}
                />
              ))}
            </div>

            {!active.length && <div className="empty-state">No published campaigns right now.</div>}
          </section>
        )}

        {tab === 'transactions' && (
          <section>
            <div className="admin-section-title"><h2>Transactions</h2><span>{donations.length} records</span></div>
            <div className="transaction-table">
              <table>
                <thead><tr><th>Date</th><th>Transaction</th><th>Campaign</th><th>Donor</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d._id}>
                      <td>{new Date(d.date).toLocaleString()}</td>
                      <td>{d.transactionId}</td>
                      <td>{d.causeTitle}</td>
                      <td>{d.isAnonymous ? 'Anonymous' : d.donorEmail}</td>
                      <td>₹{Number(d.totalPaid).toLocaleString()}</td>
                      <td><span className={`status-pill ${d.paymentStatus === 'success' ? 'status-approved' : d.paymentStatus === 'cancelled' ? 'status-pending' : 'status-rejected'}`}>{d.paymentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'settings' && (
          <form className="form-card" onSubmit={saveSite}>
            <h2>Site settings</h2>
            <label>Hero title<input className="form-input" value={site.heroTitle || ''} onChange={e => setSite({ ...site, heroTitle: e.target.value })} /></label>
            <label>Hero subtitle<textarea className="form-input" rows="3" value={site.heroSubtitle || ''} onChange={e => setSite({ ...site, heroSubtitle: e.target.value })} /></label>
            <label>Announcement<textarea className="form-input" rows="3" value={site.announcement || ''} onChange={e => setSite({ ...site, announcement: e.target.value })} /></label>
            <label className="checkbox-row"><input type="checkbox" checked={Boolean(site.maintenanceMode)} onChange={e => setSite({ ...site, maintenanceMode: e.target.checked })} /> Maintenance mode</label>
            <button className="primary-button">Save settings</button>
          </form>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" role="presentation">
          <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="campaign-review-title">
            <button type="button" className="modal-close" aria-label="Close campaign review" onClick={() => setSelected(null)}>×</button>
            <span className="eyebrow">CAMPAIGN REVIEW</span>
            <h2 id="campaign-review-title">{selected.title}</h2>
            <p>{selected.description}</p>
            <div className="review-facts">
              <span>Category: {selected.category}</span>
              <span>Goal: ₹{Number(selected.target).toLocaleString()}</span>
              <span>Deadline: {selected.deadline ? new Date(selected.deadline).toLocaleDateString() : '—'}</span>
              <span>Creator: {selected.createdBy?.email || '—'}</span>
            </div>
            <h3>Verification documents</h3>
            <div className="proof-list">
              {(selected.proofFiles || []).map((file, index) => (
                <button
                  key={file}
                  type="button"
                  className="proof-link"
                  onClick={() => openProof(selected._id, index)}
                >
                  Proof document {index + 1} ↗
                </button>
              ))}
              {!selected.proofFiles?.length && <span className="muted-note">No proof documents attached.</span>}
            </div>
            <label>Review note<textarea className="form-input" rows="3" value={note} onChange={e => setNote(e.target.value)} placeholder="Required when asking for more information or rejecting." /></label>
            <div className="review-actions">
              <button type="button" className="approve-button" disabled={saving} onClick={() => review(selected, 'approved')}>Approve & publish</button>
              <button type="button" className="more-button" disabled={saving} onClick={() => review(selected, 'more_info')}>Request more info</button>
              <button type="button" className="reject-button" disabled={saving} onClick={() => review(selected, 'rejected')}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-backdrop" role="presentation">
          <form className="review-modal edit-campaign-modal" role="dialog" aria-modal="true" aria-labelledby="campaign-edit-title" onSubmit={updateCampaign}>
            <button type="button" className="modal-close" aria-label="Close campaign editor" onClick={() => setEditing(null)}>×</button>
            <span className="eyebrow">PUBLISHED CAMPAIGN</span>
            <h2 id="campaign-edit-title">Update campaign</h2>
            <p>Text, goal, deadline and the campaign image can be updated while the campaign remains published.</p>

            <label>Title<input className="form-input" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} required /></label>
            <label>Subtitle<input className="form-input" value={editing.subtitle || ''} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} required /></label>
            <label>Category<input className="form-input" value={editing.category || ''} onChange={e => setEditing({ ...editing, category: e.target.value })} /></label>
            <label>Goal amount<input className="form-input" type="number" min="1" value={editing.target || ''} onChange={e => setEditing({ ...editing, target: e.target.value })} required /></label>
            <label>Deadline<input className="form-input" type="date" value={editing.deadline || ''} onChange={e => setEditing({ ...editing, deadline: e.target.value })} required /></label>
            <label>Campaign image<input className="form-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setEditing({ ...editing, imageFile: e.target.files?.[0] || null })} /><small className="field-help">Optional replacement · JPG, PNG or WebP · up to 10 MB</small></label>
            <label>Story<textarea className="form-input" rows="7" value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} required /></label>

            <div className="review-actions">
              <button type="submit" className="approve-button" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              <button type="button" className="text-button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return <div className={`stat-card ${accent}`}><span>{label}</span><strong>{value}</strong></div>;
}

function CampaignRow({ cause, actionLabel, onAction, published, onUpdate, onRemove, disabled }) {
  const status = cause.status || (cause.isVerified ? 'approved' : 'pending');

  return (
    <article className="admin-row">
      <div className="admin-row-main">
        <span className={`status-pill ${published ? 'status-approved' : 'status-pending'}`}>{status}</span>
        <h3>{cause.title}</h3>
        <p>{cause.subtitle}</p>
        {published && <small>₹{Number(cause.collected || 0).toLocaleString()} raised of ₹{Number(cause.target || 0).toLocaleString()} · {cause.category}</small>}
      </div>

      {published ? (
        <div className="admin-row-actions">
          <button type="button" className="secondary-button" onClick={onUpdate} disabled={disabled}>Update</button>
          <button type="button" className="danger-outline-button" onClick={onRemove} disabled={disabled}>Remove</button>
        </div>
      ) : (
        <div className="admin-row-meta">
          <strong>₹{Number(cause.target || 0).toLocaleString()} goal</strong>
          <button type="button" className="secondary-button" onClick={onAction}>{actionLabel || 'Review'}</button>
        </div>
      )}
    </article>
  );
}
