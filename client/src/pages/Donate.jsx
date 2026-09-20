import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const presets = [10, 50, 100, 500, 1000];

const impactByCategory = {
  Food: 'You made someone worry a little less about their next meal.',
  Healthcare: 'You helped someone focus on getting better instead of worrying alone.',
  Education: 'You gave a learner one more reason to keep going.',
  Shelter: 'You helped make someone’s day a little safer.',
  'Girl Child': 'You helped turn a basic need into one less thing to worry about.',
  Emergency: 'You were there when someone needed help quickly.',
  General: 'You made someone’s day a little easier.'
};

export default function Donate() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [cause, setCause] = useState(null);
  const [loadingCause, setLoadingCause] = useState(Boolean(id));
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState(false);
  const [category, setCategory] = useState(params.get('category') || 'General');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dedication, setDedication] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('OPTIONS');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_URL}/api/causes/${id}`)
      .then(res => { setCause(res.data); setCategory(res.data.category || 'General'); })
      .catch(() => setCause(null))
      .finally(() => setLoadingCause(false));
  }, [id]);

  const donationAmount = Number(amount) || 0;
  const total = donationAmount;
  const impactMessage = useMemo(() => impactByCategory[category] || impactByCategory.General, [category]);

  const startPayment = e => {
    e.preventDefault();
    setError('');
    if (donationAmount < 1) return setError('Choose an amount of at least ₹1.');
    if (donationAmount > 1000000) return setError('The maximum demo contribution is ₹10,00,000.');
    if (!donorName.trim()) return setError('Please enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(donorEmail.trim())) return setError('Please enter a valid email address.');
    setShowPayment(true);
    setPaymentStep('OPTIONS');
  };

  const cancelPayment = () => {
    setShowPayment(false);
    navigate('/donation-result?status=cancelled');
  };

  const completePayment = async () => {
    setPaymentStep('PROCESSING');
    try {
      const res = await axios.post(`${API_URL}/api/payment/donate`, {
        causeId: id || undefined,
        causeTitle: cause?.title || `${category} Support`,
        category,
        amount: donationAmount,
        tip: 0,
        totalPaid: total,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim().toLowerCase(),
        isAnonymous,
        dedication
      });

      navigate(`/donation-result?status=success&transaction=${encodeURIComponent(res.data.transactionId)}&category=${encodeURIComponent(res.data.category || category)}&cause=${encodeURIComponent(res.data.causeTitle || cause?.title || '')}&impact=${encodeURIComponent(res.data.impactMessage || impactMessage)}`, { replace: true });
    } catch (err) {
      console.error(err);
      setPaymentStep('FAILED');
      setError(err.response?.data?.msg || 'The donation could not be recorded.');
    }
  };

  if (loadingCause) return <div className="empty-state">Preparing your donation…</div>;
  if (id && !cause) return <div className="empty-state"><h2>This campaign is unavailable</h2><Link to="/causes">Explore other causes</Link></div>;

  return (
    <div className="container section donation-page">
      <div className="donation-layout">
        <section>
          <div className="page-intro compact">
            <span className="eyebrow">MAKE A DIFFERENCE</span>
            <h1>{cause ? cause.title : `${category} Support`}</h1>
            <p>{cause ? cause.subtitle : `Your contribution helps verified ${category.toLowerCase()} needs identified through Just Helps.`}</p>
          </div>

          {cause && (
            <div className="donation-campaign-note">
              ✓ <strong>Verified campaign</strong>
              <span>This donation is specifically for this campaign.</span>
            </div>
          )}

          <div className="amount-card">
            <h2>Choose your contribution</h2>
            <p>Every amount matters.</p>
            <div className="amount-grid">
              {presets.map(value => (
                <button key={value} type="button" aria-pressed={!custom && donationAmount === value} className={!custom && donationAmount === value ? 'amount-active' : 'amount-button'} onClick={() => { setAmount(value); setCustom(false); }}>
                  ₹{value}
                </button>
              ))}
            </div>
            <button type="button" aria-pressed={custom} className={custom ? 'amount-active custom-amount' : 'amount-button custom-amount'} onClick={() => setCustom(true)}>Other amount</button>
            {custom && <label className="auth-field amount-custom-field">Amount<input autoFocus type="number" min="1" max="1000000" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" /></label>}
          </div>

          <div className="info-card">
            <strong>Tax information</strong>
            <p>Any Section 80G benefit depends on the organization’s legal eligibility, registration and receipt requirements. This portfolio demo does not issue tax certificates.</p>
          </div>
        </section>

        <form className="donor-card" onSubmit={startPayment}>
          <div className="donor-card-header"><span>YOUR CONTRIBUTION</span><strong>₹{total.toLocaleString()}</strong></div>
          <label>Name<input className="form-input" autoComplete="name" required value={donorName} onChange={e => setDonorName(e.target.value)} placeholder="Your name" /></label>
          <label>Email<input className="form-input" type="email" autoComplete="email" required value={donorEmail} onChange={e => setDonorEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label>Optional dedication<textarea className="form-input" rows="3" maxLength="500" value={dedication} onChange={e => setDedication(e.target.value)} placeholder="In memory of… or a message" /></label>
          <label className="checkbox-row"><input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} /> Don&apos;t show my name publicly</label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="primary-button full" type="submit">Continue to payment · ₹{total.toLocaleString()}</button>
          <small className="demo-note">Portfolio demo: no real money or payment credentials are processed.</small>
        </form>
      </div>

      {showPayment && (
        <div className="modal-backdrop" role="presentation">
          <div className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title">
            <header><strong id="payment-title">Just Helps demo payment</strong><span>₹{total.toLocaleString()}</span></header>
            <div className="demo-banner">Demo only · no real card, UPI or bank details are collected.</div>

            {paymentStep === 'OPTIONS' && <>
              <h3>Choose a demo payment method</h3>
              {['UPI', 'Card', 'Net Banking'].map(method => (
                <button key={method} type="button" className="payment-option" onClick={completePayment}>
                  {method}<span aria-hidden="true">→</span>
                </button>
              ))}
              <button type="button" className="cancel-payment" onClick={cancelPayment}>Cancel payment</button>
            </>}

            {paymentStep === 'PROCESSING' && <div className="payment-state" aria-live="polite"><div className="spinner" /><h3>Recording your demo donation…</h3><p>Please wait.</p></div>}

            {paymentStep === 'FAILED' && (
              <div className="payment-state" role="alert">
                <h2>Something went wrong.</h2>
                <p>{error}</p>
                <button type="button" className="primary-button" onClick={() => setPaymentStep('OPTIONS')}>Try again</button>
                <button type="button" className="text-button" onClick={cancelPayment}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
