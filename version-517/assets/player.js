(function(){
var video=document.getElementById('moviePlayer'),button=document.getElementById('playerStart');
if(!video)return;
var src=video.getAttribute('data-play');
var attached=false;
function attach(){
if(attached||!src)return;
attached=true;
if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src}else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls({enableWorker:true});hls.loadSource(src);hls.attachMedia(video)}else{video.src=src}
}
function start(){attach();if(button)button.classList.add('is-hidden');var p=video.play();if(p&&p.catch)p.catch(function(){})}
if(button)button.addEventListener('click',start);
video.addEventListener('click',function(){if(video.paused)start()});
})();