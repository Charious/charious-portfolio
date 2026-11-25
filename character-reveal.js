(async () => {
  const scene = document.querySelector('[data-character]');
  const image = scene.querySelector('img');
  const canvas = scene.querySelector('canvas');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const width = 488;
  const height = 628;
  const grid = 4;
  canvas.width = width;
  canvas.height = height;

  let pixels;
  try {
    await image.decode();
    const sample = document.createElement('canvas');
    sample.width = width / grid;
    sample.height = height / grid;
    const source = sample.getContext('2d', { willReadFrequently: true });
    source.drawImage(image, 0, 0, sample.width, sample.height);
    pixels = source.getImageData(0, 0, sample.width, sample.height).data;
  } catch {
    return;
  }

  const dots = [];
  for (let row = 0; row < height / grid; row++) {
    for (let col = 0; col < width / grid; col++) {
      const offset = (row * width / grid + col) * 4;
      const [red, green, blue] = pixels.subarray(offset, offset + 3);
      if (Math.min(red, green, blue) > 242) continue;
      const jitter = Math.random();
      dots.push({
        x: col * grid,
        y: row * grid,
        startX: width / 2 + (jitter - 0.5) * 54,
        delay: row / (height / grid) * 0.53 + jitter * 0.23,
        color: `rgb(${red} ${green} ${blue})`
      });
    }
  }
  if (!dots.length || reduced.matches) return;

  const button = scene.querySelector('.character-beat');
  const status = scene.querySelector('[role="status"]');
  const ease = (t) => t * t * (3 - 2 * t);
  const duration = 2100;

  // Keep particle destinations fixed so the grooves hold their shape as they spin.
  dots.forEach((dot, index) => {
    const radius = 139 * Math.sqrt((index + 1) / dots.length);
    dot.radius = Math.max(11, Math.round(radius / 4.5) * 4.5);
    dot.angle = index * 2.399963;
    dot.recordColor = radius < 39 ? '#ef164c' : radius < 78 ? '#7ab4ff' : '#2d5393';
  });

  scene.classList.add('character-reveal-ready');
  let started;
  let frame;
  let beatStart;
  let visible = false;

  function schedule() {
    if (visible && frame === undefined) frame = requestAnimationFrame(draw);
  }

  function restore() {
    beatStart = undefined;
    scene.classList.add('character-reveal-complete');
    scene.classList.remove('character-reveal-active');
    button.setAttribute('aria-disabled', 'false');
  }

  function draw(now) {
    frame = undefined;
    if (reduced.matches) {
      restore();
      button.hidden = true;
      return;
    }
    started ??= now;
    const elapsed = (now - started) / 1800;
    const playing = beatStart !== undefined;
    const beat = playing ? (now - beatStart) / duration : 0;
    if (playing && beat >= 1) {
      restore();
      status.textContent = 'Vinyl reveal finished. You can play it again.';
      return;
    }

    const morph = playing
      ? ease(Math.max(0, Math.min(1, beat / 0.27, (1 - beat) / 0.32)))
      : 0;
    context.clearRect(0, 0, width, height);
    for (const dot of dots) {
      const progress = Math.min(1, (elapsed - dot.delay) / 0.34);
      if (progress <= 0 && !playing) continue;
      const settle = playing ? 1 : 1 - (1 - progress) ** 3;
      const x = dot.startX + (dot.x - dot.startX) * settle;
      const y = dot.y * settle;
      const spin = dot.angle + beat * Math.PI * 3;
      const recordX = width / 2 + Math.cos(spin) * dot.radius;
      const recordY = height * 0.49 + Math.sin(spin) * dot.radius;
      const size = 1.4 + settle * 2.5 - morph * 1.6;
      context.fillStyle = morph > 0.63 ? dot.recordColor : dot.color;
      context.fillRect(x + (recordX - x) * morph, y + (recordY - y) * morph, size, size);
    }
    if (elapsed >= 1.16) {
      scene.classList.add('character-reveal-complete');
      button.hidden = false;
    }
    if (playing || elapsed < 1.16) schedule();
  }

  button.addEventListener('click', () => {
    if (reduced.matches || beatStart !== undefined) return;
    beatStart = performance.now();
    button.setAttribute('aria-disabled', 'true');
    scene.classList.add('character-reveal-active');
    status.textContent = 'Playing vinyl reveal.';
    schedule();
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      restore();
      button.hidden = true;
    } else schedule();
  });

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    visible = true;
    schedule();
  }, { threshold: 0.18 });
  observer.observe(scene);
})();
