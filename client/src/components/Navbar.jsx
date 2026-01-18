import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token'); 
  const location = useLocation(); // To check current page

  // Check if we are on the Admin Page
  const isAdminPage = location.pathname === '/admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav style={{ 
      padding: '18px 0', borderBottom: '1px solid #F3F4F6', background: 'white',
      position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* LOGO (Unchanged) */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: '#FFFBEB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 4C9.5 4 12 4.5 13 6C15.5 9 17 12 17 16C17 19 14 21 10 21C7 21 5 19 5 15C5 11 6 8 8.5 4Z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M8.5 4C7.5 3 6 3 5 4" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
              <path d="M9 8C10 9 11 11 11 14" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1F2937', letterSpacing: '-0.5px', lineHeight: 1 }}>
            Just <span style={{ color: '#D97706' }}>Helps</span>
          </span>
        </Link>

        {/* LINKS */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          
          {/* HIDE 'Home' if on Admin Page */}
          {!isAdminPage && (
            <Link to="/" style={{ textDecoration: 'none', color: '#4B5563', fontWeight: '700', fontSize: '0.95rem' }}>
              Home
            </Link>
          )}

          {token ? (
            <>
              {/* HIDE 'Your Campaign' if on Admin Page */}
              {!isAdminPage && (
                <Link to="/create" style={{ textDecoration: 'none', color: '#4B5563', fontWeight: '700', fontSize: '0.95rem' }}>
                  Your Campaign
                </Link>
              )}
              
              {/* Logout Button (Always visible if logged in) */}
              <button 
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: '700', fontSize: '0.95rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <button className="btn" style={{ background: '#1F2937', color: 'white', padding: '12px 24px', fontSize: '0.9rem', borderRadius: '50px', fontWeight: '700' }}>
                Fundraiser Login
              </button>
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}