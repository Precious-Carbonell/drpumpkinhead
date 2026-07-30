import './Socials.css';

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61556460651772',
    username: 'DrPumpkinHead',
    image: '/links/w-fb.png',
    color: 'rgba(173, 216, 255, 0.88)',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/felloutofthearts/',
    username: '@felloutofthearts',
    image: '/links/w-ig.png',
    color: 'rgba(255, 182, 210, 0.88)',
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@ritsover',
    username: '@ritsover',
    image: '/links/w-tt.png',
    color: 'rgba(200, 200, 220, 0.88)',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@rualryt',
    username: '@rualryt',
    image: '/links/w-yt.png',
    color: 'rgba(255, 180, 180, 0.88)',
  },
];

export default function Socials() {
  return (
    <main className="socials-page">
      <div className="container">
        <div className="socials-header">
          <img src="/cone.png" alt="Connect With Me" className="socials-heading-img" />
        </div>

        <div className="socials-row">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-tile"
              style={{ '--overlay-color': social.color } as React.CSSProperties}
            >
              <img src={social.image} alt={social.name} className="social-tile-img" />
              <div className="social-tile-overlay">
                <span className="social-tile-name">{social.name}</span>
                <span className="social-tile-username">{social.username}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
