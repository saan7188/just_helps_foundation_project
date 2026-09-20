import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>Just<span>Helps</span></h3>
          <p>Needs-first giving, with campaigns reviewed before they are published.</p>
        </div>

        <div>
          <h4>Platform</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/causes">Explore causes</Link></li>
            <li><Link to="/create">Start a fundraiser</Link></li>
            <li><Link to="/login">Fundraiser login</Link></li>
          </ul>
        </div>

        <div>
          <h4>About this build</h4>
          <p>This is a portfolio project. Donations are simulated and no real payment credentials are processed.</p>
          <Link to="/admin-login" className="footer-admin-link">Admin portal</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        © 2026 Just Helps · Portfolio project
      </div>
    </footer>
  );
}
