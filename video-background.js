(() => {
 const host=document.querySelector('.video-background'),frame=host?.querySelector('iframe');
 if(!frame||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 frame.id='chicago-film';
 const url=new URL(frame.src);url.searchParams.set('enablejsapi','1');
 if(location.protocol!=='file:')url.searchParams.set('origin',location.origin);
 frame.src=url.href;
 let player, startupTimer;
 const waiting=()=>{clearTimeout(startupTimer);startupTimer=setTimeout(()=>{if(host.dataset.playback!=='playing')status.textContent='Video could not start here. Try again or view the original video below.';},12000);};
 const button=document.querySelector('#video-play'),status=document.querySelector('#video-status');
 button.addEventListener('click',()=>{status.textContent='Starting background video…';waiting();if(player?.playVideo){player.mute();player.playVideo();}else{status.textContent='Video player is still loading. Please try again.';}});
 const fail=e=>{host.classList.remove('is-playing');host.dataset.playback='unavailable';button.hidden=false;status.textContent='YouTube playback unavailable'+(e?.data?' (error '+e.data+')':'')+'.';};
 window.onYouTubeIframeAPIReady=()=>{
  player=new YT.Player(frame.id,{events:{
   onReady:e=>{waiting();e.target.mute();e.target.setLoop(true);e.target.playVideo();},
   onStateChange:e=>{
    if(e.data===YT.PlayerState.PLAYING){clearTimeout(startupTimer);host.classList.add('is-playing');host.dataset.playback='playing';button.hidden=true;status.textContent='';}
    if(e.data===YT.PlayerState.ENDED){e.target.seekTo(0,true);e.target.playVideo();}
   },
   onAutoplayBlocked:()=>{button.hidden=false;status.textContent='Tap Play background to start the muted video.';},
   onError:fail
  }});
 };
 const api=document.createElement('script');api.src='https://www.youtube.com/iframe_api';api.onerror=fail;document.head.append(api);
 document.addEventListener('visibilitychange',()=>{
  if(!player?.pauseVideo)return;
  if(document.hidden)player.pauseVideo();else{player.mute();player.playVideo();}
 });
})();
