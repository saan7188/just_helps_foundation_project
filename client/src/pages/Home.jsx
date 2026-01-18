import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IntentCard from '../components/IntentCard';

// ✅ 1. Define Server URL centrally (Guarantees connection to Render)
const API_URL = "https://justhelpsserver.onrender.com";

// 2. Accept 'config' prop from App.jsx (God Mode)
export default function Home({ config }) {
  const navigate = useNavigate();
  const [showUrgentPopup, setShowUrgentPopup] = useState(false);
  
  // DATA STATES
  const [urgentCampaign, setUrgentCampaign] = useState(null);
  const [essentials, setEssentials] = useState([]); 
  const [causes, setCauses] = useState([]);       
  const [loading, setLoading] = useState(true);

  // 3. Set Default Hero Text (Fallback if config is loading)
  const heroTitle = config?.heroTitle || "Small Acts. Massive Impact.";
  const heroSubtitle = config?.heroSubtitle || "Kindness has no minimum limit. Whether it's ₹1 or ₹100, your help reaches the person who needs it most.";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ 4. USE API_URL VARIABLE
        
        // FETCH URGENT CAMPAIGN
        const urgentRes = await axios.get(`${API_URL}/api/causes/urgent`);
        if (urgentRes.data) {
          setUrgentCampaign(urgentRes.data);
          const hasSeen = sessionStorage.getItem('hasSeenUrgentPopup');
          if (!hasSeen) {
            setTimeout(() => {
              setShowUrgentPopup(true);
              sessionStorage.setItem('hasSeenUrgentPopup', 'true');
            }, 2500);
          }
        }

        // FETCH ALL CAMPAIGNS
        const allRes = await axios.get(`${API_URL}/api/causes`);
        const allData = allRes.data;
        
        setEssentials(allData.filter(item => item.isEssential === true || String(item.isEssential) === 'true'));
        setCauses(allData.filter(item => item.isEssential === false || String(item.isEssential) === 'false'));

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '20px', color: '#6B7280' }}>Loading Impact...</p>
      <style>{`.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #D97706; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      
      {/* --- URGENT POPUP --- */}
      {showUrgentPopup && urgentCampaign && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', maxWidth: '400px', width: '100%', borderRadius: '16px', padding: '25px', position: 'relative', animation: 'popIn 0.4s ease-out' }}>
            <button onClick={() => setShowUrgentPopup(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9CA3AF' }}>×</button>
            <div style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%' }}></span>URGENT DEADLINE
            </div>
            <img src={urgentCampaign.image} alt={urgentCampaign.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', lineHeight: 1.2, color: '#1F2937' }}>{urgentCampaign.title}</h3>
            <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px', display: 'inline-block', fontWeight: 'bold' }}>
               ⏱ Ending: {new Date(urgentCampaign.deadline).toLocaleDateString()}
            </div>
            <Link to={`/donate/${urgentCampaign._id}`} onClick={() => setShowUrgentPopup(false)}>
              <button className="btn-2050" style={{ width: '100%', cursor: 'pointer' }}>Donate Now</button>
            </Link>
          </div>
        </div>
      )}

      {/* --- HERO SECTION (Dynamic from Admin) --- */}
      <div style={{ padding: '90px 0 60px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: '#1F2937', letterSpacing: '-1px', lineHeight: '1.2', whiteSpace: 'pre-line' }}>
          {heroTitle}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#6B7280', maxWidth: '600px', margin: '25px auto', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {heroSubtitle}
        </p>
        <div style={{ display: 'inline-block', padding: '10px 20px', background: '#F3F4F6', borderRadius: '50px', fontSize: '0.9rem', color: '#374151', fontWeight: '600' }}>
          ❤️ Help brings hope and smile where they're needed
        </div>
      </div>

      {/* --- SECTION 1: DAILY ESSENTIALS --- */}
      <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#1F2937' }}>Daily Essentials</h2>
      
      {essentials.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', marginBottom: '60px' }}>
          {essentials.map(item => (
            <IntentCard key={item._id} item={item} type="core" />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#9CA3AF', marginBottom: '60px' }}>No daily essentials listed right now.</p>
      )}

      {/* --- SECTION 2: URGENT FUNDRAISERS --- */}
      <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#1F2937' }}>Urgent Fundraisers</h2>
      
      {causes.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {causes.map((cause) => {
            const raised = cause.raised || 0;
            const target = cause.target || 100000;
            const percent = Math.min((raised / target) * 100, 100);
            const daysLeft = Math.ceil((new Date(cause.deadline) - new Date()) / (1000 * 3600 * 24));

            return (
              <div key={cause._id} className="glass-card" style={{ padding: '15px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <img src={cause.image} alt={cause.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px' }} />
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {daysLeft > 0 ? `⏳ ${daysLeft} Days Left` : '⚠️ Ending Soon'}
                  </div>
                </div>

                <div style={{ marginTop: '15px', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#D97706', background: '#FFF7ED', padding: '4px 8px', borderRadius: '4px' }}>
                    {cause.category ? cause.category.toUpperCase() : 'CAUSE'}
                  </span>
                  <h3 style={{ margin: '10px 0 5px', fontSize: '1.1rem' }}>{cause.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.4' }}>{cause.subtitle}</p>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>
                    <span style={{ color: '#059669' }}>Raised: ₹{raised.toLocaleString()}</span>
                    <span style={{ color: '#666' }}>Goal: ₹{target.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', background: '#E5E7EB', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, background: '#059669', height: '100%', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>

                <button onClick={() => navigate(`/donate/${cause._id}`)} className="btn-2050" style={{ width: '100%', marginTop: '15px', cursor:'pointer' }}>Donate Now</button>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#9CA3AF' }}>No active fundraisers at the moment.</p>
      )}

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
