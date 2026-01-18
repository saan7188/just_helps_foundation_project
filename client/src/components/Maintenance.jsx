import { Link } from 'react-router-dom';

export default function Maintenance({ announcement }) {
  return (
    <div style={containerStyle}>
      <div className="glass-card" style={cardStyle}>
        
        {/* BRANDING */}
        <div style={{ marginBottom: '30px' }}>
          <span style={logoIcon}>🕊️</span>
          <h2 style={{ display: 'inline-block', margin: 0, color: '#D97706', fontSize: '1.5rem', verticalAlign: 'middle' }}>Just Helps</h2>
        </div>

        {/* ILLUSTRATION (Using Emoji or SVG) */}
        <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'pulse 2s infinite' }}>
          ⚙️
        </div>

        {/* PROFESSIONAL TEXT */}
        <h1 style={{ color: '#1F2937', fontSize: '2rem', marginBottom: '10px' }}>
          System Upgrade in Progress
        </h1>
        
        <p style={{ color: '#6B7280', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
          We are currently performing scheduled maintenance to improve your donation experience and security. 
          <br />
          <strong>We will be back shortly.</strong>
        </p>

        {/* DYNAMIC ANNOUNCEMENT (From Admin Panel) */}
        {announcement && (
          <div style={{ background: '#FFF7ED', borderLeft: '4px solid #D97706', padding: '15px', textAlign: 'left', marginBottom: '30px', borderRadius: '4px' }}>
            <strong style={{ color: '#9A3412', display: 'block', marginBottom: '5px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status Update:</strong>
            <span style={{ color: '#9A3412' }}>{announcement}</span>
          </div>
        )}

        {/* CONTACT INFO */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', fontSize: '0.9rem', color: '#9CA3AF' }}>
          Need urgent help? <a href="mailto:support@justhelps.com" style={{ color: '#D97706', textDecoration: 'none', fontWeight: 'bold' }}>Contact Support</a>
        </div>
      </div>

      {/* 🔐 ADMIN BACKDOOR (Subtle link at bottom right) */}
      <Link to="/login" style={{ position: 'absolute', bottom: '20px', right: '20px', color: '#E5E7EB', textDecoration: 'none', fontSize: '0.8rem' }}>
        Admin Access
      </Link>

      {/* ANIMATION STYLES */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// STYLES
const containerStyle = {
  height: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 99999
};

const cardStyle = {
  maxWidth: '600px',
  width: '90%',
  padding: '50px',
  textAlign: 'center',
  background: 'white',
  boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
  borderRadius: '20px',
  border: '1px solid #ffffff'
};

const logoIcon = {
  fontSize: '2rem',
  marginRight: '10px',
  verticalAlign: 'middle'
};