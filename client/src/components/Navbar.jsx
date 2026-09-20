import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="site-nav">
      <div className="container nav-inner">
        <Link to="/" className="brand"><span className="brand-mark">♥</span><span>Just <b>Helps</b></span></Link>
        <div className="nav-links">
          <Link to="/causes">Explore</Link>
          <Link to="/donate?category=Food">Donate</Link>
          {isAuthenticated && !isAdmin && <Link to="/dashboard">My fundraisers</Link>}
          {isAdmin && <Link to="/admin">Admin</Link>}
          {isAuthenticated ? <button className="nav-logout" onClick={() => { logout(); window.location.href='/'; }}>Logout</button> : <Link className="nav-login" to="/login">Fundraiser login</Link>}
        </div>
      </div>
    </nav>
  );
}
