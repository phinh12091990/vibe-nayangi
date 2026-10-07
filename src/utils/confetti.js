/**
 * NutriGo Refined Celebration Sparkle Effect
 * Elegant, subtle starbursts and micro-glow particles tailored for health & diet dashboards.
 * Replaces loud carnival paper confetti with gentle twinkling stars and golden pearls.
 */

export function triggerConfetti(origin) {
  // If user prefers reduced motion, skip visual burst
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Nutrigo Signature Harmony Palette (Lime, Gold, Coral, Mint, Pearl)
  const colors = ['#bbf246', '#f59e0b', '#ff7a18', '#10b981', '#38bdf8', '#ffffff'];
  
  // Clean, focused origin point
  const startX = origin?.x || width * 0.5;
  const startY = origin?.y || height * 0.5;

  const particleCount = 28; // Delicate count instead of 80 loud blocks
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.35;
    const speed = 3.5 + Math.random() * 6.5;
    const isStar = Math.random() > 0.45; // Mix of 4-point stars and soft micro-orbs

    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (2.5 + Math.random() * 2.5), // gentle upward lift
      size: isStar ? 4.5 + Math.random() * 3.5 : 2 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.1,
      isStar,
      gravity: 0.16,
      decay: 0.02 + Math.random() * 0.012
    });
  }

  let animationFrame;

  // Helper to draw a delicate 4-point sparkle star
  function drawSparkleStar(context, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    context.beginPath();
    context.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      context.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      context.lineTo(x, y);
      rot += step;
    }
    context.lineTo(cx, cy - outerRadius);
    context.closePath();
    context.fill();
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    let activeCount = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.alpha <= 0.01) continue;
      activeCount++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.96;
      p.rotation += p.rotSpeed;
      p.alpha = Math.max(0, p.alpha - p.decay);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 5;

      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.isStar) {
        drawSparkleStar(ctx, 0, 0, 4, p.size, p.size * 0.35);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (activeCount > 0) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  animationFrame = requestAnimationFrame(render);
}
