(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  document.querySelectorAll('.pose-scene').forEach(figure => {
    const image = figure.querySelector('img');
    async function setup() {
      if (!image.naturalWidth) return;
      const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      const sample = document.createElement('canvas'), source = sample.getContext('2d', {willReadFrequently:true});
      if (!ctx || !source) return;
      const width = 720, height = Math.round(width * image.naturalHeight / image.naturalWidth);
      sample.width = canvas.width = width; sample.height = canvas.height = height;
      source.drawImage(image,0,0,width,height);
      let pixels;
      try { pixels=source.getImageData(0,0,width,height).data; } catch { return; }
      const points=[];
      for(let y=0;y<height;y+=4) for(let x=0;x<width;x+=4) {
        const n=(y*width+x)*4, r=pixels[n],g=pixels[n+1],b=pixels[n+2];
        if(pixels[n+3]<40 || (r>247&&g>247&&b>247)) continue;
        points.push({x,y,ox:x,oy:y,vx:0,vy:0,color:'rgb('+r+','+g+','+b+')'});
      }
      canvas.setAttribute('aria-hidden','true');
      image.after(canvas); figure.classList.add('is-particle');
      let pointer={x:-10000,y:-10000},frame,visible=false,burst=0;
      const position=e=>{const box=canvas.getBoundingClientRect();pointer={x:(e.clientX-box.left)*width/box.width,y:(e.clientY-box.top)*height/box.height};start();};
      canvas.addEventListener('pointermove',position);
      canvas.addEventListener('pointerleave',()=>{pointer={x:-10000,y:-10000};});
      canvas.addEventListener('pointerdown',e=>{position(e);burst=1;});
      function start(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
      function draw(){
        frame=undefined;ctx.clearRect(0,0,width,height);
        for(const p of points){
          const dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy),range=burst?170:90;
          if(d<range){const force=(1-d/range)*(burst?9:2.5);p.vx+=(dx/(d||1))*force;p.vy+=(dy/(d||1))*force;}
          p.vx=(p.vx+(p.ox-p.x)*.025)*.86;p.vy=(p.vy+(p.oy-p.y)*.025)*.86;p.x+=p.vx;p.y+=p.vy;
          ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3.6,3.6);
        }
        burst=0;start();
      }
      new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else if(frame){cancelAnimationFrame(frame);frame=undefined;}},{rootMargin:'120px'}).observe(figure);
      document.addEventListener('visibilitychange',start);
    }
    if(image.complete)setup();else image.addEventListener('load',setup,{once:true});
  });
})();
