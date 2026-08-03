import { useEffect, useRef } from 'react';
import './CursorPetals.css';

interface Petal {
  el: HTMLDivElement;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  vx: number;
  vy: number;
  vr: number;
  life: number;
}

export default function CursorPetals() {
  const containerRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastSpawnRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      const now = Date.now();
      if (now - lastSpawnRef.current > 60) {
        spawnPetal(e.clientX, e.clientY);
        lastSpawnRef.current = now;
      }
    };

    const spawnPetal = (x: number, y: number) => {
      const el = document.createElement('div');
      el.className = 'cursor-petal';

      // Randomize petal shape variant
      const variant = Math.floor(Math.random() * 3);
      el.classList.add(`petal-shape-${variant}`);

      container.appendChild(el);

      const petal: Petal = {
        el,
        x,
        y,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.6,
        opacity: 1,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.5 + Math.random() * 1.5,
        vr: (Math.random() - 0.5) * 4,
        life: 1,
      };

      petalsRef.current.push(petal);
    };

    const animate = () => {
      const petals = petalsRef.current;

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.life -= 0.015;
        p.opacity = Math.max(0, p.life);
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        if (p.life <= 0) {
          p.el.remove();
          petals.splice(i, 1);
        } else {
          p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg) scale(${p.scale})`;
          p.el.style.opacity = String(p.opacity);
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameRef.current);
      petalsRef.current.forEach(p => p.el.remove());
      petalsRef.current = [];
    };
  }, []);

  return <div ref={containerRef} className="cursor-petals-container" />;
}
