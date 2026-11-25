(() => {
  const canvas = document.querySelector('.chicago-weather');
  const context = canvas.getContext('2d');
  if (!context) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const status = document.querySelector('#chicago-weather-status');
  const particles = Array.from({length:160}, () => ({x:Math.random(),y:Math.random(),depth:0.3+Math.random()*0.7}));
  let weather, frame, previous, elapsed = 0, width, height, loading = false;
  const endpoint = 'https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current=weather_code,cloud_cover,precipitation,wind_speed_10m&timezone=America%2FChicago';
  function condition(code) {
    if ([71,73,75,77,85,86].includes(code)) return 'snow';
    if (code >= 95) return 'storm';
    if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'rain';
    if ([45,48].includes(code)) return 'fog';
    if (code >= 2 && code <= 3) return 'clouds';
    return 'clear';
  }
  async function refresh() {
    if (loading || document.hidden) return;
    loading = true;
    try {
      const response = await fetch(endpoint, {signal:AbortSignal.timeout(9000)});
      if (!response.ok) throw new Error('Weather unavailable');
      const data = await response.json();
      const current = data.current;
      if (![current?.weather_code,current?.cloud_cover,current?.precipitation,current?.wind_speed_10m].every(Number.isFinite)) throw new Error('Invalid weather');
      weather = {...current,kind:condition(current.weather_code)};
      const descriptions = {snow:'Snow',storm:'Thunderstorms',rain:'Rain',fog:'Fog',clouds:'Cloudy',clear:'Clear skies'};
      status.textContent = 'Chicago · '+descriptions[weather.kind];
      document.documentElement.dataset.chicagoWeather = weather.kind;
      document.documentElement.style.setProperty('--chicago-cloud', weather.cloud_cover / 100);
      schedule();
    } catch {
      status.textContent = weather ? 'Chicago · Last known weather (update unavailable)' : 'Chicago · Live weather unavailable';
    } finally { loading = false; }
  }
  function schedule() {
    if (frame === undefined && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function draw(now) {
    frame = undefined;
    const delta = previous === undefined ? 0 : Math.min((now-previous)/1000,0.05);
    previous = now;
    if (!reduced.matches) elapsed += delta;
    context.clearRect(0,0,width,height);
    if (!weather) return;
    const day = document.documentElement.dataset.daylight === 'day';
    const cloud = weather.kind === 'fog' ? 0.9 : weather.cloud_cover/100;
    if (weather.kind === 'clear' && weather.cloud_cover < 35) {
      const x = width * 0.82;
      const y = height * 0.22;
      const radius = Math.min(width, height) * 0.33;
      const glow = context.createRadialGradient(x,y,0,x,y,radius);
      glow.addColorStop(0,day?'rgba(255,204,87,.45)':'rgba(145,187,255,.21)');
      glow.addColorStop(.28,day?'rgba(255,221,136,.22)':'rgba(99,148,224,.10)');
      glow.addColorStop(1,'rgba(128,175,235,0)');
      context.fillStyle=glow;context.fillRect(0,0,width,height);
      context.fillStyle=day?'rgba(245,188,58,.65)':'rgba(205,225,255,.62)';
      context.beginPath();context.arc(x,y,day?19:13,0,Math.PI*2);context.fill();
    }
    // Wide, soft clouds stay translucent so content and artwork stay readable.
    for (let index=0;index<5;index++) {
      const x = ((index*width/3+elapsed*12)% (width*1.7))-width*.35;
      const y = height*(.12+index*.17);
      const radius = width*.53;
      const gradient=context.createRadialGradient(x,y,0,x,y,radius);
      const color=day?'77,109,139':'127,153,186';
      gradient.addColorStop(0,'rgba('+color+','+(cloud*(day?.65:.52))+')');
      gradient.addColorStop(1,'rgba('+color+',0)');
      context.fillStyle=gradient;
      context.fillRect(0,0,width,height);
    }
    if (['rain','snow','storm'].includes(weather.kind)) {
      const snow = weather.kind === 'snow';
      const count = Math.min(particles.length,85+Math.round(weather.precipitation*18));
      context.strokeStyle=day?'rgba(115,174,224,.62)':'rgba(177,213,255,.62)';
      context.fillStyle=day?'rgba(65,115,167,.48)':'rgba(220,238,255,.68)';
      for (let index=0;index<count;index++) {
        const p=particles[index];
        const speed=(snow?22:230)*p.depth;
        const wind=Math.min(weather.wind_speed_10m,70)*.65;
        const x=((p.x*width+elapsed*wind*p.depth+(snow?Math.sin(elapsed*.6+index)*15:0))%(width+24))-12;
        const y=(p.y*height+elapsed*speed)%(height+24)-12;
        if (snow) { context.beginPath();context.arc(x,y,1+p.depth*1.7,0,Math.PI*2);context.fill(); }
        else { context.beginPath();context.moveTo(x,y);context.lineTo(x+wind*.11,y+8+p.depth*9);context.stroke(); }
      }
    }
    if (!reduced.matches) schedule();
  }
  function resize() {
    width=innerWidth;height=innerHeight;
    const scale=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
    context.setTransform(scale,0,0,scale,0,0);schedule();
  }
  addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{previous=undefined;schedule();if(!document.hidden)refresh();});
  new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['data-daylight']});
  reduced.addEventListener('change',()=>{previous=undefined;schedule();});
  resize();refresh();setInterval(refresh,600000);
})();
