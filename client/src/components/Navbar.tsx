import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Always show navbar near the top of the page
      if (currentY <= 50) {
        setHidden(false);
      } else if (currentY > lastScrollY.current) {
        // Scrolling down → hide
        setHidden(true);
      } else {
        // Scrolling up → show
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/prices', label: 'Price List' },
    { path: '/queue', label: 'Queue' },
    { path: '/socials', label: 'Socials' },
  ];

  const handleNavClick = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`navbar ${hidden ? 'navbar--hidden' : ''}`}>
      <div className="navbar-container">
        <button
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
          {/* Mobile logo */}
          <li className="mobile-nav-brand">
            <img src="/icon.png" alt="DrPumpkinHead" className="mobile-nav-logo" />
          </li>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile overlay backdrop */}
      {isOpen && <div className="navbar-backdrop" onClick={() => setIsOpen(false)} />}
    </nav>
  );
}
