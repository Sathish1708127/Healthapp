import React, { useEffect, useRef } from 'react';

export default function BiotechBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let scrollY = window.scrollY;
    let lastScrollY = scrollY;
    let scrollVelocity = 0;

    let mouseX = -1000;
    let mouseY = -1000;

    // Particles array
    const particleCount = Math.min(Math.floor((width * height) / 32000), 45);
    const particles = [];

    const colors = [
      'rgba(16, 185, 129, ', // Emerald
      'rgba(6, 182, 212, ',  // Cyan
      'rgba(56, 189, 248, ', // Blue
      'rgba(168, 85, 247, ', // Purple
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.2,
        baseRadius: Math.random() * 2.2 + 1.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseVal: Math.random() * Math.PI,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.35 + 0.15,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      scrollVelocity = (scrollY - lastScrollY) * 0.15;
      lastScrollY = scrollY;
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    let lastTime = performance.now();
    const render = (time) => {
      const dt = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Dampen scroll velocity
      scrollVelocity *= 0.92;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx * dt;
        p.y += (p.vy - scrollVelocity) * dt;

        // Wrap boundaries
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Pulse size
        p.pulseVal += p.pulseSpeed * dt;
        const currentRadius = p.baseRadius + Math.sin(p.pulseVal) * 0.8;

        // Mouse interaction (gentle displacement)
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.x -= (dx / dist) * force * 2;
          p.y -= (dy / dist) * force * 2;
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(currentRadius, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorBase}${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distNodes = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxDist = 130;

          if (distNodes < maxDist) {
            const lineAlpha = (1 - distNodes / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Dynamic ambient background glow circles that subtly rotate and float */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'floatSlow 20s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '5%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'floatSlow 25s ease-in-out infinite alternate-reverse',
        }}
      />
      {/* Canvas for live particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.85,
        }}
      />
    </div>
  );
}
