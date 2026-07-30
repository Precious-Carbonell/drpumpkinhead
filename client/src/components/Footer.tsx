import { Cherry, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Cherry size={24} className="footer-icon" />
          <span className="footer-name">DrPumpkinHead</span>
          <p className="footer-tagline">Bringing imagination to life, one commission at a time.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/prices">Price List</Link>
          <Link to="/queue">Queue</Link>
          <Link to="/socials">Socials</Link>
        </div>

        <div className="footer-links">
          <h4>Commission Info</h4>
          <Link to="/prices">View Pricing</Link>
          <Link to="/queue">Check Queue</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          Made with <Heart size={14} className="heart-icon" /> by DrPumpkinHead &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
