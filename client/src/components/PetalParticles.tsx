import { useEffect, useRef } from 'react';
import './PetalParticles.css';

interface Petal {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  drift: number;
  opacity: number;
  rotationSpeed: number;
}

export default function PetalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const petalCount = Math.min(25, Math.floor(window.innerWidth / 60));

    const createPetal = (id: number): Petal => ({
      id,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 12 + 6,
      rotation: Math.random() * 360,
      speed: Math.random() * 0.8 + 0.3,
      drift: Math.random() * 0.5 - 0.25,
      opacity: Math.random() * 0.4 + 0.2,
      rotationSpeed: Math.random() * 2 - 1,
    });

    petalsRef.current = Array.from({ length: petalCount }, (_, i) => createPetal(i));

    const drawPetal = (petal: Petal) => {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate((petal.rotation * Math.PI) / 180);
      ctx.globalAlpha = petal.opacity;

      // Draw petal shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        petal.size / 2, -petal.size / 2,
        petal.size, -petal.size / 4,
        petal.size, 0
      );
      ctx.bezierCurveTo(
        petal.size, petal.size / 4,
        petal.size / 2, petal.size / 2,
        0, 0
      );

      const gradient = ctx.createRadialGradient(
        petal.size / 2, 0, 0,
        petal.size / 2, 0, petal.size
      );
      gradient.addColorStop(0, '#fde8ef');
      gradient.addColorStop(0.5, '#f8c8d4');
      gradient.addColorStop(1, '#f4a4b8');

      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach((petal) => {
        petal.y += petal.speed;
        petal.x += Math.sin(petal.y * 0.01) * 0.5 + petal.drift;
        petal.rotation += petal.rotationSpeed;

        if (petal.y > canvas.height + 20) {
          petal.y = -20;
          petal.x = Math.random() * canvas.width;
        }
        if (petal.x > canvas.width + 20) petal.x = -20;
        if (petal.x < -20) petal.x = canvas.width + 20;

        drawPetal(petal);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="petal-canvas" />;
}
