import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img src="/icon.png" alt="DrPumpkinHead" className="footer-logo" />
          <p className="footer-tagline">First we mine, then we craft. Let's minecraft :D</p>
        </div>

        <div className="footer-links">
          <h4>Navigate</h4>
          <Link to="/">Home</Link>
          <Link to="/prices">Price List</Link>
          <Link to="/queue">Queue</Link>
          <Link to="/socials">Socials</Link>
        </div>

        <div className="footer-links">
          <h4>Commission</h4>
          <Link to="/prices">View Pricing</Link>
          <Link to="/queue">Check Queue Status</Link>
        </div>

        <div className="footer-links">
          <h4>Find Me</h4>
          <a href="https://www.facebook.com/profile.php?id=61556460651772" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://www.instagram.com/felloutofthearts/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.tiktok.com/@ritsover" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="https://youtube.com/@rualryt" target="_blank" rel="noopener noreferrer">YouTube</a>
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
