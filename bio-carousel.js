(() => {
 const root=document.querySelector('.bio-carousel');
 if(!root)return;
 const track=root.querySelector('.bio-slides'),slides=[...root.querySelectorAll('.bio-slide')];
 const status=root.querySelector('.bio-carousel-status'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 root.querySelector('.bio-carousel-controls').hidden=false;
 let index=0,frame;
 function go(next){
  index=(next+slides.length)%slides.length;
  track.scrollTo({left:index*track.clientWidth,behavior:reduced.matches?'instant':'smooth'});
 }
 root.querySelector('[data-carousel-prev]').addEventListener('click',()=>go(index-1));
 root.querySelector('[data-carousel-next]').addEventListener('click',()=>go(index+1));
 track.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'){event.preventDefault();go(index+1);}
  if(event.key==='ArrowLeft'){event.preventDefault();go(index-1);}
  if(event.key==='Home'){event.preventDefault();go(0);}
  if(event.key==='End'){event.preventDefault();go(slides.length-1);}
 });
 track.addEventListener('scroll',()=>{
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=undefined;
   index=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/track.clientWidth)));
   status.textContent=(index+1)+' of '+slides.length;
  });
 },{passive:true});
 new ResizeObserver(()=>{track.scrollTo({left:index*track.clientWidth,behavior:'instant'});}).observe(track);
})();
