import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const navigate = useNavigate();

  const handleNav = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img src="/icon.png" alt="DrPumpkinHead" className="footer-logo" />
          <p className="footer-tagline">First we mine, then we craft. Let's minecraft :D</p>
        </div>

        <div className="footer-links">
          <h4>Navigate</h4>
          <Link to="/" onClick={handleNav('/')}>Home</Link>
          <Link to="/prices" onClick={handleNav('/prices')}>Price List</Link>
          <Link to="/queue" onClick={handleNav('/queue')}>Queue</Link>
          <Link to="/socials" onClick={handleNav('/socials')}>Socials</Link>
        </div>

        <div className="footer-links">
          <h4>Commission</h4>
          <Link to="/prices" onClick={handleNav('/prices')}>View Pricing</Link>
          <Link to="/queue" onClick={handleNav('/queue')}>Check Queue Status</Link>
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
          Your favorite chud, DrPumpkinHead &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
