import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Donate() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // DATA STATES
  const [cause, setCause] = useState(null);
  
  // PRESETS
  const presets = [
    { amount: 500, label: '🙏 Small Help' },
    { amount: 1500, label: '❤️ Big Impact' },
    { amount: 3000, label: '🌟 Life Changer' },
    { amount: 5000, label: '👑 Hero Donation' }
  ];
  
  // FORM STATES
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dedication, setDedication] = useState('');
  
  // TIP STATE
  const [tipPercentage, setTipPercentage] = useState(0); 
  
  // UI STATES
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentStep, setPaymentStep] = useState('OPTIONS'); 

  useEffect(() => {
    // 1. Fetch Campaign Data
    if (id && id.length === 24) {
        const fetchCause = async () => {
          try {
            const res = await axios.get(`https://justhelpsserver.onrender.com/api/causes/${id}`);
            setCause(res.data);
          } catch (err) { console.error(err); }
        };
        fetchCause();
    } else {
        // 2. Static Fallback (For manual IDs like '101')
        const staticData = { 
            '101': 'Food for Hungry', '104': 'School Essentials', 
            '102': "Women's Dignity", '103': "Shelter & Warmth" 
        };
        setCause({ title: staticData[id] || "General Donation", category: 'General' });
    }
  }, [id]);

  // CALCULATIONS
  const baseAmount = Number(amount) || 0; // Changed to Number() for safety
  const tipAmount = Math.round(baseAmount * (tipPercentage / 100));
  const totalAmount = baseAmount + tipAmount;

  const handleInitiatePayment = (e) => {
    e.preventDefault();
    if (!baseAmount) return alert("Please select or enter an amount.");
    if (!donorName || !donorEmail) return alert("Please fill in your Name and Email.");
    setShowRazorpay(true);
    setPaymentStep('OPTIONS');
  };

  const handleCancel = async () => {
    if(window.confirm("Cancel transaction?")) {
        try { await axios.post('https://justhelpsserver.onrender.com/api/payment/cancel', { donorName, donorEmail }); } catch(err) {}
        setShowRazorpay(false);
    }
  };

  const handleFinalPayment = async () => {
    setPaymentStep('PROCESSING');
    
    const donationData = {
      causeId: id,
      causeTitle: cause?.title || 'General',
      amount: baseAmount,    // This updates the Progress Bar
      tip: tipAmount,        // This goes to Platform
      totalPaid: totalAmount,
      donorName, donorEmail, isAnonymous, dedication
    };

    try {
      const res = await axios.post('https://justhelpsserver.onrender.com/api/payment/donate', donationData);
      
      // UX Simulation Sequence
      setTimeout(() => {
        setPaymentStep('SUCCESS');
        setTimeout(() => {
          alert(`✅ Payment Successful!\nTransaction ID: ${res.data.transactionId || 'TXN_SUCCESS'}`);
          navigate('/'); // Redirect to Home to see updated progress
        }, 2500);
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("Payment Failed. Please try again.");
      setShowRazorpay(false);
    }
  };

  // --- RENDER HELPERS (Modals) ---
  const renderOptions = () => (
    <>
      <p style={subHeaderStyle}>Select Payment Method</p>
      {['💳 Credit / Debit Card', '📱 UPI / QR Code', '🏦 Netbanking'].map((m, i) => (
          <div key={i} onClick={() => setPaymentStep(m.includes('Card') ? 'CARD' : 'UPI')} style={methodStyle}>
            <span>{m}</span> <span style={{ color: '#2B83EA' }}>&gt;</span>
          </div>
      ))}
      <button onClick={handleCancel} style={cancelBtnStyle}>Cancel</button>
    </>
  );

  const renderCard = () => (
    <div>
      <div onClick={() => setPaymentStep('OPTIONS')} style={backBtnStyle}>&lt; Back</div>
      <p style={subHeaderStyle}>Enter Card Details</p>
      <input type="text" placeholder="0000 0000 0000 0000" style={modalInputStyle} maxLength="16" />
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="text" placeholder="MM/YY" style={modalInputStyle} maxLength="5" />
        <input type="password" placeholder="CVV" style={modalInputStyle} maxLength="3" />
      </div>
      <button onClick={handleFinalPayment} style={payBtnStyle}>Pay ₹{totalAmount}</button>
    </div>
  );

  const renderUPI = () => (
    <div style={{ textAlign: 'center' }}>
      <div onClick={() => setPaymentStep('OPTIONS')} style={backBtnStyle}>&lt; Back</div>
      <p style={subHeaderStyle}>Scan QR Code</p>
      <div style={{ background: 'white', padding: '10px', display: 'inline-block', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '15px' }}>
        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=justhelps@upi&am=${totalAmount}`} alt="QR" />
      </div>
      <div style={{fontSize: '0.9rem', fontWeight: 'bold'}}>Total: ₹{totalAmount}</div>
      <button onClick={handleFinalPayment} style={payBtnStyle}>Simulate Success</button>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', minHeight: '80vh' }}>
      
      <div style={{display: 'flex', gap: '40px', flexDirection: 'row', flexWrap: 'wrap'}}>
        
        {/* LEFT: AMOUNT SELECTION */}
        <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={sectionTitle}>1. Choose Amount</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                {presets.map((opt) => (
                    <button 
                        key={opt.amount} 
                        onClick={() => { setAmount(opt.amount); setCustomAmount(false); }}
                        style={parseInt(amount) === opt.amount && !customAmount ? activePresetStyle : presetStyle}
                    >
                        <div style={{fontWeight:'bold', fontSize:'1.2rem'}}>₹{opt.amount}</div>
                        <div style={{fontSize:'0.8rem', opacity: 0.8}}>{opt.label}</div>
                    </button>
                ))}
            </div>
            
            <div style={{position: 'relative', marginBottom: '25px'}}>
                <span style={{position:'absolute', left:'15px', top:'13px', color:'#6B7280', fontWeight:'bold'}}>₹</span>
                <input type="number" placeholder="Enter custom amount" value={amount} onChange={e => { setAmount(e.target.value); setCustomAmount(true); }} style={{...inputStyle, paddingLeft: '30px'}} />
            </div>

            {/* TIP SELECTOR */}
            <div style={{background: '#F3F4F6', padding: '15px', borderRadius: '8px', border: '1px solid #E5E7EB'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'0.9rem', fontWeight:'600'}}>
                    <span>Support Just Helps Platform?</span>
                    <span style={{color:'#D97706'}}>₹{tipAmount}</span>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    {[0, 5, 10, 15].map(pct => (
                        <button 
                            key={pct}
                            onClick={() => setTipPercentage(pct)}
                            style={{
                                flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #D1D5DB', cursor:'pointer',
                                background: tipPercentage === pct ? '#374151' : 'white',
                                color: tipPercentage === pct ? 'white' : '#374151',
                                fontSize: '0.85rem'
                            }}
                        >
                            {pct}%
                        </button>
                    ))}
                </div>
                <p style={{fontSize:'0.75rem', color:'#6B7280', marginTop:'8px'}}>
                    We charge 0% fees. This optional tip helps us run the secure server.
                </p>
            </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
            <h3 style={sectionTitle}>2. Your Details</h3>
            
            {/* Added: SHOW CAUSE NAME */}
            <div style={{marginBottom:'15px', padding:'10px', background:'#FFF7ED', borderRadius:'6px', borderLeft:'4px solid #D97706', color:'#9A3412', fontWeight:'600', fontSize:'0.9rem'}}>
               ❤️ Supporting: {cause?.title || 'Loading...'}
            </div>

            <input type="text" required placeholder="Full Name" value={donorName} onChange={e => setDonorName(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
            <input type="email" required placeholder="Email Address" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
            <textarea rows="2" placeholder="Dedication (Optional - e.g. In memory of...)" value={dedication} onChange={e => setDedication(e.target.value)} style={{...inputStyle, marginBottom: '15px'}} />
            
            <div style={{ marginBottom: '20px', padding: '10px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <label style={{display:'flex', alignItems:'center', cursor:'pointer', gap:'10px'}}>
                    <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} style={{width:'18px', height:'18px'}} />
                    <span style={{fontSize:'0.9rem', color:'#374151', fontWeight:'500'}}>Don't show my name publicly</span>
                </label>
            </div>

            <button onClick={handleInitiatePayment} style={mainDonateBtn}>
                Donate ₹{totalAmount} Now
            </button>
            <div style={{textAlign: 'center', marginTop: '10px', fontSize: '0.8rem', color: '#6B7280'}}>
                🛡️ SSL Encrypted & Secure
            </div>
        </div>
      </div>

      {/* RAZORPAY MODAL */}
      {showRazorpay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '400px', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', fontFamily: 'system-ui' }}>
            <div style={{ background: '#1A1F36', padding: '20px', color: 'white', position: 'relative' }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>Just Helps Foundation</div>
              <div style={{ position:'absolute', right:'20px', top:'20px', fontSize:'1.2rem', fontWeight:'bold' }}>₹{totalAmount}</div>
              <button onClick={handleCancel} style={{ position: 'absolute', top: '5px', right: '10px', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '20px', minHeight: '350px', background: '#F7FAFC' }}>
              {paymentStep === 'OPTIONS' && renderOptions()}
              {paymentStep === 'CARD' && renderCard()}
              {(paymentStep === 'UPI' || paymentStep === 'NETBANKING') && renderUPI()}
              {paymentStep === 'PROCESSING' && <div style={{textAlign:'center', paddingTop:'80px'}}><b>Processing Securely...</b></div>}
              {paymentStep === 'SUCCESS' && <div style={{textAlign:'center', paddingTop:'80px', color:'#10B981'}}><h1>✓</h1><h3>Payment Successful</h3></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
const sectionTitle = { fontSize: '1.2rem', color: '#374151', marginBottom: '15px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem', background: '#fff' };
const modalInputStyle = { width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #D1D5DB', marginBottom: '15px', fontSize: '0.95rem' };
const subHeaderStyle = { fontSize: '0.85rem', color: '#6B7280', marginBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase' };
const methodStyle = { background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' };
const payBtnStyle = { width: '100%', padding: '14px', background: '#2B83EA', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const backBtnStyle = { fontSize: '0.85rem', color: '#2B83EA', cursor: 'pointer', marginBottom: '15px', fontWeight: '600', display: 'inline-block' };
const cancelBtnStyle = { width: '100%', padding: '12px', marginTop: '15px', border: '1px solid #EF4444', color: '#EF4444', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const mainDonateBtn = { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(217, 119, 6, 0.4)' };
const presetStyle = { padding: '20px', borderRadius: '12px', border: '2px solid #E5E7EB', background: 'white', cursor: 'pointer', textAlign: 'center', color: '#4B5563' };
const activePresetStyle = { ...presetStyle, borderColor: '#D97706', background: '#FFFBEB', color: '#D97706' };