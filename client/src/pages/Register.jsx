import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  
  // STATE
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // PASSWORD VISIBILITY STATE (NEW)
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ email: '', otp: '', name: '', password: '' });

  // STEP 1: SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { email: formData.email });
      setStep(2); 
      alert(`✅ OTP Sent to ${formData.email}. Please check your Inbox.`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: REGISTER (FINAL)
  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if(formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      alert("🎉 Verification Successful! Account Created.");
      navigate('/create');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '60px', paddingBottom: '100px' }}>
      <div className="cause-card" style={{ padding: '40px' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#1F2937', marginBottom: '5px' }}>Start a Fundraiser</h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            {step === 1 ? "Step 1: Email Verification" : "Step 2: Secure Account"}
          </p>
          <div style={{ height: '4px', background: '#E5E7EB', marginTop: '15px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: step === 1 ? '33%' : (step === 2 ? '66%' : '100%'), height: '100%', background: '#D97706', transition: 'width 0.3s' }}></div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1 FORM */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Email Address</label>
              <input 
                type="email" required placeholder="name@example.com"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                style={inputStyle}
              />
            </div>
            <button disabled={loading} className="btn" style={{ width: '100%', padding: '14px', background: '#1F2937', color: 'white' }}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
              Already registered? <Link to="/login" style={{ color: '#D97706', fontWeight: 'bold' }}>Login here</Link>
            </p>
          </form>
        )}

        {/* STEP 2 FORM: OTP */}
        {step === 2 && (
          <div className="fade-in">
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Enter OTP</label>
              <input 
                type="text" required placeholder="XXXX" maxLength="4"
                value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})}
                style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}
              />
              <button onClick={() => setStep(3)} className="btn" style={{ width: '100%', marginTop: '15px', padding: '14px', background: '#D97706', color: 'white' }}>
                 Verify Code
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 FORM: DETAILS (With Eye Icon) */}
        {step === 3 && (
          <form onSubmit={handleFinalRegister} className="fade-in">
             <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Full Name</label>
              <input 
                type="text" required placeholder="John Doe"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                style={inputStyle}
              />
            </div>

            {/* --- PASSWORD FIELD WITH EYE ICON --- */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  // Toggle Type Here
                  type={showPassword ? "text" : "password"} 
                  required placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  style={inputStyle}
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                    cursor: 'pointer', fontSize: '1.2rem', color: '#9CA3AF', userSelect: 'none'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            <button disabled={loading} className="btn" style={{ width: '100%', padding: '14px', background: '#059669', color: 'white' }}>
              {loading ? 'Creating...' : 'Complete Registration'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem'
};