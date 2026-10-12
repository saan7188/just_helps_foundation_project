import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

export default function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    axios.get(`${API_URL}/api/payment/mine`, { headers: { 'x-auth-token': localStorage.getItem('token') } })
      .then(res => setDonations(res.data || []))
      .catch(err => setError(err.response?.data?.msg || 'Unable to load donation history.'))
      .finally(() => setLoading(false));
  }, []);
  return <div className="container section donor-dashboard">
    <div className="page-intro"><span className="eyebrow">DONOR ACCOUNT</span><h1>Your giving, all in one place.</h1><p>Review previous donations or make another contribution.</p></div>
    <div className="donor-actions"><Link className="primary-link-button" to="/donate?category=Food&amount=20">Make a new donation</Link><Link className="secondary-link-button" to="/causes">Browse campaigns</Link></div>
    <section className="donation-history"><h2>Donation history</h2>
      {loading ? <p>Loading your donations…</p> : error ? <p role="alert">{error}</p> : donations.length ? <div className="history-list">{donations.map(item => <article className="history-item" key={item._id}><div><strong>{item.causeTitle || item.category || 'Donation'}</strong><p>{new Date(item.date).toLocaleString()} · {item.transactionId || 'Payment confirmed'}</p><small>{item.paymentMethod === 'razorpay_test' ? 'Razorpay test payment' : item.paymentMethod}</small></div><strong>₹{Number(item.totalPaid || item.amount).toLocaleString()}</strong></article>)}</div> : <div className="empty-state"><h3>No completed donations yet</h3><p>Your successful donations will appear here.</p><Link to="/donate?category=Food&amount=20" className="primary-link-button">Make your first donation</Link></div>}
    </section>
  </div>;
}
