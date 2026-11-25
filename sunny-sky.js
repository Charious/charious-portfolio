(() => {
 const sky=document.querySelector('.sunny-sky'),canvas=sky.querySelector('canvas'),ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clouds=Array.from({length:14},(_,i)=>({x:(i*.307)%1,y:.08+(i*.173)% .84,size:120+(i*47)%180,speed:13+(i%4)*4,phase:i*2.1}));
 let width,height,frame,last,elapsed=0;
 function update(){
  const distance=Math.max(1,document.documentElement.scrollHeight-innerHeight),fold=innerHeight;
  const progress=Math.max(0,Math.min(1,(scrollY-fold)/Math.max(1,distance-fold)));
  const footer=document.querySelector('.foot'),start=footer.getBoundingClientRect().top+scrollY-innerHeight;
  const end=Math.max(0,Math.min(1,(scrollY-start)/Math.max(1,distance-start)));
  sky.style.opacity=.60*progress*(1-end);
  document.documentElement.style.setProperty('--footer-reveal',end);
 }
 function draw(now){
  frame=undefined;if(document.hidden||!ctx)return;
  if(last!==undefined&&!reduced.matches)elapsed+=Math.min((now-last)/1000,.05);
  last=now;ctx.clearRect(0,0,width,height);
  for(const c of clouds){
   const size=c.size*Math.max(.6,Math.min(1.35,width/1200));
   const x=(c.x*(width+size*4)+elapsed*c.speed)%(width+size*4)-size*2;
   const y=c.y*height+Math.sin(elapsed*.12+c.phase)*22;
   for(let p=0;p<7;p++){
    const px=x+(p-3)*size*.28,py=y-Math.sin(p*.75+c.phase+elapsed*.035)*size*.19,r=size*(.32+Math.sin(p*2+c.phase)*.07);
    const glow=ctx.createRadialGradient(px,py-r*.14,0,px,py,r);
    glow.addColorStop(0,'rgba(255,255,255,.85)');glow.addColorStop(.5,'rgba(255,255,255,.62)');glow.addColorStop(1,'rgba(242,249,255,0)');
    ctx.fillStyle=glow;ctx.fillRect(px-r,py-r,r*2,r*2);
   }
  }
  if(!reduced.matches)frame=requestAnimationFrame(draw);
 }
 function start(){if(frame===undefined&&!document.hidden)frame=requestAnimationFrame(draw);}
 function resize(){
  width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx?.setTransform(d,0,0,d,0,0);update();start();
 }
 addEventListener('scroll',update,{passive:true});addEventListener('resize',resize);addEventListener('pageshow',update);
 document.addEventListener('visibilitychange',()=>{last=undefined;start();});
 reduced.addEventListener('change',()=>{if(frame)cancelAnimationFrame(frame);frame=undefined;last=undefined;start();});
 new ResizeObserver(update).observe(document.body);resize();
})();
