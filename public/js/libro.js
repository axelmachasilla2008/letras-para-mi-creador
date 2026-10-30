/* Libro estilo Minecraft — libro.js (sin dependencias)
   Uso:  const libro = new LibroMinecraft(elemento, { paginas, editable, onChange, subirImagen });
   Opciones:
     paginas       [{t:'texto', i:'url-imagen'}]
     editable      true/false  -> muestra las herramientas del creador
     etiqueta      (i,n)=>'Página i de n'
     onChange      (paginas)=>{}  -> se llama (con retraso) cada vez que algo cambia
     elegirImagen  async ()=>url  -> abre el selector de imágenes de la página
   Métodos: setPaginas(arr) · setEditable(bool) */
const FLECHA_IZQ='<svg viewBox="0 0 18 14" shape-rendering="crispEdges"><path fill="currentColor" d="M0 7h4V5h2V3h2V1h2V0h2v4h4v2h2v4h-2v2h-6v-2h4V8H9v4H7v-2H5V8H3V7z"/></svg>';
const FLECHA_DER='<svg viewBox="0 0 18 14" shape-rendering="crispEdges"><path fill="currentColor" d="M18 14h-6V8h-2V6h2V4h2V2h2V0h2v14zM2 0h8v2H4v8H2z" opacity=".95"/></svg>';
class LibroMinecraft{
  constructor(el,op={}){
    this.raiz=el;
    this.op=Object.assign({paginas:null,editable:false,etiqueta:(i,n)=>`Página ${i} de ${n}`,onChange:null,elegirImagen:null},op);
    this.paginas=this._limpiar(this.op.paginas&&this.op.paginas.length?this.op.paginas:[{t:'',i:''}]);
    this.n=0;this.editando=false;this._armar();this._pintar();
  }
  _limpiar(a){return a.map(p=>({t:p.t||'',i:p.i||''}))}
  _guardar(){clearTimeout(this._t);this._t=setTimeout(()=>{if(this.op.onChange)this.op.onChange(this.paginas)},400)}
  _armar(){
    this.raiz.innerHTML=`<div class="lmc-w"><div class="lmc" tabindex="0" aria-label="Libro"><div class="lmc-cv"><div class="lmc-pg">
      <span class="lmc-n" aria-live="polite"></span><div class="lmc-c"></div>
      <div class="lmc-nav"><button class="lmc-b" data-a="ant" aria-label="Página anterior">${FLECHA_IZQ}</button><button class="lmc-b" data-a="sig" aria-label="Página siguiente">${FLECHA_DER}</button></div>
      </div></div></div>
      <div class="lmc-tools"><button data-a="edit"></button><button data-a="mas">＋ Página</button><button data-a="del">🗑 Borrar</button>
      <button data-a="img">🖼 Imagen</button><button data-a="noimg">Quitar imagen</button></div></div>`;
    this.raiz.classList.toggle('lmc-ed',!!this.op.editable);
    const libro=this.raiz.querySelector('.lmc'),pg=this.raiz.querySelector('.lmc-pg');
    this.raiz.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)this._accion(b.dataset.a,b)});
    libro.addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA')return;
      if(e.key==='ArrowLeft')this._ir(-1);if(e.key==='ArrowRight')this._ir(1)});
    // deslizar con el dedo para pasar de página
    let x0=null;pg.addEventListener('pointerdown',e=>{if(e.target.tagName!=='TEXTAREA')x0=e.clientX});
    pg.addEventListener('pointerup',e=>{if(x0==null)return;const dx=e.clientX-x0;x0=null;if(Math.abs(dx)>50&&!this.editando)this._ir(dx<0?1:-1)});
    // arrastrar texto seleccionado o una imagen cancelaría el deslizamiento
    pg.addEventListener('dragstart',e=>e.preventDefault());
  }
  _ir(d){const k=this.n+d;if(k<0||k>=this.paginas.length)return;this.n=k;this._pintar(d)}
  _accion(a,b){
    if(a==='ant')this._ir(-1);
    if(a==='sig')this._ir(1);
    if(a==='edit'){this.editando=!this.editando;this._pintar()}
    if(a==='mas'){this.paginas.splice(this.n+1,0,{t:'',i:''});this.n++;this.editando=true;this._guardar();this._pintar(1)}
    if(a==='img')this._imagen();
    if(a==='noimg'){this.paginas[this.n].i='';this._guardar();this._pintar()}
    if(a==='del'){ // dos toques para confirmar
      if(!this._conf){this._conf=1;b.textContent='¿Seguro? toca otra vez';setTimeout(()=>{this._conf=0;b.textContent='🗑 Borrar'},2500);return}
      this._conf=0;b.textContent='🗑 Borrar';
      if(this.paginas.length>1){this.paginas.splice(this.n,1);this.n=Math.max(0,this.n-1)}else this.paginas[0]={t:'',i:''};
      this._guardar();this._pintar(-1)}
  }
  async _imagen(){
    if(!this.op.elegirImagen)return;
    const n=this.n,u=await this.op.elegirImagen();
    if(u){this.paginas[n].i=u;this._guardar();this._pintar()}
  }
  _pintar(dir=0){
    const c=this.raiz.querySelector('.lmc-c');
    const dibujar=()=>{
      const p=this.paginas[this.n],tot=this.paginas.length;c.innerHTML='';
      if(p.i){const im=document.createElement('img');im.src=p.i;im.alt='';im.draggable=false;c.append(im)}
      if(this.editando){const t=document.createElement('textarea');t.className='lmc-ta';t.spellcheck=false;t.value=p.t;
        t.oninput=()=>{p.t=t.value;this._guardar()};c.append(t);t.focus()}
      else{const d=document.createElement('div');d.className='lmc-t';d.textContent=p.t;c.append(d)}
      this.raiz.querySelector('.lmc-n').textContent=this.op.etiqueta(this.n+1,tot);
      this.raiz.querySelector('[data-a=ant]').disabled=this.n===0;
      this.raiz.querySelector('[data-a=sig]').disabled=this.n===tot-1;
      this.raiz.querySelector('[data-a=edit]').textContent=this.editando?'✔ Listo':'✎ Escribir';
    };
    if(dir){c.style.setProperty('--d',(dir*-14)+'px');c.classList.add('fuera');
      setTimeout(()=>{dibujar();c.classList.remove('fuera');c.classList.add('dentro');setTimeout(()=>c.classList.remove('dentro'),160)},120)}
    else dibujar();
  }
  setPaginas(a){this.paginas=this._limpiar(a&&a.length?a:[{t:'',i:''}]);this.n=Math.min(this.n,this.paginas.length-1);this._pintar()}
  setEditable(b){this.op.editable=!!b;if(!b)this.editando=false;this.raiz.classList.toggle('lmc-ed',!!b);this._pintar()}
}
window.LibroMinecraft=LibroMinecraft;
