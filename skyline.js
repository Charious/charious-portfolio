(() => {
  const background = document.querySelector('.chicago-background');
  const skyline = document.querySelector('.chicago-skyline');
  const night = document.querySelector('.chicago-night');
  let nightMix = document.documentElement.dataset.daylight === 'night' ? 1 : 0;
  const water = document.querySelector('.chicago-water');
  const context = water.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame, waterFrame, previous, elapsed = 0;

  function update() {
    frame = undefined;
    if (reduced.matches) nightMix = document.documentElement.dataset.daylight === 'night' && night.naturalWidth ? 1 : 0;
    const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, scrollY / distance));
    const fold = innerHeight;
    const fadeDistance = Math.max(1, distance - fold);
    const fadeProgress = Math.max(0, Math.min(1, (scrollY - fold) / fadeDistance));
    const footer = document.querySelector('.foot');
    const footerStart = footer.getBoundingClientRect().top + scrollY - innerHeight;
    const footerProgress = Math.max(0, Math.min(1, (scrollY - footerStart) / Math.max(1, distance - footerStart)));
    document.documentElement.style.setProperty('--footer-reveal', footerProgress);
    const opacity = 0.35 * fadeProgress * (1 - footerProgress);
    background.style.opacity = opacity;
    const offset = reduced.matches ? 0 : (0.5 - progress) * Math.min(170, innerHeight * 0.22);
    const transform = 'translate3d(0,' + offset + 'px,0) scale(1.04)';
    for (const layer of [skyline, night, water]) {
      layer.style.transform = transform;
      layer.style.opacity = layer === night ? nightMix : 1;
    }
  }
  function schedule() {
    if (frame === undefined) frame = requestAnimationFrame(update);
  }

  function drawWater(now) {
    waterFrame = undefined;
    if (!context || reduced.matches || document.hidden || !skyline.naturalWidth) return;
    const delta = previous === undefined ? 0 : Math.min((now - previous) / 1000, 0.05);
    previous = now;
    elapsed += delta;
    const width = water.clientWidth, height = water.clientHeight;
    context.clearRect(0, 0, width, height);
    const scale = Math.max(width / skyline.naturalWidth, height / skyline.naturalHeight);
    const imageWidth = skyline.naturalWidth * scale;
    const imageHeight = skyline.naturalHeight * scale;
    const x = (width - imageWidth) * 0.52;
    const y = (height - imageHeight) * 0.40;
    // Lake Michigan is the lower left portion of this specific aerial photograph.
    context.save();
    context.translate(x, y);
    context.scale(scale, scale);
    context.beginPath();
    context.moveTo(0, 470);
    context.lineTo(280, 470);
    context.lineTo(490, 510);
    context.lineTo(520, 550);
    context.lineTo(610, 580);
    context.lineTo(610, 660);
    context.lineTo(530, 700);
    context.lineTo(390, 765);
    context.lineTo(570, 810);
    context.lineTo(970, 1000);
    context.lineTo(0, 1024);
    context.closePath();
    context.clip();
    const targetNight = document.documentElement.dataset.daylight === 'night' && night.complete && night.naturalWidth > 0 ? 1 : 0;
    nightMix += (targetNight - nightMix) * Math.min(1, delta * 2);
    if (Math.abs(targetNight - nightMix) < 0.001) nightMix = targetNight;
    update();
    const image = skyline;
    const amplitude = 0.85;
    for (let row = 468; row < image.naturalHeight; row += 3) {
      const displacement = Math.sin(row * 0.21 + elapsed * 0.72) * amplitude
        + Math.sin(row * 0.075 - elapsed * 0.43) * 0.45;
      context.drawImage(image, 0, row, image.naturalWidth, 3,
        displacement, row, image.naturalWidth, 3.15);
      if (nightMix > 0 && night.naturalWidth) {
        context.globalAlpha = nightMix;
        context.drawImage(night, 0, row, night.naturalWidth, 3,
          displacement, row, image.naturalWidth, 3.15);
        context.globalAlpha = 1;
      }
    }
    context.restore();
    waterFrame = requestAnimationFrame(drawWater);
  }
  function resizeWater() {
    if (!context) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    water.width = Math.round(water.clientWidth * ratio);
    water.height = Math.round(water.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (waterFrame === undefined) waterFrame = requestAnimationFrame(drawWater);
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => { schedule(); resizeWater(); });
  addEventListener('pageshow', schedule);
  reduced.addEventListener('change', () => {
    schedule();
    context?.clearRect(0, 0, water.clientWidth, water.clientHeight);
    resizeWater();
  });
  document.addEventListener('visibilitychange', () => {
    previous = undefined;
    if (!document.hidden && waterFrame === undefined) waterFrame = requestAnimationFrame(drawWater);
  });
  new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ['data-daylight'] });
  new ResizeObserver(schedule).observe(document.body);
  skyline.addEventListener('load', resizeWater, { once: true });
  night.addEventListener('load', () => { schedule(); resizeWater(); });
  update();
  resizeWater();
})();
