import React, { useRef, useEffect } from 'react';

const styleId = 'hero3d-styles';
if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes glow-pulse {
      0%, 100% { text-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.2), 0 0 80px rgba(139,92,246,0.1); }
      50% { text-shadow: 0 0 30px rgba(139,92,246,0.6), 0 0 60px rgba(139,92,246,0.4), 0 0 120px rgba(139,92,246,0.2); }
    }
    @keyframes glow-spread {
      0% { opacity: 0.3; transform: scale(0.95); }
      50% { opacity: 0.6; transform: scale(1.05); }
      100% { opacity: 0.3; transform: scale(0.95); }
    }
    @keyframes particle-drift {
      0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-200px) translateX(50px) scale(0); opacity: 0; }
    }
    .hero-glow-text {
      animation: float 6s ease-in-out infinite, glow-pulse 3s ease-in-out infinite;
      background: linear-gradient(135deg, #c084fc 0%, #8b5cf6 30%, #6366f1 60%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 900;
      letter-spacing: 2px;
    }
    .hero-glow-ring {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
      animation: glow-spread 4s ease-in-out infinite;
      pointer-events: none;
    }
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #8b5cf6;
      animation: particle-drift 8s ease-out infinite;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

function Particles() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const particles = [];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.bottom = `${Math.random() * 30}%`;
      p.style.animationDelay = `${Math.random() * 8}s`;
      p.style.animationDuration = `${6 + Math.random() * 4}s`;
      p.style.width = p.style.height = `${2 + Math.random() * 4}px`;
      p.style.opacity = '0';
      container.appendChild(p);
      particles.push(p);
    }
    return () => particles.forEach(p => p.remove());
  }, []);

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />;
}

export default function Hero3D() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#020617] via-[#0a0a1a] to-[#1a0533] flex items-center justify-center overflow-hidden">
      <div className="hero-glow-ring" style={{ width: '500px', height: '500px', top: '10%', right: '-10%', animationDelay: '0s' }} />
      <div className="hero-glow-ring" style={{ width: '400px', height: '400px', bottom: '5%', left: '-15%', animationDelay: '2s' }} />
      <div className="hero-glow-ring" style={{ width: '300px', height: '300px', top: '40%', left: '40%', animationDelay: '1s' }} />
      <Particles />
      <div className="relative z-10 text-center px-4">
        <h2 className="hero-glow-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
          Build Your<br />Vision To Life
        </h2>
        <div className="mt-6 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      </div>
    </div>
  );
}
