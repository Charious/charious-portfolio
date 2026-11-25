(() => {
  const canvas = document.querySelector('.starfield');
  const context = canvas.getContext('2d');
  if (!context) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stars = Array.from({ length: 760 }, () => ({
    x: Math.random() * 2.3 - 1.15,
    y: Math.random() * 2.3 - 1.15,
    depth: Math.random(),
    brightness: 0.38 + Math.random() * 0.62,
    phase: Math.random() * Math.PI * 2
  }));
  let width, height, frame, previous;
  let elapsed = 0;

  function draw(now) {
    frame = undefined;
    const delta = previous === undefined ? 0 : Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (!motion.matches) elapsed += delta;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#fff';
    const count = width < 640 ? 440 : stars.length;
    for (let index = 0; index < count; index++) {
      const star = stars[index];
      const depth = (star.depth + 1 - elapsed * 0.034 % 1) % 1;
      const perspective = 0.19 + depth * 0.81;
      const drift = elapsed * (0.3 + depth * 1.6);
      const x = width * (0.51 + star.x * 0.65 / perspective) + drift;
      const y = height * (0.46 + star.y * 0.65 / perspective) - drift * 0.42;
      if (x < 0 || x > width || y < 0 || y > height) continue;
      const shimmer = motion.matches ? 1 : 0.83 + Math.sin(elapsed * 0.9 + star.phase) * 0.17;
      const fade = Math.min(1, (1 - depth) * 13, depth * 9);
      const size = 0.9 + (1 - depth) * (index % 9 === 0 ? 2 : 0.82);
      context.globalAlpha = star.brightness * shimmer * fade;
      context.fillRect(x, y, size, size);
    }
    context.globalAlpha = 1;
    if (!motion.matches) schedule();
  }

  function schedule() {
    if (frame === undefined && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    schedule();
  }

  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { previous = undefined; schedule(); });
  motion.addEventListener('change', () => { previous = undefined; schedule(); });
  resize();
})();
