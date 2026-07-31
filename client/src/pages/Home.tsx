import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Palette, ArrowRight, Users, ExternalLink } from 'lucide-react';
import clipVideo from '../assets/clip.mp4';
import './Home.css';

function useParallax() {
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      refs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const windowH = window.innerHeight;
        const scrolled = (windowH - rect.top) / (windowH + rect.height);
        const offset = (scrolled - 0.5) * 60;
        el.style.transform = `translateY(${offset}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el;
  };

  return setRef;
}

export default function Home() {
  const setParallaxRef = useParallax();

  return (
    <main>
      {/* Hero Section — video prominent */}
      <section className="hero">
        <div className="hero-video-wrapper">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={clipVideo} type="video/mp4" />
          </video>
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <div className="hero-logo-wrapper">
            <img src="/icon.png" alt="DrPumpkinHead" className="hero-logo" />
            <img src="/comop.png" alt="Commissions Open" className="hero-comop" />
          </div>
          <div className="hero-actions">
            <Link to="/prices" className="btn btn-primary">
              <Palette size={18} />
              View Pricing
            </Link>
            <Link to="/queue" className="btn btn-secondary">
              <Users size={18} />
              View Queue
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator">
          <div className="scroll-line" />
        </div>
      </section>

      {/* About Section */}
      <section className="about-section section">
        <div className="section-decoration about-deco">
          <div className="deco-blob blob-1" />
          <div className="deco-blob blob-2" />
        </div>
        <div className="container">
          <div className="about-content">
            <img src="/avatar.png" alt="DrPumpkinHead avatar" className="about-avatar" ref={setParallaxRef(0)} />
            <div className="about-text" ref={setParallaxRef(1)}>
              <img src="/aboutme.png" alt="About Me" className="aboutme-heading-img" />
              <p>
                hi im rits! i think i can draw but you never really know unless you explore
                this website or stalk my account. anyway internship just started and were also
                working on our thesis so, i need funds like every struggling college student.
                look around if youd like!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section — video background */}
      <section className="gallery-section section">
        <video
          className="gallery-bg-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/portvid.mp4" type="video/mp4" />
        </video>
        <div className="portfolio-cta">
          <a
            href="https://toyhou.se/drpumpkinhead/art"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            View More Projects Here <ExternalLink size={16} />
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-content">
            <img src="/ready.png" alt="Ready to Commission?" className="cta-heading-img" />
            <p>Check out my pricing and let's create something amazing together!</p>
            <Link to="/prices" className="btn btn-primary">
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
