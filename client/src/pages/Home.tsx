import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, ArrowRight, Users, X as XIcon, ExternalLink } from 'lucide-react';
import clipVideo from '../assets/clip.mp4';
import './Home.css';

// Portfolio images from public/portfolio
const portfolioImages = [
  { src: '/portfolio/1.jpg', alt: 'Artwork 1 by DrPumpkinHead' },
  { src: '/portfolio/2.jpg', alt: 'Artwork 2 by DrPumpkinHead' },
  { src: '/portfolio/3.jpg', alt: 'Artwork 3 by DrPumpkinHead' },
  { src: '/portfolio/4.jpg', alt: 'Artwork 4 by DrPumpkinHead' },
  { src: '/portfolio/5.jpg', alt: 'Artwork 5 by DrPumpkinHead' },
  { src: '/portfolio/6.jpg', alt: 'Artwork 6 by DrPumpkinHead' },
];

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

function FlowerCarousel() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(index);
    }
  };

  const handleLightboxKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <>
      {/* SVG clip-path definition for teardrop petal shape */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="petal-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,1 C0.15,0.78 0,0.45 0.08,0.22 C0.16,0.06 0.35,0 0.5,0 C0.65,0 0.84,0.06 0.92,0.22 C1,0.45 0.85,0.78 0.5,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Desktop: flower carousel */}
      <div
        className={`flower-carousel ${hovered ? 'paused' : ''}`}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flower-center" />
        {portfolioImages.map((img, i) => {
          const angle = (360 / portfolioImages.length) * i;
          return (
            <div
              key={i}
              className="petal-wrapper"
              style={{ '--angle': `${angle}deg` } as React.CSSProperties}
              onMouseEnter={() => setHovered(true)}
            >
              <button
                className="petal"
                onClick={() => openLightbox(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                aria-label={img.alt}
                tabIndex={0}
              >
                <img src={img.src} alt={img.alt} loading="lazy" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="flower-carousel-mobile">
        {portfolioImages.map((img, i) => (
          <button
            key={i}
            className="petal-mobile"
            onClick={() => openLightbox(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            aria-label={img.alt}
            tabIndex={0}
          >
            <img src={img.src} alt={img.alt} loading="lazy" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          onKeyDown={handleLightboxKey}
          role="dialog"
          aria-modal="true"
          aria-label="Artwork lightbox"
          tabIndex={-1}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
              <XIcon size={24} />
            </button>
            <img
              src={portfolioImages[lightboxIndex].src}
              alt={portfolioImages[lightboxIndex].alt}
            />
          </div>
        </div>
      )}
    </>
  );
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

      {/* Portfolio Section — flower carousel */}
      <section className="gallery-section section">
        <div className="section-decoration gallery-deco">
          <div className="deco-blob blob-3" />
          <div className="deco-blob blob-4" />
        </div>
        <div className="container">
          <h2 className="section-title" ref={setParallaxRef(2)}>
            <img src="/womb.png" alt="Portfolio" className="section-title-img" />
          </h2>
          <FlowerCarousel />
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
