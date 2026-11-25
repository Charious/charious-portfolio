(() => {
  const canvas = document.querySelector('.particle-world');
  const hero = document.querySelector('.profile');
  const art = document.querySelector('.particle-art');
  const context = canvas.getContext('2d');
  if (!context) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const points = Array.from({ length: 2600 }, (_, index) => {
    const height = 1 - 2 * (index + 0.5) / 2600;
    const radius = Math.sqrt(1 - height * height);
    const angle = index * 2.399963;
    return [radius * Math.cos(angle), height, radius * Math.sin(angle)];
  });
  let width, height, frame, previous = -Infinity;
  let elapsed = 0;

  function resize() {
    width = innerWidth;
    height = innerHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    schedule();
  }

  function draw(now) {
    frame = undefined;
    const animated = !reduced.matches;
    if (animated && (now - previous < 30)) {
      schedule();
      return;
    }
    elapsed += Math.min(now - previous, 40) / 1000;
    previous = now;
    const progress = scrollY / Math.max(1, hero.offsetHeight);
    const time = animated ? elapsed : 0;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#fff';

    const bounds = art.getBoundingClientRect();
    if (bounds.bottom > 0 && bounds.top < height) {
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const scale = Math.min(bounds.width, bounds.height) * 0.39;
      const rotation = time * 0.23 + (animated ? progress * 1.5 : 0);
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      for (let i = 0; i < points.length; i++) {
        const [x, y, z] = points[i];
        const depth = x * sin + z * cos;
        if (depth < -0.16 && i % 7 !== 0) continue;
        const wave = 1 + 0.24 * Math.sin(7 * y + 4 * depth + time * 1.2);
        const horizontal = (x * cos - z * sin) * wave;
        const vertical = y * wave;
        const size = depth > 0.52 ? 2 : 1;
        context.fillRect(
          Math.round(centerX + (horizontal + vertical * 0.18) * scale),
          Math.round(centerY + (vertical - horizontal * 0.15) * scale), size, size
        );
      }
    }

    // Keep the scroll-responsive trail at the edges, clear of the reading column.
    for (let i = 0; i < 110; i++) {
      const y = ((i * 41 - (animated ? time * 17 + scrollY * 0.23 : 0)) % height + height) % height;
      const edge = 4 + 24 * (0.5 + 0.5 * Math.sin(i * 3.71 + y * 0.012));
      const x = i % 2 ? edge : width - edge;
      context.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    if (animated && bounds.bottom > 0) schedule();
  }

  function schedule() {
    if (frame === undefined && !document.hidden) frame = requestAnimationFrame(draw);
  }

  addEventListener('resize', resize);
  addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
  resize();
})();
