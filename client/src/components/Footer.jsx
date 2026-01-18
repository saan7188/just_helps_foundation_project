import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#1F2937', color: '#9CA3AF', padding: '60px 0 30px', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* Column 1: Brand */}
          <div>
            <h3 style={{ color: 'white', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               Just<span style={{ color: '#D97706' }}>Helps</span>
            </h3>
            <p style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
              Bridging the gap between empathy and action. We ensure your small contributions create massive impacts in real lives.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '15px' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
              <li><Link to="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link></li>
              <li><Link to="/create" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Start a Fundraiser</Link></li>
              <li><Link to="/login" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Login / Register</Link></li>
                         </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '15px' }}>Contact</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <strong>Email:</strong> support@justhelps.org<br/>
              <strong>Phone:</strong> +91 98765 43210<br/>
              <strong>Location:</strong> Tamil Nadu, India
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid #374151', paddingTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          © 2024 JustHelps Foundation. All rights reserved.
        </div>
      </div>
    </footer>
  );
}