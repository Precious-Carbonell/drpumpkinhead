import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, ArrowRight, Users, ExternalLink, X } from 'lucide-react';
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
  const [showAlphaModal, setShowAlphaModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

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

      </section>

      {/* About Section */}
      <section className="about-section section">
        <div className="section-decoration about-deco">
          <div className="deco-blob blob-1" />
          <div className="deco-blob blob-2" />
        </div>
        <div className="container">
          <div className="about-content">
          <div className="about-avatar-wrapper" onClick={() => setShowAlphaModal(true)}>
            <img src="/avatar.png" alt="DrPumpkinHead avatar" className="about-avatar" ref={setParallaxRef(0)} />
            <img src="/clickme.png" alt="Click me!" className="about-clickme" />
          </div>
            <div className="about-text" ref={setParallaxRef(1)}>
              <img src="/aboutme.png" alt="About Me" className="aboutme-heading-img" />
              <p>
                Hi, I'm Rits! I think I can draw but you never really know unless you explore
                this website or stalk my account. Anyway, internship just started and were also
                working on our thesis so, I need funds like every struggling college student.
                Look around if you'd like!
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
      {/* Alpha Modal */}
      {showAlphaModal && (
        <div className="alpha-modal-overlay" onClick={() => setShowAlphaModal(false)}>
          <div className="alpha-modal" onClick={e => e.stopPropagation()}>
            <button className="alpha-modal-close" onClick={() => setShowAlphaModal(false)}>
              <X size={18} />
            </button>
            <h3>Do you want to see my alpha side?</h3>
            <div className="alpha-modal-actions">
              <button className="btn btn-primary" onClick={() => { setShowAlphaModal(false); setShowVideo(true); }}>Yes</button>
              <button className="btn btn-primary" onClick={() => { setShowAlphaModal(false); setShowVideo(true); }}>Definitely</button>
              <button className="btn btn-primary" onClick={() => { setShowAlphaModal(false); setShowVideo(true); }}>Absolutely</button>
            </div>
          </div>
        </div>
      )}

      {/* Alpha Video Player */}
      {showVideo && (
        <div className="alpha-modal-overlay" onClick={() => setShowVideo(false)}>
          <div className="alpha-video-modal" onClick={e => e.stopPropagation()}>
            <button className="alpha-modal-close" onClick={() => setShowVideo(false)}>
              <X size={18} />
            </button>
            <video autoPlay controls className="alpha-video">
              <source src="/chud.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </main>
  );
}
