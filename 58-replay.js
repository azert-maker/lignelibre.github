/* =====================================================================
   REPLAY · FANTÔME · CLIP
   - Enregistreur : à chaque image de course, position + orientation du rider et sa posture
     (anneau de 20 s pour le replay) ; piste allégée à 10 Hz pour le fantôme (4 min max).
   - Fantôme : meilleure course pour la même config (sport, mode, longueur, monde, réglages),
     silhouette transparente « Ton record » rejouée au même chrono. Pas en multijoueur ni après un « continuer ».
   - Replay : 15 dernières secondes, caméras ciné (poursuite, trépied, orbite, rase-sol, drone), ralenti en l'air.
   - Clip : rendu 720×1280 (9:16, TikTok / Reels) avec le son, MediaRecorder, mp4 si possible sinon webm.
===================================================================== */
const REC={buf:[],track:[],tT:-1,on:false};let hudKmh=0;
function recStart(){REC.buf=[];REC.track=[];REC.tT=-1;REC.on=!!(cur&&cur._rig)}
function recFrame(t){if(!REC.on)return;const r=cur._rig,h=r.human;
  const f={t,p:r.position.clone(),q:r.quaternion.clone(),po:h&&h.getPose?h.getPose():null,e:cur._recX?cur._recX():0,s:Math.round(cur.stats.score),v:hudKmh};
  REC.buf.push(f);while(REC.buf.length>2&&t-REC.buf[0].t>20)REC.buf.shift();
  if(t-REC.tT>=.1&&REC.track.length<2400){REC.tT=t;const p=f.p,q=f.q;REC.track.push([+t.toFixed(2),+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2),+q.x.toFixed(3),+q.y.toFixed(3),+q.z.toFixed(3),+q.w.toFixed(3)])}}
/* ---------- fantôme ---------- */
const _gq1=new THREE.Quaternion(),_gq2=new THREE.Quaternion();let GH=null;
function ghostKey(cfg){return 'll3_ghost_'+[cfg.sport,cfg.mode,cfg.mode==='course'?cfg.len:'',cfg.seed,JSON.stringify(cfg.params||{})].join('|')}
function ghostStop(){if(GH){if(GH.obj.parent)GH.obj.parent.remove(GH.obj);disposeTree(GH.obj);GH=null}}
function ghostStart(cfg){ghostStop();if(!run||run.multi||S().ghost===false||!cur.ghost)return;const d=load(ghostKey(cfg),null);if(!d||!Array.isArray(d.tr)||d.tr.length<10)return;
  const obj=cur.ghost(Object.assign({},profile.look,{name:'Ton record'}));
  ghostify(obj,0xffffff,.35);GH={obj,tr:d.tr,i:0,m:d.m};ghostFrame(0)}
function ghostFrame(t){if(!GH)return;const tr=GH.tr;if(t<tr[GH.i][0])GH.i=0;while(GH.i<tr.length-2&&tr[GH.i+1][0]<=t)GH.i++;
  const a=tr[GH.i],b=tr[Math.min(tr.length-1,GH.i+1)],k=b[0]>a[0]?clamp((t-a[0])/(b[0]-a[0]),0,1):0;
  GH.obj.position.set(lerp(a[1],b[1],k),lerp(a[2],b[2],k),lerp(a[3],b[3],k));_gq1.set(a[4],a[5],a[6],a[7]).normalize();_gq2.set(b[4],b[5],b[6],b[7]).normalize();GH.obj.quaternion.copy(_gq1).slerp(_gq2,k);
  GH.obj.visible=t<=tr[tr.length-1][0]+.5}
function ghostSave(cfg,metric,better){if(!run||run.multi||run.continues>0||REC.track.length<10)return false;const k=ghostKey(cfg),old=load(k,null);
  if(old&&old.m!=null&&!better(metric,old.m))return false;save(k,{m:metric,tr:REC.track,at:Date.now()});
  const L=load('ll3_ghosts',[]).filter(x=>x!==k);L.unshift(k);while(L.length>10){try{localStorage.removeItem(L.pop())}catch(e){}}save('ll3_ghosts',L);return true}
/* ---------- replay ---------- */
const RP={t:0,t0:0,t1:0,shot:0,shotT:0,fr:null,tri:V3(),orb:0,exp:null,i:0};
const _rp=V3(),_rd=V3(),_rs=V3(),_rl=V3(),_rq=new THREE.Quaternion(),_RY=new THREE.Vector3(0,1,0);
function rpSample(t,out){const fr=RP.fr;let i=RP.i;if(i>=fr.length-1||fr[i].t>t)i=0;while(i<fr.length-2&&fr[i+1].t<=t)i++;RP.i=i;const a=fr[i],b=fr[Math.min(fr.length-1,i+1)],k=b.t>a.t?clamp((t-a.t)/(b.t-a.t),0,1):0;
  out=out||{p:V3(),q:new THREE.Quaternion()};out.p.copy(a.p).lerp(b.p,k);out.q.copy(a.q).slerp(b.q,k);out.po=k<.5?a.po:b.po;out.e=lerp(a.e||0,b.e||0,k);out.s=k<.5?a.s:b.s;out.v=lerp(a.v||0,b.v||0,k);return out}
const _sa={p:V3(),q:new THREE.Quaternion()},_sb={p:V3(),q:new THREE.Quaternion()},_sc={p:V3(),q:new THREE.Quaternion()};
function rpDir(t,out){const i0=RP.i;rpSample(Math.max(RP.t0,t-.2),_sb);const a=_sb.p.clone();rpSample(Math.min(RP.t1,t+.2),_sb);RP.i=i0;out.copy(_sb.p).sub(a);out.y=0;if(out.lengthSq()<1e-6)out.set(0,0,-1);return out.normalize()}
function rpShot(){RP.shot=(RP.shot+1)%5;RP.shotT=0;RP.orb=Math.random()*6.28;
  if(RP.shot===1){const i0=RP.i;rpSample(Math.min(RP.t1,RP.t+1.8),_sc);RP.i=i0;rpDir(RP.t,_rd);_rs.set(-_rd.z,0,_rd.x);RP.tri.copy(_sc.p).addScaledVector(_rs,(Math.random()<.5?-1:1)*(5+Math.random()*3));RP.tri.y+=1.6}}
function replayOpen(){if(typeof crashUndo==='function'){crashUndo();crashFx=null}if(!cur||!cur._rig||REC.buf.length<15){toast('Pas assez d\'images pour le replay',true);return}
  RP.fr=REC.buf.slice();RP.t1=RP.fr[RP.fr.length-1].t;RP.t0=Math.max(RP.fr[0].t,RP.t1-15);RP.t=RP.t0;RP.i=0;RP.shot=-1;rpShot();
  state='replay';crashFx=null;$('#over').hidden=true;$('#hud').hidden=true;$('#replay').hidden=false;cur._rig.visible=true;if(cur._rig.human)cur._rig.human.visible=true;
  if(cur._world){rpSample(RP.t0,_sa);cur._world(_sa,true)}paintReplay()}
function replayClose(){if(RP.exp)exportEnd(true);if(state!=='replay')return;rpSample(RP.t1,_sa);const r=cur._rig;r.position.copy(_sa.p);r.quaternion.copy(_sa.q);if(cur._world)cur._world(_sa,true);
  state='over';$('#replay').hidden=true;$('#hud').hidden=false;$('#over').hidden=false}
function paintReplay(){const p=$('#rpBar i');if(p)p.style.width=(clamp((RP.t-RP.t0)/(RP.t1-RP.t0||1),0,1)*100)+'%'}
function replayFrame(dt){if(!RP.fr)return;rpSample(RP.t,_sa);let sp=1;
  if(cur._h){const g=cur._h(_sa.p.x,_sa.p.z);if(isFinite(g)&&_sa.p.y-g>2.2)sp=.45}
  RP.t+=dt*sp;RP.shotT+=dt*sp;if(RP.t>=RP.t1){if(RP.exp){exportEnd();return}RP.t=RP.t0;RP.i=0;rpShot()}else if(RP.shotT>3.3)rpShot();
  const f=rpSample(RP.t,_sa),r=cur._rig;r.position.copy(f.p);r.quaternion.copy(f.q);if(f.po&&r.human&&r.human.snapPose)r.human.snapPose(f.po);
  if(cur._world)cur._world(f,false);rpDir(RP.t,_rd);_rs.set(-_rd.z,0,_rd.x);_rl.copy(f.p);_rl.y+=.9;
  if(RP.shot===0){_rp.copy(f.p).addScaledVector(_rd,-6);_rp.y+=2.2;_rl.addScaledVector(_rd,4)}
  else if(RP.shot===1)_rp.copy(RP.tri);
  else if(RP.shot===2){const a=RP.orb+RP.shotT*.55;_rp.set(f.p.x+Math.cos(a)*5,f.p.y+1.6,f.p.z+Math.sin(a)*5)}
  else if(RP.shot===3){_rp.copy(f.p).addScaledVector(_rs,3.2).addScaledVector(_rd,-1);_rp.y+=.4;_rl.addScaledVector(_rd,2)}
  else{_rp.copy(f.p).addScaledVector(_rd,-11);_rp.y+=14}
  if(cur._h){const g=cur._h(_rp.x,_rp.z);if(isFinite(g)&&_rp.y<g+.5)_rp.y=g+.5}
  camera.position.copy(_rp);camera.up.set(0,1,0);camera.lookAt(_rl);camera.fov=RP.shot===4?50:58;camera.updateProjectionMatrix();
  sound(0,300,.6);surface('air',0,0);if(cur.silence)cur.silence();paintReplay()}
/* ---------- export du clip ---------- */
async function exportStart(){if(RP.exp||state!=='replay')return;const cv0=renderer.domElement;
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){toast('Export vidéo non supporté par ce navigateur',true);return}
  const W=720,H=1280,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g2=cv.getContext('2d');const stream=cv.captureStream(30);let dest=null;
  try{initAudio();if(actx){dest=actx.createMediaStreamDestination();master.connect(dest);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t))}}catch(e){dest=null}
  const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
  const mime=types.find(t=>{try{return MediaRecorder.isTypeSupported(t)}catch(e){return false}})||'';let rec;
  try{rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:6e6}:{})}catch(e){toast('Export vidéo impossible ici',true);if(dest)try{master.disconnect(dest)}catch(_){}return}
  const chunks=[];rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  RP.exp={cv,g2,rec,chunks,dest,mime,W,H,score:fmt(Math.round(cur.stats.score)),name:cur.name};
  renderer.setPixelRatio(1);renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();
  $('#rpCover').hidden=false;$('#rpExp').disabled=true;RP.t=RP.t0;RP.i=0;RP.shot=-1;rpShot();rec.start(250)}
function exportDraw(){const e=RP.exp;if(!e)return;const g=e.g2;g.drawImage(renderer.domElement,0,0,e.W,e.H);
  g.save();g.textAlign='center';g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=18;g.fillStyle='#fff';g.font='800 64px system-ui,sans-serif';g.fillText('LIGNE LIBRE',e.W/2,120);
  g.font='600 34px system-ui,sans-serif';g.fillText(e.name+' · '+e.score+' pts',e.W/2,e.H-90);
  const f=_sa;g.font='700 44px system-ui,sans-serif';g.fillText(Math.round(f.v||0)+' km/h',e.W/2,e.H-150);g.restore()}
function exportEnd(cancel){const e=RP.exp;if(!e)return;RP.exp=null;
  e.rec.onstop=async()=>{if(cancel)return;const mp4=(e.mime||'').includes('mp4'),blob=new Blob(e.chunks,{type:mp4?'video/mp4':'video/webm'}),name='ligne-libre-'+curCfg.sport+'-'+dayKey()+(mp4?'.mp4':'.webm');let msg='';
    try{if(window.claude&&claude.use){const dl=await claude.use('downloads');if(dl){try{await dl.save({filename:name,data:blob});msg='Clip enregistré : '+name}catch(err){msg=err&&err.code==='declined'?'Export annulé':''}}}}catch(err){}
    if(!msg){try{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},5000);msg='Clip téléchargé : '+name}catch(err){msg='Export impossible ici'}}
    toast(msg,true)};
  try{e.rec.stop()}catch(err){}if(e.dest)try{master.disconnect(e.dest)}catch(err){}
  resize();$('#rpCover').hidden=true;$('#rpExp').disabled=false}
