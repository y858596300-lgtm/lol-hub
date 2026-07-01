"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface PulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface Crystal {
  x: number;
  y: number;
  pulseTimer: number;
  pulseInterval: number;
  size: number;
  isMain?: boolean;
}

const HEX_SIZE = 60;
const PARTICLE_COUNT = 60;
const CRYSTAL_COUNT = 10;

export default function HextechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let particles: Particle[] = [];
    let pulseRings: PulseRing[] = [];
    let crystals: Crystal[] = [];
    let time = 0;
    let surgeActive = false;
    let surgeStartTime = 0;
    const SURGE_DURATION = 40; // frames

    // Expose trigger via window for external access
    ((window as unknown) as Record<string, unknown>).__hextechSurge = () => {
      if (!surgeActive) {
        surgeActive = true;
        surgeStartTime = time;
        for (const crystal of crystals) {
          const maxR = crystal.isMain ? 400 : 180 + Math.random() * 100;
          pulseRings.push({
            x: crystal.x,
            y: crystal.y,
            radius: 0,
            maxRadius: maxR,
            alpha: 0.8,
          });
        }
      }
    };

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      initCrystals();
    }

    function createParticle(x?: number, y?: number): Particle {
      const cx = x ?? Math.random() * canvas!.width;
      const cy = y ?? Math.random() * canvas!.height;
      return {
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        life: Math.random() * 300,
        maxLife: Math.random() * 300 + 200,
      };
    }

    function initParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle());
    }

    function initCrystals() {
      crystals = [];
      const cx = canvas!.width / 2;
      const cy = canvas!.height / 2;

      // Main crystal at center
      crystals.push({
        x: cx,
        y: cy * 0.45,
        pulseTimer: 0,
        pulseInterval: 150,
        size: 3.5,
        isMain: true,
      });

      // Secondary crystals spread around
      const cols = Math.ceil(canvas!.width / HEX_SIZE / 1.5) + 1;
      const rows = Math.ceil(canvas!.height / HEX_SIZE) + 1;
      const usedPositions = new Set<string>();
      usedPositions.add("center");

      for (let i = 0; i < CRYSTAL_COUNT; i++) {
        const col = Math.floor(Math.random() * cols);
        const row = Math.floor(Math.random() * rows);
        const key = `${col},${row}`;
        if (usedPositions.has(key)) continue;
        usedPositions.add(key);

        const offsetX = row % 2 === 0 ? 0 : HEX_SIZE * 0.75;
        const x = col * HEX_SIZE * 1.5 + offsetX;
        const y = row * HEX_SIZE * Math.sin(Math.PI / 3);

        crystals.push({
          x,
          y,
          pulseTimer: Math.random() * 200,
          pulseInterval: 200 + Math.random() * 300,
          size: Math.random() * 2 + 1.5,
        });
      }
    }

    function drawHexagon(x: number, y: number, size: number, alpha: number) {
      ctx!.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx!.moveTo(hx, hy);
        else ctx!.lineTo(hx, hy);
      }
      ctx!.closePath();
      ctx!.strokeStyle = `rgba(10, 180, 255, ${alpha})`;
      ctx!.lineWidth = 0.5;
      ctx!.stroke();
    }

    function drawCrystal(crystal: Crystal) {
      const { x, y, size, isMain } = crystal;
      const auraSize = isMain ? size * 8 : size * 6;

      // Glow aura
      const gradient = ctx!.createRadialGradient(x, y, 0, x, y, auraSize);
      gradient.addColorStop(0, isMain ? "rgba(124, 58, 237, 0.5)" : "rgba(124, 58, 237, 0.3)");
      gradient.addColorStop(0.4, "rgba(10, 180, 255, 0.1)");
      gradient.addColorStop(1, "rgba(10, 180, 255, 0)");
      ctx!.beginPath();
      ctx!.arc(x, y, auraSize, 0, Math.PI * 2);
      ctx!.fillStyle = gradient;
      ctx!.fill();

      // Rotating portion
      ctx!.save();
      ctx!.translate(x, y);
      const rotSpeed = isMain ? 0.001 : 0.0005;
      ctx!.rotate(time * rotSpeed + x * 0.001);

      // Inner bright core
      const coreGradient = ctx!.createRadialGradient(0, 0, 0, 0, 0, size * 2.5);
      coreGradient.addColorStop(0, "rgba(200, 230, 255, 0.95)");
      coreGradient.addColorStop(0.25, "rgba(10, 180, 255, 0.7)");
      coreGradient.addColorStop(1, "rgba(124, 58, 237, 0)");
      ctx!.beginPath();
      ctx!.arc(0, 0, size * 2.5, 0, Math.PI * 2);
      ctx!.fillStyle = coreGradient;
      ctx!.fill();

      // Diamond
      ctx!.beginPath();
      ctx!.moveTo(0, -size * 1.5);
      ctx!.lineTo(size, 0);
      ctx!.lineTo(0, size * 1.5);
      ctx!.lineTo(-size, 0);
      ctx!.closePath();
      ctx!.fillStyle = `rgba(10, 180, 255, ${isMain ? 0.5 : 0.4})`;
      ctx!.fill();
      ctx!.strokeStyle = `rgba(200, 230, 255, ${isMain ? 0.8 : 0.7})`;
      ctx!.lineWidth = isMain ? 1.5 : 1;
      ctx!.stroke();

      // Inner hex for main crystal
      if (isMain) {
        ctx!.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const hx = size * 1.8 * Math.cos(angle);
          const hy = size * 1.8 * Math.sin(angle);
          if (i === 0) ctx!.moveTo(hx, hy);
          else ctx!.lineTo(hx, hy);
        }
        ctx!.closePath();
        ctx!.strokeStyle = "rgba(10, 180, 255, 0.5)";
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      ctx!.restore();
    }

    function drawPulseRing(ring: PulseRing) {
      const progress = ring.radius / ring.maxRadius;
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out
      const alpha = ring.alpha * (1 - ease);

      ctx!.beginPath();
      ctx!.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(10, 180, 255, ${alpha * 0.6})`;
      ctx!.lineWidth = progress < 0.1 ? 2 : 1.2;
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(ring.x, ring.y, ring.radius * 0.7, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(124, 58, 237, ${alpha * 0.4})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();
    }

    function drawParticle(p: Particle) {
      const cx = canvas!.width / 2;
      const cy = canvas!.height / 2;

      // Gentle attraction toward center
      if (!surgeActive) {
        const dx = cx - p.x;
        const dy = cy * 0.45 - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        p.vx += (dx / dist) * 0.0005;
        p.vy += (dy / dist) * 0.0005;
        // Clamp speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.8) {
          p.vx = (p.vx / speed) * 0.8;
          p.vy = (p.vy / speed) * 0.8;
        }
      }

      const lifeRatio = p.life / p.maxLife;
      const alpha = p.alpha * (1 - lifeRatio * lifeRatio);

      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(125, 216, 255, ${alpha})`;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(125, 216, 255, ${alpha * 0.12})`;
      ctx!.fill();
    }

    function animate() {
      time++;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Surge flash overlay
      if (surgeActive) {
        const elapsed = time - surgeStartTime;
        const flashAlpha = Math.max(0, 0.15 * (1 - elapsed / SURGE_DURATION));
        ctx!.fillStyle = `rgba(10, 180, 255, ${flashAlpha})`;
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

        if (elapsed >= SURGE_DURATION) {
          surgeActive = false;
          // surge complete
        }
      }

      // Hex grid
      const cols = Math.ceil(canvas!.width / HEX_SIZE / 1.5) + 1;
      const rows = Math.ceil(canvas!.height / HEX_SIZE) + 1;
      for (let col = -1; col <= cols; col++) {
        for (let row = -1; row <= rows; row++) {
          const offsetX = row % 2 === 0 ? 0 : HEX_SIZE * 0.75;
          const x = col * HEX_SIZE * 1.5 + offsetX;
          const y = row * HEX_SIZE * Math.sin(Math.PI / 3);
          drawHexagon(x, y, HEX_SIZE * 0.45, 0.035);
        }
      }

      // Crystals
      for (const crystal of crystals) {
        drawCrystal(crystal);
        crystal.pulseTimer++;
        if (crystal.pulseTimer >= crystal.pulseInterval) {
          crystal.pulseTimer = 0;
          pulseRings.push({
            x: crystal.x,
            y: crystal.y,
            radius: 0,
            maxRadius: crystal.isMain ? 200 : 100 + Math.random() * 80,
            alpha: crystal.isMain ? 0.6 : 0.4 + Math.random() * 0.3,
          });
        }
      }

      // Pulse rings
      pulseRings = pulseRings.filter((ring) => {
        const speed = surgeActive ? 4 : 1.2;
        ring.radius += speed;
        return ring.radius < ring.maxRadius;
      });
      for (const ring of pulseRings) {
        drawPulseRing(ring);
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (surgeActive) {
          // During surge, particles speed up
          p.vx *= 1.02;
          p.vy *= 1.02;
        }

        if (p.y < -10) { p.y = canvas!.height + 10; p.x = Math.random() * canvas!.width; }
        if (p.x < -10) p.x = canvas!.width + 10;
        if (p.x > canvas!.width + 10) p.x = -10;

        if (p.life >= p.maxLife) {
          Object.assign(p, createParticle());
        }

        drawParticle(p);
      }

      animFrameId = requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    initCrystals();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameId);
      delete ((window as unknown) as Record<string, unknown>).__hextechSurge;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
