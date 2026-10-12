import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="site-nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="Just Helps home">
          <span className="brand-wordmark"><span>Just</span> <b>Helps</b></span>
        </Link>
        <div className="nav-links">
          <Link to="/causes">Explore causes</Link>
          <Link to="/donate?category=Food">Donate <span aria-hidden="true">↗</span></Link>
          {isAuthenticated && <Link to="/dashboard">My fundraisers</Link>}
          {isAuthenticated
            ? <button className="nav-logout" onClick={() => { logout(); window.location.href = '/'; }}>Logout</button>
            : <Link className="nav-login" to="/login">Fundraiser login <span aria-hidden="true">↗</span></Link>}
        </div>
      </div>
    </nav>
  );
}
