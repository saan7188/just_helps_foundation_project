import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, role, logout } = useAuth();
  return (
    <nav className="site-nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="Just Helps home">
          <span className="brand-wordmark"><span>Just</span> <b>Helps</b></span>
        </Link>
        <div className="nav-links">
          <Link to="/causes">Explore needs</Link>
          {isAuthenticated && !isAdmin && role === 'donor' && <Link to="/donor-dashboard">My donations</Link>}
          {isAuthenticated && !isAdmin && role !== 'donor' && <Link to="/dashboard">My fundraisers</Link>}
          {isAuthenticated && isAdmin && <Link to="/admin">Admin controls</Link>}
          {isAuthenticated
            ? <button className="nav-logout" onClick={() => { logout(); window.location.href = '/'; }}>Logout</button>
            : <><Link to="/login">Login</Link><Link className="nav-login" to="/register">Register</Link></>}
        </div>
      </div>
    </nav>
  );
}
