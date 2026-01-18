import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ✅ 1. Define Server URL (Keeps code clean & prevents errors)
const API_URL = "https://justhelpsserver.onrender.com";

export default function Create() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FILE STATE
  const [file, setFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', subtitle: '', description: '', category: 'Medical', target: '', deadline: ''
  });

  // 1. CHECK AUTH & FETCH DATA
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("🔒 Please login first.");
      navigate('/login');
      return;
    }
    fetchMyCauses(token);
  }, [navigate]);

  const fetchMyCauses = async (token) => {
    try {
      // ✅ Using API_URL variable
      const res = await axios.get(`${API_URL}/api/causes/mine`, {
        headers: { 'x-auth-token': token }
      });
      setMyCampaigns(res.data);
      if(res.data.length > 0) setShowForm(false);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  // 2. HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('target', formData.target);
    data.append('deadline', formData.deadline);
    
    if (file) {
      data.append('image', file);
    } else {
      alert("Please select an image file.");
      return;
    }

    try {
      // ✅ Using API_URL variable
      const res = await axios.post(`${API_URL}/api/causes`, data, {
        headers: { 'x-auth-token': token }
      });
      
      setMyCampaigns([res.data, ...myCampaigns]);
      setShowForm(false);
      setFile(null);
      setFormData({ title: '', subtitle: '', description: '', category: 'Medical', target: '', deadline: '' }); // Reset form
      alert("✅ Campaign Submitted!");
      
    } catch (err) {
      console.error(err);
      alert("Error creating campaign. Please try again.");
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '50px', textAlign:'center' }}>Loading Dashboard...</div>;

  return (
    <div className="container" style={{ marginTop: '60px', paddingBottom: '100px', maxWidth: '800px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#1F2937' }}>Fundraiser Dashboard</h1>
        </div>
        {!showForm && <button onClick={() => setShowForm(true)} className="btn" style={{ background: '#1F2937', color: 'white', padding:'10px 20px', cursor:'pointer' }}>+ New</button>}
        {showForm && myCampaigns.length > 0 && <button onClick={() => setShowForm(false)} className="btn" style={{ background: '#E5E7EB', color: '#374151', padding:'10px 20px', cursor:'pointer' }}>Cancel</button>}
      </div>

      {/* --- VIEW 1: LIST OF CAMPAIGNS --- */}
      {!showForm && myCampaigns.length > 0 && (
        <div style={{ display: 'grid', gap: '25px' }}>
          {myCampaigns.map(item => {
            // Safety check for math
            const collected = item.collected || 0;
            const target = item.target || 1; 
            const progressPercent = Math.min(Math.round((collected / target) * 100), 100);
            
            return (
              <div key={item._id} className="cause-card" style={{ padding: '25px', display: 'flex', gap: '20px', alignItems: 'center', background:'white', borderRadius:'12px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)' }}>
                {/* Image */}
                <img src={item.image} alt={item.title} style={{ width: '130px', height: '130px', borderRadius: '12px', objectFit: 'cover' }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{item.title}</h3>
                    <span style={{ 
                      background: item.isVerified ? '#D1FAE5' : '#FEF3C7', 
                      color: item.isVerified ? '#065F46' : '#92400E',
                      padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {item.isVerified ? '● LIVE' : '⏳ PENDING'}
                    </span>
                  </div>

                  {/* PROGRESS SECTION */}
                  <div style={{ margin: '15px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                      <span><strong>₹{collected.toLocaleString()}</strong> raised</span>
                      <span style={{ color: '#6B7280' }}>Goal: ₹{target.toLocaleString()}</span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${progressPercent}%`, 
                        height: '100%', 
                        background: item.isVerified ? '#059669' : '#D97706', 
                        transition: 'width 0.5s ease-in-out' 
                      }}></div>
                    </div>
                    <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>
                      {progressPercent}% Funded
                    </p>
                  </div>

                  {/* DEADLINE SECTION */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6B7280', fontSize: '0.85rem' }}>
                    📅 <strong>Deadline:</strong> {item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No deadline set'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- VIEW 2: CREATE FORM --- */}
      {showForm && (
        <div className="cause-card" style={{ padding: '40px', background:'white', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{marginTop:0}}>Create Campaign</h2>
          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', display:'block', marginBottom:'5px' }}>Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} placeholder="e.g. Help Save My School" />
            </div>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Category</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  style={{ ...inputStyle, width: '100%', background:'white' }}
                >
                  <option value="Medical">Medical</option>
                  <option value="Education">Education</option>
                  <option value="Disaster">Disaster Relief</option>
                  <option value="Animal Welfare">Animal Welfare</option>
                  <option value="Environment">Environment</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                 <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Target (₹)</label>
                 <input type="number" placeholder="50000" required value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', display:'block', marginBottom:'5px' }}>Short Subtitle</label>
              <input type="text" required value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} style={inputStyle} placeholder="A short sentence about the cause..." />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', display:'block', marginBottom:'5px' }}>Full Story</label>
              <textarea rows="4" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{...inputStyle, fontFamily:'inherit'}} placeholder="Explain the details..." />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Campaign Image (Upload)</label>
              <input 
                type="file" 
                required 
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])} 
                style={{ ...inputStyle, padding: '10px' }} 
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
               <label style={{ fontWeight: 'bold', display:'block', marginBottom:'5px' }}>Deadline</label>
               <input type="date" required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} style={inputStyle} />
            </div>

            <button className="btn" style={{ width: '100%', padding: '15px', background: '#D97706', color: 'white', border:'none', borderRadius:'8px', fontSize:'1rem', fontWeight:'bold', cursor:'pointer' }}>Submit Campaign</button>
          </form>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize:'1rem' };
