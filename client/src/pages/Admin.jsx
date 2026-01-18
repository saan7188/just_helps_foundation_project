import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Admin() {
  const navigate = useNavigate();
  
  // --- DATA STATES ---
  const [stats, setStats] = useState({ totalRaised: 0, totalUsers: 0, activeCampaigns: 0 });
  const [users, setUsers] = useState([]);
  const [essentials, setEssentials] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [siteConfig, setSiteConfig] = useState({ heroTitle: '', heroSubtitle: '', maintenanceMode: false, announcement: '' });

  // --- UI STATES ---
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); 
  const [editingId, setEditingId] = useState(null);

  // --- FORM STATE ---
  const [formType, setFormType] = useState('essential');
  const [formData, setFormData] = useState({
    title: '', subtitle: '', category: 'Food', 
    costText: '', target: '', deadline: '', image: null, order: '1'
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      const config = { headers: { 'x-auth-token': token } };

      // 1. FETCH ALL DATA PARALLEL
      const [userRes, causeRes, donationRes, siteRes] = await Promise.allSettled([
        axios.get('https://justhelpsserver.onrender.com/api/auth/users', config),
        axios.get('https://justhelpsserver.onrender.com/api/causes/admin/all', config),
        axios.get('https://justhelpsserver.onrender.com/api/payment/all', config),
        axios.get('https://justhelpsserver.onrender.com/api/site')
      ]);

      const allUsers = userRes.status === 'fulfilled' ? userRes.value.data : [];
      const allCauses = causeRes.status === 'fulfilled' ? causeRes.value.data : [];
      const allDonations = donationRes.status === 'fulfilled' ? donationRes.value.data : [];
      const configData = siteRes.status === 'fulfilled' ? siteRes.value.data : {};

      // 2. CALCULATE STATS
      const totalMoney = allDonations.reduce((acc, curr) => acc + (curr.totalPaid || curr.amount || 0), 0);
      
      setStats({
        totalRaised: totalMoney,
        totalUsers: allUsers.length,
        activeCampaigns: allCauses.filter(c => c.isVerified).length
      });

      // 3. SET DATA
      setUsers(allUsers);
      setDonations(allDonations);
      setEssentials(allCauses.filter(c => String(c.isEssential) === 'true'));
      setCampaigns(allCauses.filter(c => String(c.isEssential) === 'false'));
      setSiteConfig(configData);

    } catch (err) { 
      console.error("Critical Admin Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleDownloadCSV = () => {
    const headers = "Date,Donor Name,Email,Amount,Cause,Transaction ID\n";
    const rows = donations.map(d => 
        `${new Date(d.date).toLocaleDateString()},${d.donorName},${d.donorEmail},${d.totalPaid || d.amount},${d.causeTitle},${d.transactionId}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Donation_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleUpdateSite = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('token');
        await axios.put('https://justhelpsserver.onrender.com/api/site', siteConfig, { headers: { 'x-auth-token': token } });
        alert("✅ Site Settings Updated!");
      } catch(err) { alert("Failed to update settings"); }
  };

  const handleBanUser = async (id) => {
    if(!window.confirm("🔴 BAN USER: Are you sure?")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://justhelpsserver.onrender.com/api/auth/users/${id}`, { headers: { 'x-auth-token': token } });
        fetchData(); 
    } catch(err) { alert("Failed to ban user"); }
  };

  const handleDeleteCause = async (id) => {
    if(!window.confirm("Delete this campaign?")) return;
    const token = localStorage.getItem('token');
    await axios.delete(`https://justhelpsserver.onrender.com/api/causes/${id}`, { headers: { 'x-auth-token': token } });
    fetchData();
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormType(item.isEssential ? 'essential' : 'fundraiser');
    setActiveTab('create');
    setFormData({
        title: item.title, subtitle: item.subtitle, category: item.category,
        costText: item.costText || '', target: item.target || '',
        deadline: item.deadline ? item.deadline.split('T')[0] : '',
        image: null, order: item.order || '1'
    });
    window.scrollTo(0,0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('title', formData.title); data.append('subtitle', formData.subtitle); data.append('category', formData.category); data.append('order', formData.order);
    if(formData.image) data.append('image', formData.image);
    
    if (formType === 'essential') { 
        data.append('isEssential', 'true'); 
        data.append('costText', formData.costText); 
    } else { 
        data.append('isEssential', 'false'); 
        data.append('target', formData.target); 
        data.append('deadline', formData.deadline); 
    }

    try {
      const config = { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } };
      if (editingId) await axios.put(`api/causes/${editingId}`, data, config);
      else await axios.post('https://justhelpsserver.onrender.com/api/causes', data, config);
      
      alert(editingId ? "Updated!" : "Created!"); 
      setEditingId(null);
      setFormData({title:'', subtitle:'', category:'Food', costText:'', target:'', deadline:'', image:null, order:'1'});
      fetchData();
    } catch (err) { alert("Error saving data."); }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.2rem' }}>🚀 Loading Admin Panel...</div>;

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '100vh' }}>
      
      {/* 1. GOD MODE STATS */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '25px', marginBottom: '30px' }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{fontSize:'2rem', fontWeight:'bold', color:'#059669'}}>₹{stats.totalRaised.toLocaleString()}</div>
            <div style={{color:'#666', fontSize:'0.8rem', fontWeight:'bold', textTransform:'uppercase'}}>Total Raised</div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid #ddd' }}>
            <div style={{fontSize:'2rem', fontWeight:'bold', color:'#2563EB'}}>{stats.totalUsers}</div>
            <div style={{color:'#666', fontSize:'0.8rem', fontWeight:'bold', textTransform:'uppercase'}}>Users</div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid #ddd' }}>
            <div style={{fontSize:'2rem', fontWeight:'bold', color:'#D97706'}}>{stats.activeCampaigns}</div>
            <div style={{color:'#666', fontSize:'0.8rem', fontWeight:'bold', textTransform:'uppercase'}}>Active Causes</div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px', borderBottom: '1px solid #eee' }}>
        {['stats', 'global_settings', 'users', 'create', 'essentials', 'campaigns', 'donations'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={activeTab === tab ? activeTabStyle : tabStyle}>
                {tab.replace('_', ' ').toUpperCase()}
            </button>
        ))}
      </div>

      {/* --- CONTENT AREA --- */}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead style={{background:'rgba(0,0,0,0.02)'}}><tr><th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Action</th></tr></thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u._id} style={{borderBottom:'1px solid rgba(0,0,0,0.05)'}}>
                            <td style={tdStyle}><strong>{u.name}</strong></td>
                            <td style={tdStyle}>{u.email}</td>
                            <td style={tdStyle}>
                                {u.role !== 'admin' && <button onClick={() => handleBanUser(u._id)} style={banBtn}>🚫 Ban</button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* DONATIONS TAB (With CSV Download) */}
      {activeTab === 'donations' && (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
              <button onClick={handleDownloadCSV} style={{...submitBtn, width:'auto', margin:'10px', background:'#2563EB'}}>⬇️ Download Report (CSV)</button>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                  <thead style={{background:'rgba(0,0,0,0.02)'}}><tr><th style={thStyle}>Date</th><th style={thStyle}>Donor</th><th style={thStyle}>Amount</th><th style={thStyle}>Cause</th></tr></thead>
                  <tbody>
                      {donations.map(d=>(
                          <tr key={d._id} style={{borderBottom:'1px solid rgba(0,0,0,0.05)'}}>
                              <td style={tdStyle}>{new Date(d.date).toLocaleDateString()}</td>
                              <td style={tdStyle}>{d.donorName}<br/><span style={{fontSize:'0.75rem', color:'#888'}}>{d.donorEmail}</span></td>
                              <td style={{...tdStyle, color:'#059669', fontWeight:'bold'}}>₹{d.totalPaid || d.amount}</td>
                              <td style={tdStyle}>{d.causeTitle}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {/* GLOBAL SETTINGS TAB (GOD MODE) */}
      {activeTab === 'global_settings' && (
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
              <h2>🌍 Site Configuration</h2>
              <form onSubmit={handleUpdateSite} style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                  <div>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Hero Title (Home Page)</label>
                    <input value={siteConfig.heroTitle} onChange={e=>setSiteConfig({...siteConfig, heroTitle:e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Hero Subtitle</label>
                    <textarea value={siteConfig.heroSubtitle} onChange={e=>setSiteConfig({...siteConfig, heroSubtitle:e.target.value})} style={{...inputStyle, height:'80px'}} />
                  </div>
                  <div>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Announcement Banner</label>
                    <input placeholder="e.g. Server maintenance at midnight" value={siteConfig.announcement} onChange={e=>setSiteConfig({...siteConfig, announcement:e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{background:'#FEF2F2', padding:'15px', borderRadius:'8px', border:'1px solid #FCA5A5'}}>
                    <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', color:'#DC2626', fontWeight:'bold'}}>
                        <input type="checkbox" checked={siteConfig.maintenanceMode} onChange={e=>setSiteConfig({...siteConfig, maintenanceMode:e.target.checked})} style={{width:'20px', height:'20px'}} />
                        🚨 Enable Maintenance Mode (Locks Site)
                    </label>
                  </div>
                  <button type="submit" style={submitBtn}>💾 Save Settings</button>
              </form>
          </div>
      )}

      {/* CREATE TAB */}
      {activeTab === 'create' && (
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
              <h2 style={{marginTop:0}}>{editingId ? 'Edit Item' : 'Create New'}</h2>
              <div style={{marginBottom:'20px', display:'flex'}}>
                  <button onClick={()=>setFormType('essential')} style={formType==='essential'?activeToggle:toggleBtn}>Essential</button>
                  <button onClick={()=>setFormType('fundraiser')} style={formType==='fundraiser'?activeToggle:toggleBtn}>Fundraiser</button>
              </div>
              <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                  <input placeholder="Title" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} style={inputStyle} required/>
                  <input placeholder="Subtitle" value={formData.subtitle} onChange={e=>setFormData({...formData, subtitle:e.target.value})} style={inputStyle} required/>
                  <select value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})} style={inputStyle}>
                      <option>Food</option><option>Medical</option><option>Education</option><option>Shelter</option>
                  </select>
                  {formType === 'essential' ? (
                      <input placeholder="Cost Text (e.g. ₹100 feeds 2)" value={formData.costText} onChange={e=>setFormData({...formData, costText:e.target.value})} style={inputStyle} required/>
                  ) : (
                      <div style={{display:'flex', gap:'10px'}}>
                          <input type="number" placeholder="Target" value={formData.target} onChange={e=>setFormData({...formData, target:e.target.value})} style={inputStyle} required/>
                          <input type="date" value={formData.deadline} onChange={e=>setFormData({...formData, deadline:e.target.value})} style={inputStyle} required/>
                      </div>
                  )}
                  <input type="file" onChange={e=>setFormData({...formData, image:e.target.files[0]})} required={!editingId} />
                  <button type="submit" style={submitBtn}>{editingId ? 'Update' : 'Publish'}</button>
              </form>
          </div>
      )}

      {/* ESSENTIALS & CAMPAIGNS TABS */}
      {(activeTab === 'essentials' || activeTab === 'campaigns') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {(activeTab === 'essentials' ? essentials : campaigns).map(item => (
                <div key={item._id} className="glass-card" style={{ padding: '15px' }}>
                    <img src={item.image} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                    <h4 style={{ margin: '10px 0' }}>{item.title}</h4>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button onClick={() => handleEdit(item)} style={editBtn}>Edit</button>
                        <button onClick={() => handleDeleteCause(item._id)} style={delBtn}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const tabStyle = { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', color: '#666', fontWeight: 'bold' };
const activeTabStyle = { ...tabStyle, color: '#D97706', borderBottom: '2px solid #D97706' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', width: '100%' };
const toggleBtn = { flex: 1, padding: '10px', background: '#f9f9f9', border: '1px solid #ddd', cursor: 'pointer' };
const activeToggle = { ...toggleBtn, background: '#EFF6FF', color: '#2563EB', fontWeight: 'bold', borderColor: '#2563EB' };
const submitBtn = { padding: '12px', background: '#D97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width:'100%' };
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #eee' };
const banBtn = { background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' };
const editBtn = { flex:1, background:'#DBEAFE', color:'#1E40AF', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer' };
const delBtn = { flex:1, background:'#FEE2E2', color:'#DC2626', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer' };