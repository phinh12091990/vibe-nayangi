// Pure canvas confetti effect without heavy external dependencies
export function triggerConfetti() {
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

  const colors = ['#ff5e3a', '#ff9800', '#ffeb3b', '#00e676', '#00b0ff', '#e040fb', '#ffffff'];
  const confettiCount = 80;
  const particles = [];

  for (let i = 0; i < confettiCount; i++) {
    particles.push({
      x: width * (0.35 + Math.random() * 0.3),
      y: height * 0.45,
      r: 4 + Math.random() * 6,
      d: Math.random() * confettiCount,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
      tiltAngle: 0,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 1.2) * 18,
      gravity: 0.35,
      opacity: 1
    });
  }

  let animationFrame;
  const startTime = performance.now();

  function render(time) {
    const elapsed = time - startTime;
    if (elapsed > 2400) {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      return;
    }

    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2 + p.vy;
      p.x += Math.sin(p.d) * 2 + p.vx;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.tilt = Math.sin(p.tiltAngle - (p.d / 3)) * 15;
      
      if (elapsed > 1600) {
        p.opacity = Math.max(0, 1 - (elapsed - 1600) / 800);
      }

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    });

    animationFrame = requestAnimationFrame(render);
  }

  animationFrame = requestAnimationFrame(render);
}
