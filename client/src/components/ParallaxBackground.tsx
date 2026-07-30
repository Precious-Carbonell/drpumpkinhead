import './ParallaxBackground.css';

export default function ParallaxBackground() {
  return (
    <div className="parallax-bg">
      {/* Sky gradient layer - fixed, no movement */}
      <div className="parallax-layer sky-layer" />

      {/* Branch layer */}
      <div className="parallax-layer branch-layer">
        <svg className="branch branch-left" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 Q80,100 60,200 Q40,280 80,350" stroke="#8b6b5a" strokeWidth="3" fill="none" opacity="0.4" />
          <circle cx="50" cy="120" r="8" fill="#f8c8d4" opacity="0.7" />
          <circle cx="70" cy="160" r="6" fill="#fde8ef" opacity="0.6" />
          <circle cx="40" cy="200" r="9" fill="#f4a4b8" opacity="0.5" />
          <circle cx="65" cy="240" r="7" fill="#f8c8d4" opacity="0.7" />
          <circle cx="55" cy="90" r="5" fill="#fde8ef" opacity="0.6" />
          <circle cx="75" cy="300" r="8" fill="#f8c8d4" opacity="0.5" />
        </svg>

        <svg className="branch branch-right" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M300,80 Q220,130 240,230 Q260,310 220,380" stroke="#8b6b5a" strokeWidth="3" fill="none" opacity="0.4" />
          <circle cx="250" cy="140" r="7" fill="#f8c8d4" opacity="0.6" />
          <circle cx="235" cy="180" r="9" fill="#fde8ef" opacity="0.7" />
          <circle cx="245" cy="230" r="6" fill="#f4a4b8" opacity="0.5" />
          <circle cx="230" cy="280" r="8" fill="#f8c8d4" opacity="0.6" />
          <circle cx="255" cy="110" r="5" fill="#fde8ef" opacity="0.7" />
          <circle cx="225" cy="340" r="7" fill="#f4a4b8" opacity="0.5" />
        </svg>
      </div>

      {/* Decorative floating blossoms */}
      <div className="parallax-layer blossom-layer">
        <div className="floating-blossom b1" />
        <div className="floating-blossom b2" />
        <div className="floating-blossom b3" />
        <div className="floating-blossom b4" />
        <div className="floating-blossom b5" />
      </div>
    </div>
  );
}
