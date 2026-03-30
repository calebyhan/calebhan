'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const MAX_PARTICLES = 170;
const MIN_PARTICLES = 70;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createParticles(width, height, count) {
  const particles = [];

  for (let i = 0; i < count; i += 1) {
    const driftX = (Math.random() - 0.5) * 0.14;
    const driftY = (Math.random() - 0.5) * 0.14;

    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: driftX,
      vy: driftY,
      driftX,
      driftY,
      size: 0.7 + Math.random() * 1.5,
      alpha: 0.16 + Math.random() * 0.25,
    });
  }

  return particles;
}

export default function ParticleField() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') {
      return;
    }

    const pointerMedia = window.matchMedia('(pointer: fine)');
    if (!pointerMedia.matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const cursor = { x: -1000, y: -1000, active: false };
    let frameId = 0;
    let dpr = 1;
    let width = 0;
    let height = 0;
    let particles = [];

    const resize = () => {
      dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.floor((width * height) / 18000);
      const count = clamp(density, MIN_PARTICLES, MAX_PARTICLES);
      particles = createParticles(width, height, count);
    };

    const animate = () => {
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];

        if (cursor.active) {
          const dx = particle.x - cursor.x;
          const dy = particle.y - cursor.y;
          const distance = Math.hypot(dx, dy);
          const radius = 120;

          if (distance > 0 && distance < radius) {
            const repel = ((radius - distance) / radius) * 0.24;
            particle.vx += (dx / distance) * repel;
            particle.vy += (dy / distance) * repel;
          }
        }

        particle.vx += (particle.driftX - particle.vx) * 0.028;
        particle.vy += (particle.driftY - particle.vy) * 0.028;

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.y > height + 12) particle.y = -12;

        context.beginPath();
        context.fillStyle = `rgba(148, 230, 255, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      frameId = window.requestAnimationFrame(animate);
    };

    const handleMove = (event) => {
      cursor.x = event.clientX;
      cursor.y = event.clientY;
      cursor.active = true;
    };

    const handleLeave = () => {
      cursor.active = false;
    };

    resize();
    frameId = window.requestAnimationFrame(animate);

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerleave', handleLeave);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerleave', handleLeave);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null;
  }

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />;
}