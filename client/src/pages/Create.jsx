import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api';

const sample = {
  title: 'Help provide essential food support',
  subtitle: 'Support a family facing a sudden financial hardship.',
  category: 'Food',
  description: 'I am raising funds for essential food and household needs. The requested amount will be used only for the needs described here. I can provide supporting documents for verification.',
  amountNeeded: '25000'
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PROOF_SIZE = 10 * 1024 * 1024;
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const proofTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export default function Create() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...sample, title: '', subtitle: '', description: '', amountNeeded: '', deadline: '' });
  const [image, setImage] = useState(null);
  const [proof, setProof] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applySample = () => setForm(prev => ({ ...prev, ...sample }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.subtitle.trim() || !form.description.trim()) return setError('Complete the title, short summary and story.');
    if (Number(form.amountNeeded) <= 0) return setError('Enter a valid target amount.');
    if (!form.deadline || new Date(form.deadline) <= new Date()) return setError('Choose a future deadline.');
    if (!image) return setError('Add a campaign image.');
    if (!proof.length) return setError('Add at least one supporting proof document.');
    if (image.size > MAX_IMAGE_SIZE || !imageTypes.includes(image.type)) return setError('Campaign image must be JPG, PNG or WebP up to 5 MB.');
    if (proof.some(file => file.size > MAX_PROOF_SIZE || !proofTypes.includes(file.type))) return setError('Each proof file must be PDF, JPG, PNG or WebP up to 10 MB.');

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key === 'amountNeeded' ? 'target' : key, value));
    data.append('image', image);
    proof.forEach(file => data.append('proof', file));

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/causes`, data, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to submit the fundraiser.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section create-page">
      <div className="page-intro">
        <span className="eyebrow">START A FUNDRAISER</span>
        <h1>Tell us what happened. We’ll help you tell the story.</h1>
        <p>Submit your campaign and supporting proof. The Just Helps team reviews it before it can appear publicly.</p>
      </div>

      <div className="process-strip">
        <span>1. Register</span><span>→</span><span>2. Submit proof</span><span>→</span><span>3. Review</span><span>→</span><span>4. Campaign goes live</span>
      </div>

      <div className="sample-card">
        <div><strong>In a hurry?</strong><p>Use this example as a starting point and replace the details with your real situation.</p></div>
        <button className="secondary-button" type="button" onClick={applySample}>Use food support example</button>
      </div>

      <form onSubmit={submit} className="form-card">
        {error && <div className="form-error">{error}</div>}
        <div className="form-grid">
          <label>Campaign name<input className="form-input" name="title" maxLength="120" value={form.title} onChange={e => setForm({ ...form, title:e.target.value })} placeholder="What do you need help with?" /></label>
          <label>Short summary<input className="form-input" name="subtitle" maxLength="200" value={form.subtitle} onChange={e => setForm({ ...form, subtitle:e.target.value })} placeholder="One clear sentence" /></label>
          <label>Cause<select className="form-input" value={form.category} onChange={e => setForm({ ...form, category:e.target.value })}><option>Food</option><option>Healthcare</option><option>Education</option><option>Shelter</option><option>Girl Child</option><option>Emergency</option><option>Other</option></select></label>
          <label>Amount needed (₹)<input className="form-input" type="number" min="1" value={form.amountNeeded} onChange={e => setForm({ ...form, amountNeeded:e.target.value })} /></label>
          <label>Deadline<input className="form-input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline:e.target.value })} /></label>
        </div>

        <label>Your story<textarea className="form-input" rows="8" maxLength="5000" value={form.description} onChange={e => setForm({ ...form, description:e.target.value })} placeholder="Explain what happened, who needs help, how the money will be used, and why this is urgent." /></label>

        <div className="upload-grid">
          <label>Campaign image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setImage(e.target.files?.[0] || null)} /><small>JPG, PNG or WebP · up to 5 MB</small></label>
          <label>Supporting proof<input type="file" multiple accept=".pdf,image/jpeg,image/png,image/webp" onChange={e => setProof(Array.from(e.target.files || []))} /><small>PDF, JPG, PNG or WebP · up to 10 MB each</small></label>
        </div>

        <div className="verification-callout">
          <strong>🛡️ Verification before trust</strong>
          <p>Your documents are provided to the Just Helps review team. They are not displayed publicly as campaign content.</p>
          <p>We aim to provide an initial status update within approximately <strong>4 hours</strong>, subject to review-team availability and complete information.</p>
        </div>

        <button className="primary-button full" disabled={loading}>{loading ? 'Submitting for review…' : 'Submit for verification'}</button>
      </form>
    </div>
  );
}
