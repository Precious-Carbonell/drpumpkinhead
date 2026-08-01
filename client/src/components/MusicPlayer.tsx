import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import './MusicPlayer.css';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    const audio = new Audio('/fragilehearts.mp3');
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Attempt autoplay immediately
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Browser blocked autoplay - wait for first user interaction then play
        const resumeOnInteraction = () => {
          audio.play().then(() => setPlaying(true)).catch(() => {});
          document.removeEventListener('click', resumeOnInteraction);
          document.removeEventListener('keydown', resumeOnInteraction);
          document.removeEventListener('touchstart', resumeOnInteraction);
        };
        document.addEventListener('click', resumeOnInteraction);
        document.addEventListener('keydown', resumeOnInteraction);
        document.addEventListener('touchstart', resumeOnInteraction);
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="music-player" onMouseEnter={() => setShowSlider(true)} onMouseLeave={() => setShowSlider(false)}>
      {showSlider && (
        <div className="music-slider-wrapper">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="music-slider"
            aria-label="Volume"
          />
        </div>
      )}
      <button className="music-toggle" onClick={toggle} aria-label={playing ? 'Mute music' : 'Play music'}>
        {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </div>
  );
}
