import { useState } from 'react';
import axios from 'axios';

// ✅ 1. Define Server URL centrally
const API_URL = "https://justhelpsserver.onrender.com";

export default function PaymentModal({ cause, onClose }) {
  // Smart Presets: "Amount" -> "Impact"
  const presets = [
    { amount: 500, label: '🥗 Feeds 10 people' },
    { amount: 1200, label: '💊 Medical Kit' },
    { amount: 2500, label: '📚 Child Education' }
  ];

  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dedication, setDedication] = useState('');
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Prepare Data
    const donationData = {
      donorName: isAnonymous ? "Well Wisher" : donorName, // Handle Anonymity
      donorEmail: email,
      amount: amount,
      cause: cause._id,
      causeTitle: cause.title,
      isAnonymous,
      dedication
    };

    try {
      // 2. Send to Backend
      // ✅ Use API_URL
      await axios.post(`${API_URL}/api/payment/donate`, donationData);
      alert(`🎉 Thank you! Your ₹${amount} donation was successful.`);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle}>✕</button>
        
        <h2 style={{marginTop:0, color: '#1F2937'}}>❤️ Support "{cause.title}"</h2>
        <p style={{color: '#6B7280', fontSize: '0.9rem', marginBottom:'20px'}}>Your contribution makes a difference.</p>

        {/* 1. SMART PRESETS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {presets.map(p => (
                <button 
                    key={p.amount} 
                    onClick={() => { setAmount(p.amount); setCustomAmount(false); }}
                    style={amount === p.amount && !customAmount ? activePreset : presetBtn}
                >
                    <div style={{fontWeight:'bold'}}>₹{p.amount}</div>
                    <div style={{fontSize:'0.7rem'}}>{p.label}</div>
                </button>
            ))}
        </div>

        {/* 2. CUSTOM AMOUNT INPUT */}
        <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Or enter custom amount</label>
            <input 
                type="number" 
                value={amount} 
                onChange={(e) => { setAmount(e.target.value); setCustomAmount(true); }}
                style={inputStyle} 
            />
        </div>

        {/* 3. PERSONAL DETAILS */}
        <input placeholder="Your Name" value={donorName} onChange={e=>setDonorName(e.target.value)} style={inputStyle} />
        <input placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} />

        {/* 4. PRO FEATURES: Dedication & Anonymity */}
        <div style={{ margin: '15px 0', background: '#F9FAFB', padding: '10px', borderRadius: '8px', border:'1px solid #E5E7EB' }}>
            <label style={{...labelStyle, display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom:0}}>
                <input type="checkbox" checked={isAnonymous} onChange={e=>setIsAnonymous(e.target.checked)} style={{marginRight:'10px', width:'16px', height:'16px'}} />
                🔒 Donate Anonymously
            </label>
            
            <input 
                placeholder="Optional: Dedicate this donation (e.g. In memory of...)" 
                value={dedication} 
                onChange={e=>setDedication(e.target.value)} 
                style={{...inputStyle, marginTop: '10px', fontSize: '0.85rem', marginBottom:0}} 
            />
        </div>

        <button onClick={handleDonate} disabled={loading} style={payBtnStyle}>
            {loading ? 'Processing...' : `Pay ₹${amount} Securely`}
        </button>
        
        <div style={{textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#9CA3AF'}}>
            🔒 SSL Encrypted & Tax Deductible
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '450px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' };
const closeBtnStyle = { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color:'#9CA3AF' };
const presetBtn = { padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', background: 'white', cursor: 'pointer', transition: '0.2s', color:'#374151' };
const activePreset = { ...presetBtn, background: '#EFF6FF', borderColor: '#2563EB', color: '#2563EB', border: '2px solid #2563EB' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', marginBottom: '10px', fontSize: '1rem' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4B5563', fontWeight: 'bold' };
const payBtnStyle = { width: '100%', background: '#D97706', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
