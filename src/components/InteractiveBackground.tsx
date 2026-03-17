import React, { useRef, useEffect } from 'react';

interface Ripple {
  x: number;
  y: number;
  progress: number;
}

interface InteractiveBackgroundProps {
  mode?: 'home' | 'standard';
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ mode = 'home' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const ripples = useRef<Ripple[]>([]);
  const currentLockedSide = useRef<'none' | 'front' | 'back'>('none');
  const lockStartTime = useRef<number>(0);
  const rippleTriggered = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width: number, height: number;
    const spacing = 34;
    const easeAmount = 0.02;
    const snapRadius = 180;
    const maxRippleRadius = 2000;
    const rippleSpeed = 0.004;

    class Dot {
      baseX: number;
      baseY: number;

      constructor(x: number, y: number) {
        this.baseX = x;
        this.baseY = y;
      }

      draw() {
        let currentX = this.baseX;
        let currentY = this.baseY;
        let rippleIntensity = 0;

        // 1. Ripple Logic
        if (mode === 'home') {
          ripples.current.forEach((r) => {
            const dx = currentX - r.x;
            const dy = currentY - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const waveRadius = r.progress * maxRippleRadius;
            const waveWidth = 240;

            if (dist > waveRadius - waveWidth && dist < waveRadius + waveWidth) {
              const weight = 1 - Math.abs(dist - waveRadius) / waveWidth;
              rippleIntensity = Math.max(rippleIntensity, weight);

              // Liquid distortion
              const distortion = Math.sin((dist - waveRadius) * 0.03) * weight * 15;
              const angle = Math.atan2(dy, dx);
              currentX += Math.cos(angle) * distortion;
              currentY += Math.sin(angle) * distortion;
            }
          });
        }

        // 2. Mouse Interaction
        const mdx = eased.current.x - currentX;
        const mdy = eased.current.y - currentY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const maxMouseDist = 220;

        const mouseIntensity = mDist < maxMouseDist ? Math.pow(1 - mDist / maxMouseDist, 2) : 0;
        const totalIntensity = Math.max(mouseIntensity, rippleIntensity);

        if (totalIntensity > 0.05) {
          ctx.fillStyle = '#4F46E5';
          ctx.globalAlpha = totalIntensity;

          // Repel logic
          const force = (maxMouseDist - mDist) / maxMouseDist;
          const moveX = mDist < maxMouseDist ? currentX - (mdx / mDist) * force * 25 : currentX;
          const moveY = mDist < maxMouseDist ? currentY - (mdy / mDist) * force * 25 : currentY;

          ctx.beginPath();
          ctx.arc(moveX, moveY, 2.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#000000';
          ctx.globalAlpha = 0.14;
          ctx.beginPath();
          ctx.arc(currentX, currentY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    let dots: Dot[] = [];

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dots = [];
      for (let x = 0; x <= width + spacing; x += spacing) {
        for (let y = 0; y <= height + spacing; y += spacing) {
          dots.push(new Dot(x, y));
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Magnetic Snapping
      let target = { ...mouse.current };
      let lockedSide: 'none' | 'front' | 'back' = 'none';

      if (mode === 'home') {
        const frontCenter = { x: width * 0.38, y: height * 0.45 };
        const backCenter = { x: width * 0.61, y: height * 0.45 };
        const dF = Math.sqrt((mouse.current.x - frontCenter.x) ** 2 + (mouse.current.y - frontCenter.y) ** 2);
        const dB = Math.sqrt((mouse.current.x - backCenter.x) ** 2 + (mouse.current.y - backCenter.y) ** 2);

        if (dF < snapRadius) {
          target = frontCenter;
          lockedSide = 'front';
        } else if (dB < snapRadius) {
          target = backCenter;
          lockedSide = 'back';
        }

        // Single-Shot Ripple Trigger with 0.5s Delay
        if (lockedSide !== 'none') {
          if (lockedSide !== currentLockedSide.current) {
            lockStartTime.current = Date.now();
            rippleTriggered.current = false;
          } else if (!rippleTriggered.current && Date.now() - lockStartTime.current > 500) {
            ripples.current.push({ x: target.x, y: target.y, progress: 0 });
            rippleTriggered.current = true;
          }
        } else {
          lockStartTime.current = 0;
          rippleTriggered.current = false;
        }
        currentLockedSide.current = lockedSide;

        // Dispatch event for Home.tsx
        window.dispatchEvent(new CustomEvent('model-lock', { detail: { lockedModel: lockedSide } }));
      }

      // Eased Drag
      eased.current.x += (target.x - eased.current.x) * easeAmount;
      eased.current.y += (target.y - eased.current.y) * easeAmount;

      // Update Ripples
      ripples.current.forEach((r, i) => {
        r.progress += rippleSpeed;
        if (r.progress > 1) ripples.current.splice(i, 1);
      });

      // Sync CSS Aura
      const container = canvas.parentElement;
      if (container) {
        container.style.setProperty('--mouse-x', `${eased.current.x}px`);
        container.style.setProperty('--mouse-y', `${eased.current.y}px`);
      }

      dots.forEach((dot) => dot.draw());
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 -z-10 bg-[#F8F9FD] overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          filter: 'blur(80px)',
          background: `
            radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(79, 70, 229, 0.4) 0%, transparent 60%),
            radial-gradient(ellipse 800px 800px at var(--mouse-x) var(--mouse-y), rgba(79, 70, 229, 0.1) 0%, transparent 100%)
          `,
        }}
      />
    </div>
  );
};
