import { Link, useSearchParams } from 'react-router-dom';

const messages = {
  Food: 'You made someone worry a little less about their next meal.',
  Healthcare: 'You helped someone focus on getting better instead of worrying alone.',
  Education: 'You gave a learner one more reason to keep going.',
  Shelter: 'You helped make someone’s day a little safer.',
  'Girl Child': 'You helped turn a basic need into one less thing to worry about.',
  Emergency: 'You were there when someone needed help quickly.',
  General: 'You made someone’s day a little easier.'
};

export default function DonationResult() {
  const [params] = useSearchParams();
  const status = params.get('status');
  const category = params.get('category') || 'General';
  const message = params.get('impact') || messages[category] || messages.General;
  const transaction = params.get('transaction');
  const cause = params.get('cause');

  if (status === 'cancelled') {
    return (
      <div className="result-page container">
        <div className="result-card neutral">
          <div className="result-icon">↩</div>
          <span className="eyebrow">PAYMENT CANCELLED</span>
          <h1>No worries. Your donation wasn&apos;t completed.</h1>
          <p>You can come back whenever you're ready. No donation was recorded from this cancelled attempt.</p>
          <div className="result-actions"><Link to="/causes" className="primary-link-button">Explore causes</Link><Link to="/" className="secondary-link-button">Back home</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page container">
      <div className="result-card success">
        <div className="result-icon">♥</div>
        <span className="eyebrow">THANK YOU</span>
        <h1>You made someone&apos;s day a little easier.</h1>
        <p className="impact-message">{message}</p>
        {cause && <p>You chose to support <strong>{cause}</strong>.</p>}
        <div className="peace-card">❤️ Thank you for choosing to help. Your contribution has been recorded and a receipt has been sent to your email.</div>
        {transaction && <small>Transaction: {transaction}</small>}
        <div className="result-actions"><Link to="/" className="primary-link-button">Done</Link><Link to="/causes" className="secondary-link-button">Explore more causes</Link></div>
      </div>
    </div>
  );
}
