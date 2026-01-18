import { Link } from 'react-router-dom';

export default function IntentCard({ item, type }) {
  const id = item._id || item.id;
  const collected = item.collected || 0;
  const target = item.target || 1;
  const percent = Math.min(Math.round((collected / target) * 100), 100);

  // --- 1. DAILY ESSENTIAL CARD ---
  if (type === 'core') {
    return (
      <div style={cardStyle}>
        <img src={item.image} alt={item.title} style={imgStyle} />
        <div style={{ padding: '20px' }}>
          <span style={categoryBadgeStyle}>{item.category}</span>
          <h3 style={{ margin: '10px 0', fontSize: '1.25rem', color: '#1F2937' }}>{item.title}</h3>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '15px' }}>{item.subtitle}</p>
          
          <div style={{ background: '#FFFBEB', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', color: '#D97706', fontSize: '0.9rem', border: '1px solid #FCD34D' }}>
            {item.costText}
          </div>
          
          <Link to={`/donate/${id}`} style={{ textDecoration: 'none' }}>
            {/* THEME ORIENTED BUTTON */}
            <button style={{ ...btnStyle, marginTop: '15px' }}>
              Donate Now
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // --- 2. FUNDRAISER CARD ---
  return (
    <div style={cardStyle}>
      <img src={item.image} alt={item.title} style={imgStyle} />
      <div style={{ padding: '20px' }}>
        <span style={{ ...categoryBadgeStyle, background: '#FEF3C7', color: '#D97706' }}>
          {item.category}
        </span>
        <h3 style={{ margin: '10px 0', fontSize: '1.25rem', color: '#1F2937' }}>{item.title}</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#4B5563' }}>
            <span>Raised: ₹{collected.toLocaleString()}</span>
            <span>{percent}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#F3F4F6', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${percent}%`, height: '100%', background: '#D97706' }}></div>
          </div>
        </div>

        <Link to={`/donate/${id}`} style={{ textDecoration: 'none' }}>
          {/* THEME ORIENTED BUTTON */}
          <button style={btnStyle}>
            Donate Now
          </button>
        </Link>
      </div>
    </div>
  );
}

// STYLES
const cardStyle = { background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: '0.3s' };
const imgStyle = { width: '100%', height: '200px', objectFit: 'cover' };
const categoryBadgeStyle = { background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block' };

// UNIFIED THEME BUTTON STYLE
const btnStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#D97706', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' };