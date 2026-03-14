import React, { useRef, useEffect } from 'react';

export const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const time = useRef(0);
  const activeRipples = useRef<{ x: number; y: number; age: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width: number, height: number;
    const dots: any[] = [];
    const spacing = 34;
    const easeAmount = 0.02;
    const snapRadius = 180;

    class Dot {
      baseX: number; baseY: number;
      constructor(x: number, y: number) {
        this.baseX = x; this.baseY = y;
      }

      draw() {
        let currentX = this.baseX;
        let currentY = this.baseY;
        let rippleGlow = 0;

        // 1. SLOW RIPPLE PHYSICS & GLOW
        activeRipples.current.forEach(ripple => {
          const dx = currentX - ripple.x;
          const dy = currentY - ripple.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // SPEED CONTROL: ripple.age * 2.5 is much slower than before
          const waveRadius = ripple.age * 2.5; 
          const waveWidth = 120;
          const waveAmplitude = 12; 

          if (distance > waveRadius - waveWidth && distance < waveRadius + waveWidth) {
            const intensity = 1 - Math.abs(distance - waveRadius) / waveWidth;
            
            // This creates the dot glow from the ripple
            rippleGlow = Math.max(rippleGlow, intensity);
            
            const distortion = Math.sin((distance - waveRadius) * 0.08) * intensity * waveAmplitude;
            const angle = Math.atan2(dy, dx);
            currentX += Math.cos(angle) * distortion;
            currentY += Math.sin(angle) * distortion;
          }
        });

        // 2. MOUSE INTERACTION
        const mdx = eased.current.x - currentX;
        const mdy = eased.current.y - currentY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const maxDist = 220;

        // 3. COLOR LOGIC (Combining Mouse Glow + Ripple Glow)
        const mouseIntensity = mDist < maxDist ? Math.pow(1 - (mDist / maxDist), 2) : 0;
        const totalIntensity = Math.max(mouseIntensity, rippleGlow);

        if (totalIntensity > 0.05) {
          ctx.fillStyle = '#4F46E5';
          // Ripples glow slightly softer than the direct mouse contact
          ctx.globalAlpha = totalIntensity * (rippleGlow > mouseIntensity ? 0.6 : 1);
          
          // Repel logic
          const force = (maxDist - mDist) / maxDist;
          const moveX = mDist < maxDist ? currentX - (mdx / mDist) * force * 25 : currentX;
          const moveY = mDist < maxDist ? currentY - (mdy / mDist) * force * 25 : currentY;
          
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

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dots.length = 0;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) dots.push(new Dot(x, y));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time.current += 0.01;

      const frontCenter = { x: width * 0.4, y: height * 0.5 };
      const backCenter = { x: width * 0.6, y: height * 0.5 };
      const dF = Math.sqrt((mouse.current.x - frontCenter.x)**2 + (mouse.current.y - frontCenter.y)**2);
      const dB = Math.sqrt((mouse.current.x - backCenter.x)**2 + (mouse.current.y - backCenter.y)**2);

      let target = { ...mouse.current };
      let lockedModel = 'none';

      if (dF < snapRadius) { target = frontCenter; lockedModel = 'front'; }
      else if (dB < snapRadius) { target = backCenter; lockedModel = 'back'; }

      window.dispatchEvent(new CustomEvent('model-lock', { detail: { lockedModel } }));

      eased.current.x += (target.x - eased.current.x) * easeAmount;
      eased.current.y += (target.y - eased.current.y) * easeAmount;

      // HEARTBEAT TRIGGER (Slower check)
      if (lockedModel !== 'none' && Math.sin(time.current * 3) > 0.995) {
        if (activeRipples.current.length < 2) {
          activeRipples.current.push({ x: eased.current.x, y: eased.current.y, age: 0 });
        }
      }

      activeRipples.current.forEach((r, i) => {
        r.age += 1.2; // This controls the slow spread speed
        if (r.age > 450) activeRipples.current.splice(i, 1);
      });

      const container = canvas.parentElement;
      if (container) {
        container.style.setProperty('--mouse-x', `${eased.current.x}px`);
        container.style.setProperty('--mouse-y', `${eased.current.y}px`);
        container.style.setProperty('--t', `${time.current}`);
      }

      dots.forEach(dot => dot.draw());
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);
    init(); animate();
    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-[#FCFCFC] overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          filter: 'blur(60px)',
          background: `
            radial-gradient(circle at calc(var(--mouse-x) + calc(sin(var(--t) * 1.5) * 40px)) calc(var(--mouse-y) + calc(cos(var(--t) * 1.5) * 40px)), rgba(79, 70, 229, 0.45) 0%, transparent 50%),
            radial-gradient(ellipse calc(450px + calc(sin(var(--t)) * 100px)) calc(450px + calc(cos(var(--t) * 0.8) * 100px)) at var(--mouse-x) var(--mouse-y), rgba(79, 70, 229, 0.15) 0%, transparent 70%)
          `,
        }}
      />
    </div>
  );
};