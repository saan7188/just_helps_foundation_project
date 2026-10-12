import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-column">
          <h3>JUST<span>HELPS</span><i aria-hidden="true">.</i></h3>
          <p>Small acts can change the shape of someone's day. Find a need, understand the story, and help in a way that matters.</p>
        </div>

        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/causes">Causes & campaigns</Link></li>
            <li><Link to="/donate?category=Food">Make a donation</Link></li>
            <li><Link to="/create">Start a fundraiser</Link></li>
          </ul>
        </div>

        <div>
          <h4>Giving, with care.</h4>
          <p>Take a moment to read each campaign, understand the goal, and choose the cause that speaks to you.</p>
          <Link to="/causes" className="footer-cta">Find a cause <span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>JUST HELPS</span>
        <span>Make kindness count.</span>
      </div>
    </footer>
  );
}
