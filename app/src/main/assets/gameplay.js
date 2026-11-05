'use strict';
/* Gameplay-style Maker layer. Reuses portable-v1 chart data and existing save/export. */
(function(){
const stage=document.getElementById('lanes'), editor=stage.closest('.panel');
const projectPanel=document.getElementById('projectTitle').closest('.panel');
const musicPanel=document.getElementById('audioInput').closest('.panel');
const main=document.querySelector('main.wrap');
main.insertBefore(editor,main.firstElementChild.nextElementSibling);
main.insertBefore(musicPanel,editor.nextSibling);
main.insertBefore(projectPanel,musicPanel.nextSibling);
const label=document.querySelector('header .tag');label.textContent='EARLY ACCESS 0.2.0';
document.querySelector('.footer').textContent='DSG NETWORK · TapTap Maker Android v0.2.0 · Gameplay-style chart recorder';
stage.style.height='min(62vh,620px)';stage.style.minHeight='340px';
editor.classList.add('gameplay-panel');
const title=editor.querySelector('h2');title.textContent='♫ LIVE CHART MAKER';
const instruction=editor.querySelector('p.small');instruction.textContent='PLAY: notes move toward the hit line. Enable Live record and tap / hold a coloured lane to create notes. PAUSED: touch the highway to place or select notes; use Erase to remove them.';
const editorBox=editor.querySelector('.editor');
const overlay=document.createElement('div');overlay.className='highway-overlay';overlay.innerHTML='<div class="highway-head"><span id="stageMode">PREVIEW</span><strong id="stageBeat">READY TO CHART</strong><span id="stageTime">00:00.000</span></div><div class="hit-label">HIT LINE</div><div class="hit-pads" id="hitPads"></div>';
editorBox.insertBefore(overlay,stage);editorBox.appendChild(stage);
const wave=document.getElementById('wave');wave.style.height='54px';editorBox.appendChild(wave);
const toolbar=document.createElement('div');toolbar.className='playbar row';toolbar.innerHTML='<span class="pill">ANIMATED HIGHWAY</span><label class="small">Approach <select id="approachSpeed"><option value="2.2">Fast</option><option value="3.2" selected>Normal</option><option value="4.5">Slow</option></select></label><button type="button" id="demoNotes">Preview pattern</button><button type="button" id="clearDemo" class="hidden">Clear preview</button>';
editor.insertBefore(toolbar,editorBox);
const style=document.createElement('style');style.textContent=`
.gameplay-panel{background:linear-gradient(158deg,#14294b,#071428 65%);border-color:#376f9d}.gameplay-panel h2{color:#c9efff;letter-spacing:1px}.gameplay-panel>.row:first-child{margin-bottom:7px}
.gameplay-panel .editor{position:relative;isolation:isolate;border:1px solid #4785b8;box-shadow:inset 0 0 42px #061024,0 10px 30px #0005}
.gameplay-panel #lanes{display:block}.highway-overlay{position:absolute;inset:0 0 54px 0;pointer-events:none;z-index:2}.highway-head{position:absolute;left:10px;right:10px;top:9px;display:flex;justify-content:space-between;align-items:center;gap:5px;color:#b7e5ff;font:700 10px system-ui;text-shadow:0 2px 6px #000;padding:6px 9px;background:#091b35a0;border:1px solid #23618b88;border-radius:9px}.highway-head strong{font-size:12px;color:#fff}.hit-label{position:absolute;bottom:19.5%;right:6px;font:800 9px system-ui;letter-spacing:1px;color:#deefff;text-shadow:0 2px 6px #000}.hit-pads{position:absolute;bottom:3%;left:3%;right:3%;height:17%;display:flex;gap:5px;pointer-events:auto;touch-action:none}.hit-pads button{flex:1;min-width:0;padding:4px 1px;border-radius:11px 11px 16px 16px;color:white;font:900 14px system-ui;letter-spacing:.3px;border:1px solid #ffffff77;box-shadow:inset 0 -4px #0008,0 0 16px #0008;touch-action:none;user-select:none;-webkit-user-select:none}.hit-pads button:active,.hit-pads button.pressed{filter:brightness(1.65);transform:scale(.98);box-shadow:0 0 22px currentColor,inset 0 0 16px #fff7}.playbar{margin:8px 0 12px}.playbar select{padding:5px}.playbar button{font-size:11px;padding:7px}.gameplay-panel #recordKeys{display:none}
@media(min-width:700px){.gameplay-panel #lanes{height:520px!important}}`;
document.head.appendChild(style);
const pads=document.getElementById('hitPads');
const colours=['#f33060','#18da86','#328dff','#e2a832','#bf68fa'];
const keys=['A','S','D','Z','X'];
let flashes=Array.from({length:5},()=>0),holdStarts=new Map(),demo=false,demoNotes=[],rafStarted=false,lastFrame=performance.now();
function resetPads(){pads.replaceChildren();for(let i=0;i<project.laneCount;i++){
 const b=document.createElement('button');b.textContent=keys[i];b.style.background=`linear-gradient(180deg,${colours[i]},#132340)`;b.style.borderColor=colours[i];b.setAttribute('aria-label','Record lane '+(i+1));
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();b.setPointerCapture(e.pointerId);b.classList.add('pressed');flashes[i]=performance.now()+140;holdStarts.set(e.pointerId,{lane:i,time:audio.currentTime,ms:performance.now()});});
 function finish(e){e.preventDefault();e.stopPropagation();b.classList.remove('pressed');const start=holdStarts.get(e.pointerId);if(!start)return;holdStarts.delete(e.pointerId);if(!recording||audio.paused)return;
 const elapsed=Math.max(0,(performance.now()-start.ms)/1000),long=mode==='hold'||elapsed>.32;
 addNote(i,long?start.time:audio.currentTime,long?'hold':['left','right'].includes(mode)?mode:'tap',long?Math.max(.1,elapsed):0);
 }
 b.addEventListener('pointerup',finish);b.addEventListener('pointercancel',e=>{b.classList.remove('pressed');holdStarts.delete(e.pointerId)});pads.appendChild(b);
 }}
function laneX(i,z,w,n){const topW=w*.42, botW=w*.96, span=topW+(botW-topW)*z;return w/2-span/2+(i+.5)*span/n}
function laneEdges(i,z,w,n){const topW=w*.42,botW=w*.96,span=topW+(botW-topW)*z;return [w/2-span/2+i*span/n,w/2-span/2+(i+1)*span/n]}
function polygon(ctx,coords,fill,stroke){ctx.beginPath();ctx.moveTo(coords[0][0],coords[0][1]);for(let i=1;i<coords.length;i++)ctx.lineTo(coords[i][0],coords[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function render(){const now=performance.now();let t=audio.currentTime||0;if(!audio.paused){lastFrame=now}
 const speed=Number(document.getElementById('approachSpeed').value),h=stage.clientHeight,w=stage.clientWidth;
 const ratio=window.devicePixelRatio||1;if(stage.width!==Math.round(w*ratio)||stage.height!==Math.round(h*ratio)){stage.width=Math.round(w*ratio);stage.height=Math.round(h*ratio)}
 const ctx=stage.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);
 const horizon=h*.12,hit=h*.79,n=project.laneCount;
 const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#050e25');bg.addColorStop(.65,'#101834');bg.addColorStop(1,'#0a1930');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // Neon atmosphere and animated perspective grid.
 ctx.fillStyle='#14468233';for(let k=0;k<22;k++){const x=(k*83+13)%Math.max(w,1),y=(k*97+21)%(horizon+10);ctx.fillRect(x,y,1.5,1.5)}
 for(let i=0;i<n;i++){let a=laneEdges(i,0,w,n),b=laneEdges(i,1,w,n);polygon(ctx,[[a[0],horizon],[a[1],horizon],[b[1],hit],[b[0],hit]],i%2?'#092c393d':'#2b163448',colours[i]+'55');ctx.strokeStyle=colours[i]+'77';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a[0],horizon);ctx.lineTo(b[0],hit);ctx.stroke()}
 for(let k=0;k<Math.ceil(speed*4)+2;k++){const beat=60/(project.bpm||120),futureBeat=(Math.floor(t/beat)+k)*beat;const depth=1-(futureBeat-t)/speed;if(depth<0||depth>1)continue;const z=Math.pow(depth,1.55),y=horizon+(hit-horizon)*z,edges0=laneEdges(0,z,w,n),edgesN=laneEdges(n-1,z,w,n);ctx.strokeStyle=`rgba(98,165,236,${.12+z*.38})`;ctx.lineWidth=1+z;ctx.beginPath();ctx.moveTo(edges0[0],y);ctx.lineTo(edgesN[1],y);ctx.stroke()}
 const notes=demo?demoNotes:project.notes;for(const note of notes){if(note.lane>=n)continue;const ahead=note.time-t;if(ahead>speed+.1||ahead<-.25)continue;const depth=1-ahead/speed,z=Math.pow(Math.max(0,Math.min(1,depth)),1.55),y=horizon+(hit-horizon)*z,x=laneX(note.lane,z,w,n);let col=colours[note.lane];const size=8+z*21,laneWidth=(w*(.42+.54*z))/n;
 if(note.type==='hold'&&note.duration){const tailAhead=ahead+note.duration;const tailZ=Math.pow(Math.max(0,Math.min(1,1-tailAhead/speed)),1.55),tailY=horizon+(hit-horizon)*tailZ,tailX=laneX(note.lane,tailZ,w,n);ctx.strokeStyle=col+'aa';ctx.lineWidth=Math.min(laneWidth*.45,30)*(.3+z);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(tailX,tailY);ctx.lineTo(x,y);ctx.stroke()}
 ctx.save();ctx.shadowColor=col;ctx.shadowBlur=13+z*22;ctx.fillStyle=col;ctx.strokeStyle='#e5f9ff';ctx.lineWidth=1.5+z;ctx.beginPath();ctx.ellipse(x,y,Math.min(size*1.15,laneWidth*.40),Math.max(5,size*.48),0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(8,12*z)}px system-ui`;ctx.textAlign='center';if(note.type==='left'||note.type==='right')ctx.fillText(note.type==='left'?'←':'→',x,y+3);}
 // Fixed play line and illuminated hit targets.
 let left=laneEdges(0,1,w,n)[0],right=laneEdges(n-1,1,w,n)[1];ctx.shadowColor='#40d6ff';ctx.shadowBlur=22;ctx.strokeStyle='#6adeff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(left,hit);ctx.lineTo(right,hit);ctx.stroke();ctx.shadowBlur=0;
 for(let i=0;i<n;i++){const z=1,x=laneX(i,z,w,n),ww=(right-left)/n*.67;ctx.strokeStyle=colours[i];ctx.fillStyle=colours[i]+'20';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,hit+9,ww/2,10,0,0,Math.PI*2);ctx.fill();ctx.stroke();if(now<flashes[i]){ctx.fillStyle='#ffffff70';ctx.beginPath();ctx.ellipse(x,hit+8,ww/2,12,0,0,Math.PI*2);ctx.fill()}}
 document.getElementById('stageMode').textContent=recording?'● RECORDING':audio.paused?'EDIT / PREVIEW':'PLAYBACK';document.getElementById('stageBeat').textContent=project.title||'READY TO CHART';document.getElementById('stageTime').textContent=stamp(t);
 if(!rafStarted)return;requestAnimationFrame(render)
}
// Replace only the old rectangular canvas drawing, preserving the edit tools and exports.
draw=render;
const oldSync=sync;sync=function(){oldSync();if(pads.children.length!==project.laneCount)resetPads()};
// When in playback, taps in the highway itself record at the hit line; paused editing uses depth position.
stage.addEventListener('pointerdown',e=>{if(!audio.paused){e.stopImmediatePropagation();e.preventDefault();const r=stage.getBoundingClientRect(),x=e.clientX-r.left,l=Math.max(0,Math.min(project.laneCount-1,Math.floor(x/r.width*project.laneCount)));if(recording){flashes[l]=performance.now()+130;addNote(l,audio.currentTime,mode==='hold'?'hold':mode==='erase'?'tap':mode,mode==='hold'?.25:0)}return}
 // paused: select closest existing note, or place at the visual timeline position.
 e.stopImmediatePropagation();e.preventDefault();const r=stage.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 const hit=r.height*.79,horizon=r.height*.12,z=Math.max(0,Math.min(1,(y-horizon)/Math.max(1,hit-horizon))),depth=Math.pow(z,1/1.55),time=Math.max(0,audio.currentTime+(1-depth)*Number(document.getElementById('approachSpeed').value));let lane=0,dist=Infinity;for(let i=0;i<project.laneCount;i++){const d=Math.abs(x-laneX(i,z,r.width,project.laneCount));if(d<dist){dist=d;lane=i}}
 let close=project.notes.find(n=>n.lane===lane&&Math.abs(n.time-time)<.16);if(mode==='erase'){if(close){checkpoint();project.notes=project.notes.filter(n=>n.id!==close.id);selected=null;sync();updateDetail()}return}if(close){selected=close.id;sync();updateDetail();return}addNote(lane,time,mode,mode==='hold'?.45:0);
 },true);
// Avoid old high-level touch handlers after capture event for the canvas.
const demoBtn=document.getElementById('demoNotes');demoBtn.onclick=()=>{demo=true;const base=audio.currentTime;demoNotes=[];for(let k=0;k<22;k++){demoNotes.push({lane:k%project.laneCount,time:base+1+k*.35,type:k%7===0?'hold':'tap',duration:k%7===0?.5:0})}document.getElementById('clearDemo').classList.remove('hidden');notify('Preview notes are visual only, not saved in your chart. Press Play after importing audio to animate them.')};
document.getElementById('clearDemo').onclick=()=>{demo=false;demoNotes=[];document.getElementById('clearDemo').classList.add('hidden')};
resetPads();rafStarted=true;requestAnimationFrame(render);
})();
