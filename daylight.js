(() => {
  const root = document.documentElement;
  const radians = Math.PI / 180;
  const coordinates = { latitude: 41.8781, longitude: -87.6298 };

  function isSunUp(now, latitude, longitude) {
    const year = now.getUTCFullYear();
    const start = Date.UTC(year, 0, 1);
    const days = (Date.UTC(year + 1, 0, 1) - start) / 86400000;
    const phase = 2 * Math.PI * ((now.getTime() - start) / 86400000 - 0.5) / days;
    const declination = 0.006918 - 0.399912 * Math.cos(phase) + 0.070257 * Math.sin(phase)
      - 0.006758 * Math.cos(2 * phase) + 0.000907 * Math.sin(2 * phase)
      - 0.002697 * Math.cos(3 * phase) + 0.00148 * Math.sin(3 * phase);
    const equation = 229.18 * (0.000075 + 0.001868 * Math.cos(phase) - 0.032077 * Math.sin(phase)
      - 0.014615 * Math.cos(2 * phase) - 0.040849 * Math.sin(2 * phase));
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;
    const hourAngle = (utcMinutes / 4 + longitude + equation / 4 - 180) * radians;
    const lat = latitude * radians;
    const altitudeSine = Math.sin(lat) * Math.sin(declination)
      + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
    return altitudeSine >= Math.sin(-0.833 * radians);
  }

  function applyTheme() {
    const now = new Date();
    const preference = root.dataset.themePreference || 'auto';
    const automaticDaylight = coordinates
      ? isSunUp(now, coordinates.latitude, coordinates.longitude)
      : now.getHours() >= 7 && now.getHours() < 19;
    const daylight = preference === 'auto' ? automaticDaylight : preference === 'day';
    root.dataset.daylight = daylight ? 'day' : 'night';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', daylight ? '#fff' : '#000');
  }

  applyTheme();
  setInterval(applyTheme, 15000);
  document.addEventListener('visibilitychange', applyTheme);
  window.addEventListener('pageshow', applyTheme);
  window.addEventListener('portfolio-theme-change', applyTheme);
})();
