/* Mascota digital — mascota.js (sin dependencias)
   Uso:  const m = new MascotaDigital({ nombre:'Bonnie', editable:false });
   Opciones:
     imagen       (opcional) emoji o URL de una foto/gif. Si no pones nada, se usa el perrito pixelado de Minecraft
     nombre       nombre que se muestra
     editable     true -> el administrador puede agregar/borrar fotos del álbum
     fotos        [{u:'url', d:'descripción'}]  -> el álbum
     clave        nombre con el que se guarda el estado de la mascota en el navegador
     panel        (opcional) elemento donde va el panel de control; si no, flota abajo a la izquierda
     velocidad    1 = normal, 0.5 = lenta, 2 = rápida
     frases       ['¡Hola!', …]  -> las dice de vez en cuando
     accesorios   {cabeza:'corona', cara:'lentesSol', cuello:'collar', espalda:'capa'} (ver ACCESORIOS)
     onChange     (fotos)=>{}  -> aquí conectas tu base de datos cuando cambia el álbum
     elegirFoto   async ()=>url  -> abre el selector de fotos de la página
   Métodos: setEditable(bool) · setFotos(arr) · setNombre(txt) · setVisible(bool) · setOpciones({velocidad, frases, accesorios})
   El estado de la mascota (hambre, cariño, posición) se guarda por visitante. */
/* ---------- Perrito y huesito en pixel-art estilo Minecraft ----------
   Cada letra es un pixel: W=blanco S=sombra P=rosa(oreja) K=ojos N=nariz T=lengua G=gris.
   Para cambiar el color del perrito edita PAL; para cambiar su forma edita PERRO.
   El borde café se dibuja solo.
   Es el perrito de las fotos: blanco crema, orejas grandes y paradas (rosadas por dentro),
   nariz grande y oscura, ojos color avellana. */
const PAL={W:'#fbf5e6',S:'#e6d5b0',P:'#eab0a6',K:'#4a3b12',N:'#3b3a3f',T:'#ef8a9a',G:'#cfcfc4',B:'#5a3825'};
const PERRO=[
'.W............W.',
'.WW..........WW.',
'.WPW........WPW.',
'.WPPW......WPPW.',
'.WPPWW....WWPPW.',
'..WPWWWWWWWWPW..',
'..WWWWWWWWWWWW..',
'..WWWKWWWWKWWW..',
'..WWWWWWWWWWWW..',
'...WWWWNNWWWW...',
'....WWNNNNWW....',
'.....WWWWWW.....',
'....WWWWWWWW....',
'...WWWWWWWWWW...',
'...WWWWWWWWWW...',
'...WWSWWWWSWW...',
'...WW.WWWW.WW...',
'...WW.WWWW.WW...'];
const HUESO=['..........WW..','.........WWWW.','.........WWWWG','........WWWG..','.......WWWG...','......WWWG....','.....WWWG.....','....WWWG......','...WWWG.......','.WWWWG........','WWWWWG........','WWWWG.........','.WW...........'];
function sprite(rows,px){
  const h=rows.length,w=rows[0].length,at=(x,y)=>(rows[y]||'')[x]||'.',N=[[1,0],[-1,0],[0,1],[0,-1]],pix=[];
  const col=(x,y)=>{const c=at(x,y);return c==='.'&&N.some(([a,b])=>at(x+a,y+b)!=='.')?'B':c};
  for(let y=-1;y<=h;y++){let x=-1;while(x<=w){const c=col(x,y);let n=1;
    if(c!=='.'){while(x+n<=w&&col(x+n,y)===c)n++;pix.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${PAL[c]}"/>`)}x+=n}}
  return `<svg viewBox="-1 -1 ${w+2} ${h+2}" width="${px}" height="${px}" shape-rendering="crispEdges">${pix.join('')}</svg>`}
function perro(est){const r=PERRO.slice();
  if(est==='feliz'||est==='come')r[11]='.....WWTTWW.....';
  if(est==='feliz'){r[6]='..WWKKWWWWKKWW..';r[7]='..WWWWWWWWWWWW..'}
  if(est==='triste')r[6]='..WWSSWWWWSSWW..';
  if(est==='duerme')r[7]='..WWSSWWWWSSWW..';
  return sprite(r,84)}
/* ---------- Accesorios en pixel-art, a la medida del perrito ----------
   Cada uno va en un lugar (cabeza, cara, cuello, espalda) y se pueden combinar.
   x, y = dónde empieza el dibujo sobre la cuadrícula del perrito (16 × 18).
   luz = letras que brillan (la lámpara del casco, las joyas de la corona…). */
const ACCESORIOS={
  corona:{lugar:'cabeza',nombre:'Corona',x:4,y:1,luz:'RB',pal:{Y:'#f7c52b',O:'#c9961a',R:'#e0182b',B:'#2a8bf2'},filas:['Y..YY..Y','YY.YY.YY','YRYYYYBY','OOOOOOOO']},
  copa:{lugar:'cabeza',nombre:'Sombrero de copa',x:4,y:0,pal:{K:'#1c1c1c',k:'#3a3a3a',R:'#c1121f'},filas:['..KKKK..','..KKKK..','..kKKk..','..RRRR..','KKKKKKKK']},
  gorra:{lugar:'cabeza',nombre:'Gorra',x:3,y:1,pal:{R:'#d8202a',r:'#a5121b',W:'#ffffff'},filas:['...RRRR...','..RRRWRR..','.rRRRRRRr.','rrrrrrrrrr']},
  minero:{lugar:'cabeza',nombre:'Casco minero',x:3,y:1,luz:'L',pal:{Y:'#f2c230',O:'#b88a12',L:'#fff7c2'},filas:['...YYYY...','..YYLLYY..','.YYYLLYYY.','OOOOOOOOOO']},
  diamante:{lugar:'cabeza',nombre:'Casco de diamante',x:3,y:2,luz:'W',pal:{C:'#5ce1e6',c:'#2ab7bf',W:'#e8fdff'},filas:['.CWCCCCcC.','CCCCCCCCCC','C........C','c........c']},
  abeja:{lugar:'cabeza',nombre:'Antenas de abeja',x:4,y:0,pal:{B:'#2b2118',Y:'#f2c230'},filas:['B......B','.B....B.','..B..B..','YBYBYBYB']},
  fiesta:{lugar:'cabeza',nombre:'Gorro de fiesta',x:4,y:-1,luz:'Y',pal:{Y:'#ffe14d',R:'#ff4d7d',P:'#5ec8ff'},filas:['...YY...','...RP...','..RPRP..','..PRPR..','.RPRPRP.']},
  audifonos:{lugar:'cabeza',nombre:'Audífonos',x:1,y:4,pal:{K:'#2b2b2b',R:'#e0182b'},filas:['..KKKKKKKKKK..','.K..........K.','RR..........RR','RR..........RR','RR..........RR']},
  mono:{lugar:'cabeza',nombre:'Moño',x:5,y:3,pal:{P:'#ff7eb6',p:'#d94f8c'},filas:['PP..PP','PPppPP','PP..PP']},
  flor:{lugar:'cabeza',nombre:'Flor',x:11,y:0,pal:{P:'#ff9ccf',Y:'#ffd84d'},filas:['.P.','PYP','.P.']},
  lentesSol:{lugar:'cara',nombre:'Lentes de sol',x:3,y:7,pal:{K:'#111111',W:'#ffffff'},filas:['KKKKKKKKKK','.KWK..KWK.']},
  lentes:{lugar:'cara',nombre:'Lentes redondos',x:3,y:6,pal:{K:'#4a2b12'},filas:['.KKK..KKK.','KK.KKKK.KK','.KKK..KKK.']},
  chapitas:{lugar:'cara',nombre:'Chapitas',x:3,y:9,pal:{P:'#ff8fa8'},filas:['P........P']},
  collar:{lugar:'cuello',nombre:'Collar con placa',x:4,y:12,luz:'Y',pal:{R:'#d8202a',Y:'#f7c52b'},filas:['RRRRRRRR','...YY...']},
  bufanda:{lugar:'cuello',nombre:'Bufanda',x:3,y:12,pal:{S:'#3a86ff',s:'#ffffff'},filas:['SsSsSsSsSs','.......sS.','.......Ss.']},
  corbatin:{lugar:'cuello',nombre:'Corbatín',x:5,y:12,pal:{R:'#c1121f',r:'#8a0c15'},filas:['RR..RR','RRrrRR','RR..RR']},
  panuelo:{lugar:'cuello',nombre:'Pañuelo',x:4,y:12,pal:{B:'#2a6fdb',W:'#ffffff'},filas:['BBBBBBBB','.BBWBBB.','..BBBB..','...BB...']},
  capa:{lugar:'espalda',nombre:'Capa de héroe',x:1,y:12,pal:{R:'#c1121f'},filas:['RR..........RR','RRR........RRR','RRR........RRR','RRRR......RRRR','.RRR......RRR.']},
  alas:{lugar:'espalda',nombre:'Alas de abeja',x:0,y:9,ala:true,pal:{W:'#f2fbff'},filas:['WW............WW','WWW..........WWW','.WW..........WW.']},
};
const LUGARES={cabeza:'Cabeza',cara:'Cara',cuello:'Cuello',espalda:'Espalda'};
// los accesorios viejos (emojis) se convierten en los dibujados
const ACC_EMOJI={'👑':'corona','🎩':'copa','🧢':'gorra','🎀':'mono','🌸':'flor','🕶️':'lentesSol','🎉':'fiesta'};
function rectsAccesorio(a){let r='';a.filas.forEach((f,y)=>{let x=0;while(x<f.length){const c=f[x];let n=1;
  if(c!=='.'){while(x+n<f.length&&f[x+n]===c)n++;const cl=(a.luz||'').includes(c)?' class="mm-luz"':a.ala?' class="mm-ala"':'';
    r+=`<rect x="${a.x+x}" y="${a.y+y}" width="${n}" height="1" fill="${a.pal[c]}"${cl}/>`}x+=n}});return r}
// capa con todos los accesorios puestos, en la misma cuadrícula que el perrito
function accesoriosSVG(sel,px){const L=['espalda','cuello','cara','cabeza'].map(l=>ACCESORIOS[(sel||{})[l]]).filter(Boolean);
  return L.length?`<svg class="mm-acc-svg" viewBox="-1 -1 18 20" width="${px}" height="${px}" shape-rendering="crispEdges" overflow="visible">${L.map(rectsAccesorio).join('')}</svg>`:''}
// vista pequeña de un accesorio solo (para elegirlo)
function dibujoAccesorio(id,px){const a=ACCESORIOS[id],w=Math.max(...a.filas.map(f=>f.length)),h=a.filas.length,b=Object.assign({},a,{x:0,y:0});
  return `<svg viewBox="-.5 -.5 ${w+1} ${h+1}" width="${px}" height="${px}" shape-rendering="crispEdges">${rectsAccesorio(b)}</svg>`}
// el perrito con sus accesorios (para la vista previa)
function perroVestido(sel,px){return `<span class="mm-vista" style="width:${px}px;height:${px}px">${sprite(PERRO,px)}${accesoriosSVG(sel,px)}</span>`}
class MascotaDigital{
  constructor(op={}){
    this.op=Object.assign({imagen:'',nombre:'Mi perrito',editable:false,fotos:[],clave:'mascota-digital',panel:null,velocidad:1,frases:[],accesorios:{},onChange:null,elegirFoto:null},op);
    if(this.op.accesorio&&ACC_EMOJI[this.op.accesorio]&&!Object.keys(this.op.accesorios||{}).length)this.op.accesorios={[ACCESORIOS[ACC_EMOJI[this.op.accesorio]].lugar]:ACC_EMOJI[this.op.accesorio]};
    const im=this.op.imagen;this.modo=!im?'pixel':/^(https?:|data:|\/)|\.(png|gif|jpe?g|webp)(\?.*)?$/i.test(im)?'foto':'emoji';
    this.e=Object.assign({h:70,j:70,x:Math.min(160,innerWidth-60),y:innerHeight-170,sit:false,leash:false},this._leer(''));
    this.fotos=this._fx(this.op.fotos||[]);
    this.mano={x:this.e.x+130,y:this.e.y};this.meta=null;this.sig=0;this.drag=null;this.cara=null;this.vi=0;this.lp=0;
    this.toque=Date.now();this.dormido=false;
    this._armar();this._pintar();this._frame();
    setInterval(()=>this._pasa(),8000);
  }
  _leer(k,d={}){try{return JSON.parse(localStorage.getItem(this.op.clave+k))||d}catch(e){return d}}
  _fx(a){return a.map(f=>({u:f.u||'',d:f.d||''}))}
  _s(){clearTimeout(this._ts);this._ts=setTimeout(()=>{try{localStorage.setItem(this.op.clave,JSON.stringify(this.e))}catch(x){}},500)}
  _sf(){clearTimeout(this._tf);this._tf=setTimeout(()=>{if(this.op.onChange)this.op.onChange(this.fotos)},400)}
  _armar(){
    const r=this.raiz=document.createElement('div');r.className='mm';
    r.innerHTML=`<div class="mm-yard"><svg class="mm-leash"><path d=""/><circle r="6" cx="-20" cy="-20"/></svg>
      <div class="mm-pet"><div class="mm-say"></div><div class="mm-cuerpo"></div><i class="mm-collar"></i><b class="mm-nom"></b></div></div>
      <div class="mm-dock"><div class="mm-bar" title="Saciedad"><span>🦴</span><div><i class="mm-bh"></i></div></div>
        <div class="mm-bar" title="Cariño"><span>💛</span><div><i class="mm-bj"></i></div></div>
        <div class="mm-r"><button data-a="comer" title="Darle un huesito" aria-label="Alimentar">${sprite(HUESO,20)}</button><button data-a="jugar" title="Jugar con la pelota" aria-label="Jugar">🎾</button>
        <button data-a="mimar" title="Acariciar" aria-label="Acariciar">✋</button><button data-a="correa" title="Correa: sacar a pasear" aria-label="Correa" aria-pressed="false">🦮</button>
        <button data-a="album" title="Álbum de fotos" aria-label="Álbum">📷</button></div></div>
      <div class="mm-al" hidden><div class="mm-ap"><button class="mm-x" data-a="cerrar" aria-label="Cerrar">✕</button><h3></h3><div class="mm-big"></div><div class="mm-gr"></div>
        <div class="mm-adm"><input type="text" class="mm-desc" placeholder="Descripción de la foto"><button data-a="subir">＋ Agregar foto</button></div></div></div>`;
    document.body.append(r);
    const q=s=>r.querySelector(s);
    this.yard=q('.mm-yard');this.pet=q('.mm-pet');this.cuerpo=q('.mm-cuerpo');this.say=q('.mm-say');this.path=q('.mm-leash path');this.mano_c=q('.mm-leash circle');this.al=q('.mm-al');
    this.bh=q('.mm-bh');this.bj=q('.mm-bj');this.dock=q('.mm-dock');
    q('.mm-nom').textContent=this.op.nombre;
    if(this.modo==='foto'){const i=document.createElement('img');i.src=this.op.imagen;i.alt=this.op.nombre;i.className='mm-foto';this.cuerpo.append(i)}
    r.classList.toggle('mm-ed',!!this.op.editable);
    const clic=ev=>{const b=ev.target.closest('[data-a]');if(b)this._acc(b.dataset.a,b)};
    r.addEventListener('click',clic);
    // el panel de control puede vivir dentro de la página (por ejemplo en la columna derecha)
    if(this.op.panel){const w=document.createElement('div');w.className='mm mm-en-panel';this.dock.classList.add('mm-dock-in');w.append(this.dock);this.op.panel.append(w);w.addEventListener('click',clic);this.envoltura=w}
    this.al.addEventListener('click',ev=>{if(ev.target===this.al)this._cerrar()});
    addEventListener('keydown',ev=>{if(this.al.hidden)return;if(ev.key==='Escape')this._cerrar();if(ev.key==='ArrowRight')this._ver(1);if(ev.key==='ArrowLeft')this._ver(-1)});
    // la correa sigue la "mano": el puntero (mouse) o el último toque
    addEventListener('pointermove',ev=>{if(this.e.leash&&!this.drag){this.mano.x=ev.clientX;this.mano.y=ev.clientY}});
    addEventListener('pointerdown',ev=>{if(this.e.leash&&!this.pet.contains(ev.target)&&!ev.target.closest('.mm-dock,.mm-al')){this.mano.x=ev.clientX;this.mano.y=ev.clientY}});
    addEventListener('resize',()=>{this.e.x=Math.min(this.e.x,innerWidth-30);this.e.y=Math.min(this.e.y,innerHeight-30)});
    // arrastrar = moverla a donde quieras (se queda ahí sentada); clic = sentar / levantar
    this.pet.onpointerdown=ev=>{this._despierta();this.pet.setPointerCapture(ev.pointerId);this.drag={x0:ev.clientX,y0:ev.clientY,mov:false}};
    this.pet.onpointermove=ev=>{const d=this.drag;
      if(d){if(!d.mov&&Math.hypot(ev.clientX-d.x0,ev.clientY-d.y0)>6){d.mov=true;this.pet.classList.add('alzado')}
        if(d.mov){this.e.x=ev.clientX;this.e.y=ev.clientY}}
      else this._caricia()};
    this.pet.onpointerup=()=>{const d=this.drag;this.drag=null;this.pet.classList.remove('alzado');if(!d)return;
      if(d.mov){this.e.sit=true;this._di('¡Me quedo aquí! 🪑')}
      else{this.e.sit=!this.e.sit;this._di(this.e.sit?'Me siento 🪑':'¡Vamos! 🐾')}this.meta=null;this._s()};
  }
  _acc(a,b){
    this._despierta();
    if(a==='comer')this._comer();if(a==='jugar')this._jugar();if(a==='mimar')this._mimar();
    if(a==='correa'){this.e.leash=!this.e.leash;this.e.sit=false;this.meta=null;this.mano={x:this.e.x+130,y:this.e.y};b.setAttribute('aria-pressed',this.e.leash);
      this._di(this.e.leash?'¡A pasear! 🦮 Mueve el mouse o toca la pantalla':'¡Libre! 🐾');this._s()}
    if(a==='album')this._abrir();if(a==='cerrar')this._cerrar();if(a==='subir')this._subir();
  }
  _despierta(){this.toque=Date.now();if(this.dormido){this.dormido=false;this._pintar()}}
  _frame(){
    const e=this.e,t=performance.now();let mv=false;
    if(!this.drag&&!e.sit){
      const v=Math.max(.2,Math.min(4,+this.op.velocidad||1));let tx,ty,s=1.2*v;
      if(e.leash){const dx=this.mano.x-e.x,dy=this.mano.y-e.y,d=Math.hypot(dx,dy);
        if(d>110){tx=this.mano.x-dx/d*70;ty=this.mano.y-dy/d*70;s=Math.min(6,Math.max(1.5,(d-70)*.05))*Math.max(1,v)}}
      else{if(!this.meta&&t>this.sig)this.meta={x:40+Math.random()*(innerWidth-80),y:90+Math.random()*(innerHeight-180)};
        if(this.meta){tx=this.meta.x;ty=this.meta.y}}
      if(tx!=null){const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
        if(d>s){e.x+=dx/d*s;e.y+=dy/d*s;mv=true;if(Math.abs(dx)>1)this.cuerpo.style.setProperty('--f',dx<0?1:-1)}
        else if(!e.leash){this.meta=null;this.sig=t+2500+Math.random()*3500}}
    }
    e.x=Math.max(30,Math.min(innerWidth-30,e.x));e.y=Math.max(50,Math.min(innerHeight-30,e.y));
    this.pet.style.transform=`translate(${e.x}px,${e.y}px)`;
    this.pet.classList.toggle('sit',e.sit);this.raiz.classList.toggle('con-correa',e.leash);
    this.cuerpo.classList.toggle('walk',mv);
    if(e.leash){const px=e.x,py=e.y+22,hx=this.mano.x,hy=this.mano.y,sag=Math.min(50,Math.hypot(hx-px,hy-py)*.25);
      this.path.setAttribute('d',`M${hx} ${hy}Q${(hx+px)/2} ${Math.max(hy,py)+sag} ${px} ${py}`);this.mano_c.setAttribute('cx',hx);this.mano_c.setAttribute('cy',hy)}
    else{this.path.setAttribute('d','');this.mano_c.setAttribute('cx',-20)}
    if(mv)this._s();
    requestAnimationFrame(()=>this._frame());
  }
  _pasa(){const e=this.e;e.h=Math.max(0,e.h-1.5);e.j=Math.max(0,e.j-1);
    // si lleva un rato sentada sin que nadie la toque, se duerme
    if(e.sit&&!this.dormido&&Date.now()-this.toque>45000){this.dormido=true;this._di('Zzz… 💤')}
    this._pintar();this._s();
    if(this.dormido){this._p('💤');return}
    if(e.h<25)this._di('¡Tengo hambre! 🦴');else if(e.j<25)this._di('Quiero cariño… 💛');
    else{const F=this.op.frases||[];if(F.length&&Math.random()<.4)this._di(F[Math.floor(Math.random()*F.length)])}}
  _pintar(){const e=this.e;this.bh.style.width=e.h+'%';this.bj.style.width=e.j+'%';
    const est=this.cara&&performance.now()<this.cara.t?this.cara.c:this.dormido?'duerme':(e.h<25||e.j<25)?'triste':'idle';
    if(this._est!==est){this._est=est;if(this.modo==='pixel')this.cuerpo.innerHTML=perro(est)+accesoriosSVG(this.op.accesorios,84);
      else if(this.modo==='emoji')this.cuerpo.textContent=est==='feliz'?'🥰':est==='come'?'😋':est==='triste'?'😿':est==='duerme'?'😴':this.op.imagen}}
  _cara(c,ms){this.cara={c,t:performance.now()+ms};this._pintar();setTimeout(()=>this._pintar(),ms+40)}
  _an(c,ms){const b=this.cuerpo;b.classList.remove(c);void b.offsetWidth;b.classList.add(c);setTimeout(()=>b.classList.remove(c),ms)}
  _di(t){this.say.textContent=t;this.say.style.display='block';clearTimeout(this._tdi);this._tdi=setTimeout(()=>this.say.style.display='none',2200)}
  _p(t,dx=(Math.random()*40-20)+'px',x=this.e.x+Math.random()*40-20,y=this.e.y-30){
    const s=document.createElement('span');s.className='mm-p';s.textContent=t;s.style.cssText=`left:${x}px;top:${y}px;--dx:${dx}`;this.yard.append(s);setTimeout(()=>s.remove(),1000)}
  _caricia(){const t=Date.now();if(t-this.lp<280)return;this.lp=t;this._despierta();this.e.j=Math.min(100,this.e.j+1.5);this._p('❤');this._cara('feliz',1000);this._an('pat',1000);this._pintar();this._s()}
  _mimar(){const m=document.createElement('span');m.className='mm-hand';m.textContent='✋';m.style.cssText=`left:${this.e.x}px;top:${this.e.y-50}px`;this.yard.append(m);
    for(let i=0;i<6;i++)setTimeout(()=>this._p('❤'),i*330);this._cara('feliz',2200);this._an('pat',2000);setTimeout(()=>m.remove(),2100);
    this.e.j=Math.min(100,this.e.j+10);this._pintar();this._s()}
  _comer(){const e=this.e;if(e.h>95){this._an('no',400);this._di('¡Estoy lleno! 😋');return}
    const f=document.createElement('span');f.className='mm-food';f.innerHTML=sprite(HUESO,40);f.style.left=e.x+'px';f.style.top=(e.y-170)+'px';this.yard.append(f);
    requestAnimationFrame(()=>requestAnimationFrame(()=>f.style.top=(e.y-30)+'px'));
    setTimeout(()=>{f.remove();this._cara('come',1300);this._an('eat',1200);['✨','🦴','✨'].forEach(c=>this._p(c));this._di('¡Guau! 🦴');
      e.h=Math.min(100,e.h+25);e.j=Math.min(100,e.j+2);this._pintar();this._s()},550)}
  _jugar(){const e=this.e,b=document.createElement('span');b.className='mm-ball';b.textContent='🎾';b.style.cssText=`left:${e.x+62}px;top:${e.y+20}px`;this.yard.append(b);
    this._an('jump',2300);this._cara('feliz',2400);for(let i=0;i<5;i++)setTimeout(()=>this._p(i%2?'♪':'✨'),i*420);this._di('¡Guau guau! 🎾');setTimeout(()=>b.remove(),2600);
    e.j=Math.min(100,e.j+15);e.h=Math.max(0,e.h-3);this._pintar();this._s()}
  // ---------- álbum ----------
  _abrir(){this.al.hidden=false;this._album()}
  _cerrar(){this.al.hidden=true}
  _ver(d){const n=this.fotos.length;if(n){this.vi=(this.vi+d+n)%n;this._album()}}
  _album(){const a=this.al,n=this.fotos.length;this.vi=Math.min(this.vi,Math.max(0,n-1));
    a.querySelector('h3').textContent='📷 Álbum de '+this.op.nombre;
    const big=a.querySelector('.mm-big'),gr=a.querySelector('.mm-gr');big.innerHTML='';gr.innerHTML='';
    if(!n){big.textContent='Aún no hay fotos.'}
    else{const f=this.fotos[this.vi],im=document.createElement('img');im.src=f.u;im.alt=f.d;big.append(im);
      const c=document.createElement('div');c.textContent=f.d;big.append(c);
      if(n>1){const p=document.createElement('button'),s=document.createElement('button');p.textContent='◀';s.textContent='▶';p.onclick=()=>this._ver(-1);s.onclick=()=>this._ver(1);
        const w=document.createElement('div');w.append(p,' ',(this.vi+1)+' / '+n,' ',s);big.append(w)}}
    this.fotos.forEach((f,i)=>{const d=document.createElement('div'),im=document.createElement('img');im.src=f.u;im.alt=f.d;im.onclick=()=>{this.vi=i;this._album()};d.className=i===this.vi?'sel':'';d.append(im);
      if(this.op.editable){const x=document.createElement('b');x.textContent='✕';x.onclick=()=>{this.fotos.splice(i,1);this._sf();this._album()};d.append(x)}gr.append(d)})}
  async _subir(){const a=this.al;if(!this.op.elegirFoto)return;
    const u=await this.op.elegirFoto();if(!u)return;
    this.fotos.push({u,d:a.querySelector('.mm-desc').value.trim()});this.vi=this.fotos.length-1;a.querySelector('.mm-desc').value='';this._sf();this._album()}
  setEditable(b){this.op.editable=!!b;this.raiz.classList.toggle('mm-ed',!!b);this._album()}
  setFotos(a){this.fotos=this._fx(a||[]);this._album()}
  setNombre(n){this.op.nombre=n||'Mi perrito';this.raiz.querySelector('.mm-nom').textContent=this.op.nombre;this._album()}
  setVisible(b){this.raiz.hidden=!b;if(this.envoltura)this.envoltura.hidden=!b}
  setOpciones(o={}){Object.assign(this.op,o);this._est=null;this._pintar()}
}
window.MascotaDigital=MascotaDigital;
