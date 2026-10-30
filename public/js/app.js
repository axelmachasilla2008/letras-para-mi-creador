// ============================================================
// letras para mi creador — app.js
// El contenido (publicaciones, perfil, libro, música, álbum…) vive en el
// servidor (MongoDB Atlas). La mascota, el ánimo, la pizarra y el tiempo
// de visita se guardan en el navegador de cada visitante.
// ============================================================

// ============================================================
// Utilidades
// ============================================================
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Crear un elemento con propiedades e innerHTML opcional
// (las claves con guion, como 'aria-label', y 'role' se ponen como atributos)
const E = (t, p, h) => {
  const e = document.createElement(t);
  for (const k in p || {}) {
    if (k.includes('-') || k === 'role') e.setAttribute(k, p[k]);
    else e[k] = p[k];
  }
  if (h != null) e.innerHTML = h;
  return e;
};

// Escapar HTML para evitar inyección
const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

// URL segura: http(s) o archivos de la propia página (archivos/ e img/)
const ok = (u) => (/^(https?:\/\/|archivos\/|img\/)/.test(u || '') && !/\.\.|[<>"]/.test(u) ? u : '');
// "instagram.com/usuario" → "https://instagram.com/usuario" (si no, el enlace no llevaría a ningún lado)
const conHttps = (u) => (u && !/^(https?:\/\/|archivos\/|img\/)/i.test(u) && /^(www\.)?[\w-]+(\.[\w-]+)+(\/|$)/.test(u) ? 'https://' + u : u);

// Acceso a localStorage (null borra)
const ls = (k, v) => {
  try {
    if (v === undefined) return localStorage.getItem(k);
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch (e) {}
};

const clonar = (o) => JSON.parse(JSON.stringify(o));
const hoy = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fechaBonita = (f) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(f || '');
  return m ? `${+m[3]} ${MESES[+m[2] - 1]} ${m[1]}` : (f || '');
};

// Mostrar un mensaje temporal en pantalla
let tMsg;
function msg(t) {
  const m = $('#ms');
  m.textContent = t;
  m.classList.remove('ve');
  void m.offsetWidth;
  m.classList.add('ve');
  clearTimeout(tMsg);
  tMsg = setTimeout(() => m.classList.remove('ve'), 3200);
}

// Los datos se guardan en MongoDB Atlas (a través de server.js): ver datos.js (api, archivosDisponibles, mimeDe)

// ============================================================
// Datos iniciales y estado
// ============================================================
const D = {
  titulo: 'letras para mi creador',
  lema: '⛏ minecraft · ♪ enjambre ♪',
  banner: '',
  gif: '',
  // ambiente: textura, cabecera animada, partículas y criaturas (temas.js)
  tema: { acento: '#f7d34a', marron: '#5a3825', fondo: '#fff1a8', papel: '#fbf4dc', texto: '#3b2416', modo: 'auto', ambiente: 'panal', particulas: true, criaturas: true },
  perfil: { n: 'Nombres', a: 'Apellidos', d: 'Detalles de la creadora…', foto: '' },
  redes: [{ l: 'Instagram', u: '#' }, { l: 'TikTok', u: '#' }, { l: 'YouTube', u: '#' }],
  pestanas: ['Inicio'],
  libro: { titulo: 'Mi libro', paginas: [{ t: 'Bienvenid@ a mi rincón ✦\nAquí van mis letras, canciones de Enjambre y más.', i: '' }] },
  musica: [],
  eventos: {},
  mascota: { nombre: 'Mi perrito', imagen: '', velocidad: 1, frases: [], accesorios: {} },
  album: [
    { u: 'img/fotos/perrito-1.jpg', d: 'Dormidito en el sillón' },
    { u: 'img/fotos/perrito-2.jpg', d: 'Esa nariz' },
    { u: 'img/fotos/perrito-3.jpg', d: 'Sacando la lengua' },
    { u: 'img/fotos/perrito-4.jpg', d: 'De paseo' },
  ],
  // elementos libres del Modo Creador (texto, imagen, sticker, botón)
  elementos: [
    { id: 'abeja', tipo: 'sticker', c: '🐝', x: 2, y: 420, w: 56, r: -12, z: 1, anim: 'flotar' },
    { id: 'estrella', tipo: 'sticker', c: '⭐', x: 60, y: 22, w: 48, r: 0, z: 2 },
  ],
  animos: ['😊 feliz', '🤩 emocionad@', '😴 con sueño', '😢 triste', '😡 enojad@', '🎶 musical'],
  paneles: { musica: true, mascota: true, pizarra: true, animo: true, calendario: true },
  orden: ['musica', 'mascota', 'pizarra', 'animo', 'calendario'],
  titulos: {},
  // estilos globales (fuentes, tamaño, fondo de la página) y de cada sección/widget
  global: { fTitulo: 'pix', fTexto: 'vt', tam: 22, patron: 'tema', fondoImg: '', v: 2 },
  estilos: {},
  css: '',
  bloquesGuardados: [],
  // personaje invitado en la cabecera (temas.js → Cameo)
  // x, y: dónde lo dejó la creadora (vacío = esquina de la cabecera)
  cameo: { visible: true, nombre: 'AuronPlay', saludo: SALUDO_CAMEO, frases: FRASES_CAMEO.slice() },
};

// Combina lo guardado con los valores por defecto (objetos se mezclan, listas se reemplazan)
function mezclar(base, d) {
  const r = clonar(base);
  for (const k in d || {}) {
    const a = r[k], b = d[k];
    r[k] = a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b) ? Object.assign(a, b) : b;
  }
  return r;
}

let S = clonar(D);   // datos de la página
let P = [];          // publicaciones
let adm = false;     // modo creador
let pestana = 'Inicio';
let busq = '';

// Guardar los datos generales (con retraso para no guardar en cada tecla).
// Cada cambio queda en el historial para deshacer/rehacer (modo-creador.js).
let tGuardar = null;
function guardarSitio(sinHistoria) {
  if (!adm) return;
  if (!sinHistoria) registrarHistoria();
  estado('Guardando…');
  clearTimeout(tGuardar);
  tGuardar = setTimeout(guardarAhora, 700);
}
async function guardarAhora() {
  clearTimeout(tGuardar);
  tGuardar = null;
  try {
    await api('sitio', { method: 'PUT', json: S });
    estado('Guardado ✓');
  } catch (e) {
    estado('⚠ No se guardó', true);
    msg('No se pudo guardar. Revisa tu conexión y toca 💾 Guardar.');
  }
}
addEventListener('beforeunload', (e) => { if (tGuardar) { e.preventDefault(); e.returnValue = ''; } });

function estado(t, aviso) {
  const e = $('#ba-estado');
  e.textContent = t;
  e.title = 'Datos guardados en MongoDB Atlas';
  e.classList.toggle('aviso', !!aviso);
}

// ============================================================
// Colores
// ============================================================
// Los temas completos (colores + textura + efectos) están en temas.js → AMBIENTES
const OSCURO = { marron: '#2c1a10', fondo: '#3a3220', papel: '#4a3d28', texto: '#fbefc7' };
const prefOscuro = matchMedia('(prefers-color-scheme: dark)');

function aplicarTema(t = S.tema) {
  t = Object.assign({}, D.tema, t);
  // "Automático" solo oscurece el tema Panal; los demás ambientes ya traen sus colores
  const oscuro = t.modo === 'oscuro' || (t.modo === 'auto' && (t.ambiente || 'panal') === 'panal' && prefOscuro.matches);
  const v = oscuro ? Object.assign({}, t, OSCURO) : t;
  // un fondo oscuro elegido a mano (por ejemplo "End") también cuenta como oscuro
  const fondoOscuro = oscuro || luz(v.fondo) < 0.35;
  const r = document.documentElement;
  r.style.setProperty('--y2', v.acento);
  r.style.setProperty('--br', v.marron);
  r.style.setProperty('--ye', v.fondo);
  r.style.setProperty('--pa', v.papel);
  r.style.setProperty('--tx', v.texto);
  r.style.setProperty('--dt', fondoOscuro ? '#0003' : '#fff8');
  r.dataset.tema = fondoOscuro ? 'oscuro' : 'claro';
  aplicarAmbiente(t);
}

// ✨ Efectos: cada visitante puede apagar las partículas y criaturas
$('#efectos').onclick = () => {
  ls('efectos', ls('efectos') === '0' ? '1' : '0');
  aplicarAmbiente(S.tema, true);
  msg(ls('efectos') === '0' ? 'Efectos apagados' : '✨ Efectos encendidos');
};
function luz(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255;
}
prefOscuro.addEventListener('change', () => aplicarTema());

// ============================================================
// Ventanas (modales)
// ============================================================
let modalActual = null;

function modal(html, clase = '', op = {}) {
  cerrarModal();
  const m = $('#md');
  m.innerHTML = `<div class="caja ${clase}" role="dialog" aria-modal="true"><button class="cerrar" aria-label="Cerrar">✕</button>${html}</div>`;
  m.hidden = false;
  document.body.classList.add('con-modal');
  const caja = m.firstElementChild;
  modalActual = { op, previo: document.activeElement };
  caja.querySelector('.cerrar').onclick = () => intentarCerrar();
  setTimeout(() => (caja.querySelector('[autofocus]') || caja.querySelector('.cerrar')).focus(), 40);
  return caja;
}
function cerrarModal() {
  if (!modalActual) return;
  const { op, previo } = modalActual;
  modalActual = null;
  const m = $('#md');
  m.hidden = true;
  m.innerHTML = '';
  document.body.classList.remove('con-modal');
  if (op.alCerrar) op.alCerrar();
  if (previo && previo.focus) previo.focus();
}
// las ventanas con cambios sin guardar preguntan antes de cerrarse
function intentarCerrar() {
  if (modalActual && modalActual.op.sucio && modalActual.op.sucio() && !window.confirm('¿Cerrar sin guardar los cambios?')) return;
  cerrarModal();
}
$('#md').addEventListener('pointerdown', (e) => { if (e.target.id === 'md' && !(modalActual && modalActual.op.fijo)) intentarCerrar(); });
document.addEventListener('keydown', (e) => {
  if (!modalActual) return;
  if (e.key === 'Escape') { e.preventDefault(); intentarCerrar(); }
  else if (modalActual.op.tecla) modalActual.op.tecla(e);
});

function preguntar(titulo, valor = '') {
  return new Promise((listo) => {
    let hecho = false;
    const fin = (v) => { if (hecho) return; hecho = true; cerrarModal(); listo(v); };
    const caja = modal(`<h2>${esc(titulo)}</h2><input id="p-val" autofocus maxlength="60">
      <div class="acciones-modal"><button class="sec" id="p-no">Cancelar</button><button class="prin" id="p-si">Aceptar</button></div>`, 'chica', { alCerrar: () => fin(null) });
    const i = $('#p-val', caja);
    i.value = valor;
    $('#p-si', caja).onclick = () => fin(i.value.trim());
    $('#p-no', caja).onclick = () => fin(null);
    i.onkeydown = (e) => { if (e.key === 'Enter') fin(i.value.trim()); };
  });
}

function confirmar(texto, si = 'Sí, borrar') {
  return new Promise((listo) => {
    let hecho = false;
    const fin = (v) => { if (hecho) return; hecho = true; cerrarModal(); listo(v); };
    const caja = modal(`<h2>${esc(texto)}</h2>
      <div class="acciones-modal"><button class="sec" id="c-no" autofocus>Cancelar</button><button class="prin" id="c-si">${esc(si)}</button></div>`, 'chica', { alCerrar: () => fin(false) });
    $('#c-si', caja).onclick = () => fin(true);
    $('#c-no', caja).onclick = () => fin(false);
  });
}

// ============================================================
// Elegir un archivo: subirlo desde el dispositivo (se guarda en Atlas),
// pegar un enlace o elegir uno de los que ya tiene la página
// ============================================================
function vistaPrevia(url, mime) {
  mime = mime || mimeDe(url);
  if (/^image\//.test(mime)) return E('img', { src: url, alt: '' });
  if (/^video\//.test(mime)) return E('video', { src: url, controls: true, muted: true });
  if (/^audio\//.test(mime)) return E('audio', { src: url, controls: true });
  if (ytId(url)) return E('img', { src: `https://img.youtube.com/vi/${ytId(url)}/hqdefault.jpg`, alt: '' });
  return E('div', {}, `<span class="grande">🔗</span><br>${esc(url.length > 46 ? url.slice(0, 44) + '…' : url)}`);
}

// Ventana para elegir: devuelve la dirección elegida (o null si se cancela).
// Va encima de todo, para poder usarla dentro de otras ventanas.
function elegirArchivo(acepta = '', titulo = 'Elegir archivo') {
  const tipo = (acepta.split('/')[0] || '').replace('*', '');
  return new Promise(async (listo) => {
    const capa = E('div', { className: 'selector', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo });
    capa.innerHTML = `<div class="caja selector-caja">
      <h2>📁 ${esc(titulo)}</h2>
      ${puedeSubir() ? `<div class="zona selector-subir" tabindex="0" role="button"><span class="grande">⬆</span><b>Subir desde tu dispositivo</b>
        <small>Toca aquí o arrastra el archivo</small><input type="file" accept="${esc(acepta)}" hidden></div>` : ''}
      <label class="campo"><span>${puedeSubir() ? '…o pega' : 'Pega'} un enlace (https://…)</span>
        <span class="selector-enlace"><input type="url" placeholder="https://…"><button type="button" class="prin">Usar</button></span></label>
      <div class="campo"><span>…o elige un archivo que ya tiene la página</span><div class="selector-lista"><p class="ayuda">Cargando…</p></div></div>
      <div class="acciones-modal"><button type="button" class="sec s-cancelar">Cancelar</button></div></div>`;
    // subir al servidor (Atlas)
    const zs = $('.selector-subir', capa);
    if (zs) {
      const fi = $('input[type=file]', zs);
      const enviar = async (f) => {
        if (!f) return;
        zs.innerHTML = '<div class="progreso"><i style="width:0%"></i></div><span>Subiendo… 0%</span>';
        try {
          const r = await subir(f, (p) => { zs.innerHTML = `<div class="progreso"><i style="width:${Math.round(p * 100)}%"></i></div><span>Subiendo… ${Math.round(p * 100)}%</span>`; });
          msg('Archivo subido ✓');
          fin(r.url);
        } catch (e) {
          msg(e.message);
          zs.innerHTML = '<span class="grande">⬆</span><b>Subir desde tu dispositivo</b><small>Intenta otra vez</small>';
          zs.append(fi);
        }
      };
      zs.onclick = (e) => { if (e.target !== fi && !zs.querySelector('.progreso')) fi.click(); };
      zs.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fi.click(); } };
      fi.onchange = () => enviar(fi.files[0]);
      zs.ondragover = (e) => { e.preventDefault(); zs.classList.add('encima'); };
      zs.ondragleave = () => zs.classList.remove('encima');
      zs.ondrop = (e) => { e.preventDefault(); zs.classList.remove('encima'); enviar(e.dataTransfer.files[0]); };
    }
    let hecho = false;
    const fin = (v) => { if (hecho) return; hecho = true; capa.remove(); document.removeEventListener('keydown', tecla, true); listo(v); };
    const tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); fin(null); } };
    document.addEventListener('keydown', tecla, true);
    capa.onclick = (e) => { if (e.target === capa) fin(null); };
    $('.s-cancelar', capa).onclick = () => fin(null);
    const inp = $('.selector-enlace input', capa);
    const usarEnlace = () => {
      const u = inp.value.trim();
      if (!/^https:\/\//.test(u)) return msg('El enlace debe empezar con https://');
      fin(u);
    };
    $('.selector-enlace .prin', capa).onclick = usarEnlace;
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); usarEnlace(); } };
    document.body.append(capa);
    setTimeout(() => inp.focus(), 30);

    const L = (await archivosDisponibles()).filter((a) => !tipo || a.tipo.startsWith(tipo));
    const lista = $('.selector-lista', capa);
    lista.innerHTML = '';
    if (!L.length) lista.append(E('p', { className: 'ayuda' }, 'Todavía no hay archivos de este tipo en la página.'));
    L.forEach((a) => {
      const vista = a.tipo.startsWith('image/') ? `<img src="${esc(a.u)}" alt="" loading="lazy">`
        : `<span class="selector-ico">${a.tipo.startsWith('audio/') ? '🎵' : a.tipo.startsWith('video/') ? '🎬' : '📄'}</span>`;
      lista.append(E('button', { type: 'button', className: 'selector-op', title: a.nombre, onclick: () => fin(a.u) }, `${vista}<small>${esc(a.nombre)}</small>`));
    });
  });
}

function zona(el, op) {
  // op: { acepta, texto, icono, url, mime, alCambiar(url, mime, archivo) }
  let url = op.url || '', mime = op.mime || mimeDe(op.url);
  el.tabIndex = 0;
  el.setAttribute('role', 'button');

  const pintar = () => {
    el.innerHTML = '';
    if (url) {
      el.append(vistaPrevia(url, mime));
      el.append(E('button', { type: 'button', className: 'sec quitar', onclick(e) {
        e.stopPropagation();
        url = ''; mime = '';
        op.alCambiar('', '');
        pintar();
      } }, '✕ Quitar'));
    } else {
      el.innerHTML = `<span class="grande">${op.icono || '📁'}</span><b>${esc(op.texto)}</b><small>${puedeSubir() ? 'Toca para subir un archivo, pegar un enlace o elegir uno de la página' : 'Toca para elegir un archivo de la página o pegar un enlace'}</small>`;
    }
  };

  const elegir = async () => {
    const u = await elegirArchivo(op.acepta || '', op.texto);
    if (!u) return;
    url = u;
    mime = mimeDe(u);
    op.alCambiar(url, mime, { name: decodeURIComponent(u.split('?')[0].split('/').pop()) });
    pintar();
  };
  el.onclick = (e) => { if (e.target.closest('.quitar, audio, video, .progreso')) return; elegir(); };
  el.onkeydown = (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === el) { e.preventDefault(); elegir(); } };
  // arrastrar un archivo directo a la zona lo sube al servidor (Atlas)
  el.ondragover = (e) => { if (puedeSubir()) { e.preventDefault(); el.classList.add('encima'); } };
  el.ondragleave = () => el.classList.remove('encima');
  el.ondrop = async (e) => {
    e.preventDefault();
    el.classList.remove('encima');
    const f = e.dataTransfer.files[0];
    if (!f || !puedeSubir()) return;
    el.innerHTML = '<div class="progreso"><i style="width:0%"></i></div><span>Subiendo…</span>';
    try {
      const r = await subir(f, (p) => { const i = $('.progreso i', el); if (i) i.style.width = Math.round(p * 100) + '%'; });
      url = r.url;
      mime = r.tipo;
      op.alCambiar(url, mime, f);
      msg('Archivo subido ✓');
    } catch (err) { msg(err.message); }
    pintar();
  };
  pintar();
  return { get url() { return url; }, get mime() { return mime; } };
}

// ============================================================
// Cabecera: título, perfil, redes y gif
// ============================================================
function redesHTML() {
  return S.redes.map((r) => `<a href="${esc(ok(r.u) || '#')}" target="_blank" rel="noopener">${esc(r.l)}</a>`).join('');
}

function cabecera() {
  document.title = S.titulo || D.titulo;
  $('#titulo').textContent = S.titulo || D.titulo;
  $('#pie-titulo').textContent = S.titulo || D.titulo;
  $('#lema').textContent = S.lema || '';
  const b = $('#hero-banner');
  const ban = ok(S.banner);
  b.classList.toggle('con-foto', !!ban);
  b.style.backgroundImage = ban ? `url("${ban}")` : '';

  const p = S.perfil;
  const foto = ok(p.foto);
  $('#perfil').innerHTML = `<div class="avatar">${foto ? `<img src="${esc(foto)}" alt="">` : '🙂'}</div>
    <div><p class="perfil-nombre">${esc(p.n)} ${esc(p.a)}</p><p class="perfil-bio">${esc(p.d)}</p><div class="soc">${redesHTML()}</div></div>`;
  $('#pie-redes').innerHTML = redesHTML();

  const g = ok(S.gif);
  $('#gf').innerHTML = g ? `<img src="${esc(g)}" alt="">` : '';
}

// ============================================================
// Publicaciones
// ============================================================
const TIPOS = {
  nota: ['📝', 'Nota'],
  imagen: ['🖼', 'Imagen'],
  video: ['🎬', 'Video'],
  audio: ['🎵', 'Canción'],
  libro: ['📖', 'Libro'],
  enlace: ['🔗', 'Enlace'],
};

const ytId = (u) => {
  const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/.exec(u || '');
  return m ? m[1] : '';
};

// Qué clase de archivo tiene la publicación
function clase(p) {
  const m = p.mediaTipo || '', u = (p.media || '').toLowerCase();
  if (m.startsWith('image/') || /\.(png|jpe?g|gif|webp|avif)(\?|$)/.test(u)) return 'imagen';
  if (m.startsWith('video/') || /\.(mp4|webm|mov|ogv)(\?|$)/.test(u)) return 'video';
  if (m.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/.test(u)) return 'audio';
  if (m === 'application/pdf' || /\.pdf(\?|$)/.test(u)) return 'pdf';
  return u ? 'archivo' : '';
}

function ordenar() {
  P.sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')) || (b.creado || 0) - (a.creado || 0));
}

function lista() {
  return P.filter((p) =>
    (pestana === 'Inicio' || (p.pestana || 'Inicio') === pestana) &&
    (!busq || [p.titulo, p.texto, textoDe(p), p.fecha, fechaBonita(p.fecha), (TIPOS[p.tipo] || [])[1]].join(' ').toLowerCase().includes(busq)));
}

// La imagen o video que se ve en la tarjeta
function miniatura(p) {
  const k = clase(p), u = ok(p.media), por = ok(p.portada) || (!u ? imagenDe(p) : ''), yt = ytId(p.media || p.enlace);
  const play = k === 'video' || k === 'audio' || yt ? '<span class="play" aria-hidden="true">▶</span>' : '';
  if (por) return `<img src="${esc(por)}" alt="" loading="lazy">${play}`;
  if (k === 'imagen' && u) return `<img src="${esc(u)}" alt="" loading="lazy">`;
  if (k === 'video' && u) return `<video src="${esc(u)}#t=0.5" muted playsinline loop preload="metadata"></video>${play}`;
  if (yt) return `<img src="https://img.youtube.com/vi/${yt}/hqdefault.jpg" alt="" loading="lazy">${play}`;
  if (k === 'audio') return `<div class="disco" aria-hidden="true">💿</div>${play}`;
  if (k) return `<div class="icono-grande" aria-hidden="true">${(TIPOS[p.tipo] || TIPOS.libro)[0]}</div>`;
  return '';
}

function accionesAdmin(p) {
  const a = E('div', { className: 'acciones' });
  a.append(
    E('button', { title: p.destacado ? 'Quitar de destacada' : 'Destacar', 'aria-label': 'Destacar', onclick(e) { e.stopPropagation(); destacar(p); } }, p.destacado ? '★' : '☆'),
    E('button', { title: 'Editar', onclick(e) { e.stopPropagation(); editor(p); } }, '✎'),
    E('button', { title: 'Borrar', onclick(e) { e.stopPropagation(); borrarPub(p); } }, '🗑'),
  );
  return a;
}

function tarjeta(p, i) {
  const media = miniatura(p);
  const t = TIPOS[p.tipo] || TIPOS.nota;
  const c = E('article', {
    className: 'tarjeta' + (p.destacado ? ' ancha' : '') + (media ? '' : ' sin-media'),
    tabIndex: 0,
    onclick: () => ver(p),
    onkeydown: (e) => { if (e.key === 'Enter') ver(p); },
  });
  c.style.setProperty('--i', Math.min(i, 12));
  c.innerHTML = (p.destacado ? '<span class="t-estrella" title="Destacada">★</span>' : '') +
    (media ? `<div class="t-media">${media}</div>` : '') +
    `<div class="t-cuerpo"><span class="t-tipo">${t[0]} ${t[1]}</span>
      <h3>${esc(p.titulo || 'Sin título')}</h3>
      ${textoDe(p) ? `<p>${esc(textoDe(p))}</p>` : ''}
      <small>${esc(fechaBonita(p.fecha))}${p.pestana && p.pestana !== 'Inicio' ? ' · ' + esc(p.pestana) : ''}</small></div>`;
  // los videos se reproducen solos (sin sonido) al pasar el mouse
  const v = c.querySelector('video');
  if (v) {
    c.onmouseenter = () => v.play().catch(() => {});
    c.onmouseleave = () => v.pause();
  }
  c.append(accionesAdmin(p));
  return c;
}

function publicaciones() {
  pestanas();
  const L = lista();
  // la destacada (la más reciente con ★) va grande arriba, solo en "Inicio" sin búsqueda
  const top = pestana === 'Inicio' && !busq ? P.find((p) => p.destacado) : null;
  const d = $('#destacada');
  d.hidden = !top;
  d.innerHTML = '';
  if (top) {
    const media = miniatura(top);
    d.className = 'destacada' + (media ? '' : ' sin-media');
    d.innerHTML = (media ? `<div class="d-media">${media}</div>` : '') +
      `<div class="d-texto"><span class="d-sello">★ Destacada</span><h2>${esc(top.titulo || 'Sin título')}</h2>
       ${textoDe(top) ? `<p>${esc(textoDe(top))}</p>` : ''}<small>${esc(fechaBonita(top.fecha))} · ${esc((TIPOS[top.tipo] || TIPOS.nota)[1])}</small></div>`;
    d.onclick = () => ver(top);
    d.append(accionesAdmin(top));
    const v = d.querySelector('video');
    if (v) { v.autoplay = true; v.play().catch(() => {}); }
  }

  const g = $('#rejilla');
  g.innerHTML = '';
  const resto = top ? L.filter((p) => p !== top) : L;
  resto.forEach((p, i) => g.append(tarjeta(p, i)));
  if (!resto.length && !top) {
    const v = E('div', { className: 'vacio' }, busq
      ? `Nada coincide con “${esc(busq)}”.`
      : `<img src="img/portada.png" alt=""><span>${adm ? 'Todavía no hay publicaciones aquí.' : 'Pronto habrá publicaciones aquí ✦'}</span>`);
    if (adm && !busq) v.append(E('button', { className: 'prin', onclick: () => editor() }, '➕ Crear la primera publicación'));
    g.append(v);
  }
}

function pestanas() {
  if (!S.pestanas.includes(pestana)) pestana = 'Inicio';
  const n = $('#pestanas');
  n.innerHTML = '';
  S.pestanas.forEach((nombre) => {
    const cuenta = nombre === 'Inicio' ? P.length : P.filter((p) => (p.pestana || 'Inicio') === nombre).length;
    const b = E('button', { className: 'pestana', onclick: () => { pestana = nombre; publicaciones(); } }, `${esc(nombre)} <b>${cuenta}</b>`);
    b.setAttribute('aria-pressed', nombre === pestana);
    if (adm && nombre !== 'Inicio' && nombre === pestana) {
      b.append(
        E('span', { className: 'mini', title: 'Cambiar nombre', role: 'button', onclick(e) { e.stopPropagation(); renombrarPestana(nombre); } }, '✎'),
        E('span', { className: 'mini', title: 'Borrar pestaña', role: 'button', onclick(e) { e.stopPropagation(); borrarPestana(nombre); } }, '✕'),
      );
    }
    n.append(b);
  });
  if (adm) n.append(E('button', { className: 'pestana nueva', onclick: nuevaPestana }, '＋ Pestaña'));
}

async function nuevaPestana() {
  const n = await preguntar('Nombre de la nueva pestaña');
  if (!n) return;
  if (S.pestanas.includes(n)) return msg('Ya existe esa pestaña');
  S.pestanas.push(n);
  pestana = n;
  guardarSitio();
  publicaciones();
}

// Cambiar el nombre también mueve sus publicaciones
async function renombrarPestana(viejo) {
  const n = await preguntar('Nuevo nombre de la pestaña', viejo);
  if (!n || n === viejo) return;
  if (S.pestanas.includes(n)) return msg('Ya existe esa pestaña');
  S.pestanas[S.pestanas.indexOf(viejo)] = n;
  await moverPublicaciones(viejo, n);
  pestana = n;
  guardarSitio();
  publicaciones();
}

async function borrarPestana(nombre) {
  if (!(await confirmar(`¿Borrar la pestaña “${nombre}”? Sus publicaciones pasan a Inicio.`))) return;
  S.pestanas = S.pestanas.filter((x) => x !== nombre);
  await moverPublicaciones(nombre, 'Inicio');
  pestana = 'Inicio';
  guardarSitio();
  publicaciones();
}

async function moverPublicaciones(de, a) {
  for (const p of P.filter((x) => x.pestana === de)) {
    try { Object.assign(p, await api('publicaciones/' + p.id, { method: 'PUT', json: { pestana: a } })); } catch (e) { msg(e.message); }
  }
}

async function destacar(p) {
  try {
    Object.assign(p, await api('publicaciones/' + p.id, { method: 'PUT', json: { destacado: !p.destacado } }));
    publicaciones();
    msg(p.destacado ? '★ Ahora es la destacada' : 'Ya no está destacada');
  } catch (e) { msg(e.message); }
}

async function borrarPub(p) {
  if (!(await confirmar(`¿Borrar “${p.titulo || 'esta publicación'}”? También se borra su archivo.`))) return;
  try {
    await api('publicaciones/' + p.id, { method: 'DELETE' });
    P = P.filter((x) => x !== p);
    cerrarModal();
    publicaciones();
    calendario();
    msg('Publicación borrada');
  } catch (e) { msg(e.message); }
}

// ============================================================
// Visor de publicaciones (grande, con flechas)
// ============================================================
function ver(p) {
  let L = lista();
  if (!L.includes(p)) L = [p];
  let i = L.indexOf(p);

  const caja = modal('<div class="visor"></div>', 'ver', {
    tecla: (e) => {
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    },
  });
  const v = $('.visor', caja);
  const mover = (d) => { if (L.length > 1) { i = (i + d + L.length) % L.length; pintar(); } };

  function pintar() {
    const x = L[i], k = clase(x), u = ok(x.media), por = ok(x.portada), yt = ytId(x.media || x.enlace);
    let media = '';
    if (yt) media = `<iframe src="https://www.youtube-nocookie.com/embed/${yt}?autoplay=1" title="${esc(x.titulo)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    else if (k === 'imagen') media = `<img src="${esc(u)}" alt="${esc(x.titulo)}">`;
    else if (k === 'video') media = `<video src="${esc(u)}" controls autoplay playsinline ${por ? `poster="${esc(por)}"` : ''}></video>`;
    else if (k === 'audio') media = `<div class="v-audio">${por ? `<img src="${esc(por)}" alt="">` : '<div style="font-size:120px">💿</div>'}<audio src="${esc(u)}" controls autoplay></audio></div>`;
    else if (k === 'pdf') media = `<iframe src="${esc(u)}" title="${esc(x.titulo)}"></iframe>`;
    else if (por) media = `<img src="${esc(por)}" alt="${esc(x.titulo)}">`;

    const t = TIPOS[x.tipo] || TIPOS.nota;
    v.className = 'visor' + (media ? '' : ' sin-media');
    caja.classList.toggle('largo', !!(x.bloques && x.bloques.length));
    v.innerHTML = (media ? `<div class="v-media">${media}</div>` : '') +
      `<div class="v-texto"><span class="t-tipo">${t[0]} ${t[1]}</span><h2>${esc(x.titulo || 'Sin título')}</h2>
        <small>${esc(fechaBonita(x.fecha))}${x.pestana && x.pestana !== 'Inicio' ? ' · ' + esc(x.pestana) : ''}</small>
        ${x.texto ? `<p>${esc(x.texto)}</p>` : ''}
        ${x.bloques && x.bloques.length ? `<div class="bloques">${htmlBloques(x.bloques)}</div>` : ''}
        ${ok(x.enlace) && !yt ? `<a class="v-enlace" href="${esc(ok(x.enlace))}" target="_blank" rel="noopener">Abrir enlace ↗</a>` : ''}
        ${k === 'pdf' || k === 'archivo' ? `<a class="v-enlace" href="${esc(u)}" target="_blank" rel="noopener">📥 Abrir / descargar archivo</a>` : ''}
        <div class="v-nav"></div></div>`;
    const nav = $('.v-nav', v);
    if (L.length > 1) {
      nav.append(E('button', { onclick: () => mover(-1), 'aria-label': 'Anterior' }, '◀'), E('span', {}, `${i + 1} / ${L.length}`), E('button', { onclick: () => mover(1), 'aria-label': 'Siguiente' }, '▶'));
    }
    if (adm) nav.append(E('button', { onclick: () => editor(x) }, '✎ Editar'), E('button', { onclick: () => borrarPub(x) }, '🗑'));
  }
  pintar();
}

// ============================================================
// Crear / editar publicación
// ============================================================
function editor(p) {
  const nuevo = !p;
  const x = p ? clonar(p) : { tipo: '', fecha: hoy(), pestana, destacado: false };
  let tipoTocado = !nuevo;

  const caja = modal(`<h2>${nuevo ? '➕ Nueva publicación' : '✎ Editar publicación'}</h2>
    <div class="zona" id="z-media"></div>
    <label class="campo"><span>Título</span><input id="e-titulo" maxlength="140" autofocus placeholder="Ej: Mi canción favorita de Enjambre"></label>
    <label class="campo"><span>Texto o reseña</span><textarea id="e-texto" rows="6" placeholder="Escribe lo que quieras contar…"></textarea></label>
    <div class="fila">
      <label class="campo"><span>Tipo</span><select id="e-tipo">${Object.entries(TIPOS).map(([k, v]) => `<option value="${k}">${v[0]} ${v[1]}</option>`).join('')}</select></label>
      <label class="campo"><span>Fecha</span><input id="e-fecha" type="date"></label>
      <label class="campo"><span>Pestaña</span><select id="e-pestana">${S.pestanas.map((n) => `<option>${esc(n)}</option>`).join('')}</select></label>
    </div>
    <details class="mas"${x.enlace || x.portada ? ' open' : ''}><summary>Más opciones: enlace y portada</summary>
      <label class="campo"><span>Enlace (YouTube, Spotify, una página…)</span><input id="e-enlace" type="url" placeholder="https://…"></label>
      <div class="campo"><span>Portada (opcional, para videos y canciones)</span><div class="zona chica" id="z-portada"></div></div>
    </details>
    <div class="campo"><span>Bloques (títulos, fotos, galería, YouTube, reseña, cita, lista)</span><div id="e-bloques" class="b-editor"></div></div>
    <label class="check"><input type="checkbox" id="e-dest"> ★ Destacar: se ve grande arriba de todo</label>
    <div class="acciones-modal"><button class="sec" id="e-cancelar">Cancelar</button><button class="prin" id="e-ok">${nuevo ? '✨ Publicar' : 'Guardar cambios'}</button></div>`,
  'editor', { fijo: true, sucio: () => sucio, tecla: (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#e-ok', caja).click(); } });

  let sucio = false;
  const f = (id) => $('#' + id, caja);
  f('e-titulo').value = x.titulo || '';
  f('e-texto').value = x.texto || '';
  f('e-tipo').value = x.tipo || 'nota';
  f('e-fecha').value = x.fecha || hoy();
  f('e-pestana').value = S.pestanas.includes(x.pestana) ? x.pestana : 'Inicio';
  f('e-enlace').value = x.enlace || '';
  f('e-dest').checked = !!x.destacado;
  caja.addEventListener('input', () => { sucio = true; });
  f('e-tipo').onchange = () => { tipoTocado = true; };
  f('e-enlace').oninput = () => { if (!tipoTocado && !zm.url && f('e-enlace').value) f('e-tipo').value = ytId(f('e-enlace').value) ? 'video' : 'enlace'; };

  const zm = zona(f('z-media'), {
    texto: 'Elige una foto, video, canción o PDF', icono: '📦', url: ok(x.media), mime: x.mediaTipo,
    alCambiar(url, mime, archivo) {
      sucio = true;
      if (!tipoTocado && url) f('e-tipo').value = /^image/.test(mime) ? 'imagen' : /^video/.test(mime) ? 'video' : /^audio/.test(mime) ? 'audio' : /pdf/.test(mime) ? 'libro' : 'nota';
      if (archivo && !f('e-titulo').value) f('e-titulo').value = archivo.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    },
  });
  const zp = zona(f('z-portada'), { texto: 'Imagen de portada', icono: '🖼', acepta: 'image/*', url: ok(x.portada), mime: x.portada ? 'image/' : '', alCambiar() { sucio = true; } });
  const eb = editorBloques(f('e-bloques'), x.bloques, () => { sucio = true; });

  f('e-cancelar').onclick = () => intentarCerrar();
  f('e-ok').onclick = async () => {
    const d = {
      titulo: f('e-titulo').value.trim(),
      texto: f('e-texto').value.trim(),
      tipo: f('e-tipo').value,
      fecha: f('e-fecha').value || hoy(),
      pestana: f('e-pestana').value,
      enlace: conHttps(f('e-enlace').value.trim()),
      destacado: f('e-dest').checked,
      media: zm.url,
      mediaTipo: zm.mime,
      portada: zp.url,
      bloques: eb.valor(),
    };
    if (!d.titulo && !d.texto && !d.media && !d.enlace && !d.bloques.length) return msg('Escribe algo o sube un archivo');
    if (d.enlace && !ok(d.enlace)) return msg('El enlace debe empezar con https://');
    const b = f('e-ok');
    b.disabled = true;
    b.textContent = 'Guardando…';
    try {
      if (nuevo) P.push(await api('publicaciones', { method: 'POST', json: d }));
      else Object.assign(p, await api('publicaciones/' + p.id, { method: 'PUT', json: d }));
      ordenar();
      sucio = false;
      cerrarModal();
      if (nuevo) { pestana = d.pestana; busq = ''; $('#q').value = ''; }
      publicaciones();
      calendario();
      msg(nuevo ? '¡Publicado! ✨' : 'Cambios guardados ✓');
      if (nuevo) $('#publicaciones').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      msg(e.message);
      b.disabled = false;
      b.textContent = nuevo ? '✨ Publicar' : 'Guardar cambios';
    }
  };
}

// ============================================================
// Perfil y redes
// ============================================================
function editarPerfil() {
  const caja = modal(`<h2>👤 Perfil y redes</h2>
    <div class="campo"><span>Foto de perfil</span><div class="zona chica" id="z-foto"></div></div>
    <div class="fila">
      <label class="campo"><span>Nombres</span><input id="p-n" autofocus></label>
      <label class="campo"><span>Apellidos</span><input id="p-a"></label>
    </div>
    <label class="campo"><span>Sobre mí</span><textarea id="p-d" rows="4"></textarea></label>
    <div class="campo"><span>Redes sociales</span><div class="redes-edit" id="p-redes"></div></div>
    <button class="sec" id="p-mas" style="align-self:flex-start">＋ Agregar red</button>
    <div class="acciones-modal"><button class="sec" id="p-cancelar">Cancelar</button><button class="prin" id="p-ok">Guardar</button></div>`, '', { fijo: true });
  const f = (id) => $('#' + id, caja);
  f('p-n').value = S.perfil.n;
  f('p-a').value = S.perfil.a;
  f('p-d').value = S.perfil.d;
  let foto = S.perfil.foto || '';
  zona(f('z-foto'), { texto: 'Tu foto o avatar', icono: '🙂', acepta: 'image/*', url: ok(foto), mime: foto ? 'image/' : '', alCambiar(u) { foto = u; } });

  const fila = (r = { l: '', u: '' }) => {
    const w = E('div', { className: 'red-fila' });
    const l = E('input', { placeholder: 'Instagram', value: r.l, className: 'r-l' });
    const u = E('input', { placeholder: 'https://instagram.com/…', value: r.u === '#' ? '' : r.u, className: 'r-u', type: 'url' });
    w.append(l, u, E('button', { className: 'sec', title: 'Quitar', onclick: () => w.remove() }, '✕'));
    f('p-redes').append(w);
  };
  S.redes.forEach(fila);
  f('p-mas').onclick = () => fila();
  f('p-cancelar').onclick = () => cerrarModal();
  f('p-ok').onclick = () => {
    S.perfil = { n: f('p-n').value.trim(), a: f('p-a').value.trim(), d: f('p-d').value.trim(), foto };
    S.redes = $$('.red-fila', caja)
      .map((w) => ({ l: $('.r-l', w).value.trim(), u: conHttps($('.r-u', w).value.trim()) || '#' }))
      .filter((r) => r.l);
    guardarSitio();
    cabecera();
    cerrarModal();
    msg('Perfil guardado ✓');
  };
}

// ============================================================
// Personalizar: colores, título, portada, paneles
// ============================================================
const NOMBRES_PANELES = { musica: '🎵 Música', mascota: '🐶 Mascota', pizarra: '🎨 Pizarra', animo: '😊 Ánimo y tiempo', calendario: '📅 Calendario' };

function personalizar() {
  const t = Object.assign({}, D.tema, S.tema);
  const caja = modal(`<h2>🎨 Personalizar la página</h2>
    <div class="fila">
      <label class="campo"><span>Título</span><input id="c-titulo" maxlength="60" autofocus></label>
      <label class="campo"><span>Frase debajo del título</span><input id="c-lema" maxlength="120"></label>
    </div>
    <div class="campo"><span>Temas: cada uno trae textura, efectos y criaturas</span><div class="amb-lista" id="c-presets"></div></div>
    <div class="fila">
      <label class="check"><input type="checkbox" id="c-part"> ✨ Partículas en movimiento</label>
      <label class="check"><input type="checkbox" id="c-cria"> 🐾 Criaturas caminando abajo</label>
    </div>
    <div class="campo"><span>Colores (puedes ajustarlos después de elegir el tema)</span><div class="colores">
      <label class="campo"><span>Acento</span><input type="color" data-c="acento"></label>
      <label class="campo"><span>Bordes</span><input type="color" data-c="marron"></label>
      <label class="campo"><span>Fondo</span><input type="color" data-c="fondo"></label>
      <label class="campo"><span>Paneles</span><input type="color" data-c="papel"></label>
      <label class="campo"><span>Texto</span><input type="color" data-c="texto"></label>
    </div></div>
    <label class="campo"><span>Modo</span><select id="c-modo">
      <option value="auto">Automático (sigue el modo oscuro del dispositivo)</option>
      <option value="claro">Siempre claro</option><option value="oscuro">Siempre oscuro</option></select></label>
    <div class="fila">
      <div class="campo"><span>Imagen de la cabecera</span><div class="zona chica" id="z-banner"></div></div>
      <div class="campo"><span>GIF de la cabecera</span><div class="zona chica" id="z-gif"></div></div>
    </div>
    <div class="fila">
      <label class="campo"><span>Nombre de la mascota</span><input id="c-mascota" maxlength="30"></label>
      <label class="campo"><span>Foto o emoji de la mascota (vacío = perrito pixelado)</span><input id="c-mascota-img" placeholder="🐶 o https://…"></label>
    </div>
    <div class="campo"><span>Paneles de la derecha</span><div class="paneles-edit" id="c-paneles"></div></div>
    <div class="acciones-modal"><button class="sec" id="c-cancelar">Cancelar</button><button class="prin" id="c-ok">Guardar</button></div>`,
  '', { fijo: true, alCerrar: () => aplicarTema() });
  const f = (id) => $('#' + id, caja);
  f('c-titulo').value = S.titulo;
  f('c-lema').value = S.lema;
  f('c-modo').value = t.modo;
  f('c-mascota').value = S.mascota.nombre;
  f('c-mascota-img').value = S.mascota.imagen;
  const colores = $$('[data-c]', caja);
  let ambiente = AMBIENTES[t.ambiente] ? t.ambiente : 'panal';
  f('c-part').checked = t.particulas !== false;
  f('c-cria').checked = t.criaturas !== false;
  const leerTema = () => {
    const r = { modo: f('c-modo').value, ambiente, particulas: f('c-part').checked, criaturas: f('c-cria').checked };
    colores.forEach((i) => { r[i.dataset.c] = i.value; });
    return r;
  };
  const ponerColores = (c) => colores.forEach((i) => { i.value = c[i.dataset.c]; });
  ponerColores(t);
  // vista previa en vivo
  caja.addEventListener('input', (e) => { if (e.target.dataset.c) aplicarTema(leerTema()); });
  f('c-modo').onchange = () => aplicarTema(leerTema());
  f('c-part').onchange = f('c-cria').onchange = () => aplicarTema(leerTema());
  // tarjetas de temas con su textura de muestra
  for (const [id, a] of Object.entries(AMBIENTES)) {
    const b = E('button', { type: 'button', className: 'amb', title: a.descripcion, onclick(ev) {
      ambiente = id;
      ponerColores(a.colores);
      $$('.amb', caja).forEach((x) => x.setAttribute('aria-pressed', x === b));
      // los temas con textura propia se ven igual en cualquier dispositivo
      if (id !== 'panal' && f('c-modo').value === 'auto') f('c-modo').value = 'claro';
      transicionTema(ev, () => aplicarTema(leerTema()));
    } }, `<span class="amb-ico">${a.icono}</span><b>${esc(a.nombre)}</b><small>${esc(a.descripcion)}</small>
      <span class="amb-col"><i style="background:${a.colores.acento}"></i><i style="background:${a.colores.fondo}"></i><i style="background:${a.colores.papel}"></i></span>`);
    const m = textura(a.textura || a.muestra);
    b.style.setProperty('--m', m ? `url("${m}")` : a.colores.fondo);
    b.setAttribute('aria-pressed', id === ambiente);
    f('c-presets').append(b);
  }
  let banner = S.banner, gif = S.gif;
  zona(f('z-banner'), { texto: 'Foto de fondo', icono: '🏞', acepta: 'image/*', url: ok(banner), mime: banner ? 'image/' : '', alCambiar(u) { banner = u; } });
  zona(f('z-gif'), { texto: 'GIF o imagen', icono: '✨', acepta: 'image/*', url: ok(gif), mime: gif ? 'image/' : '', alCambiar(u) { gif = u; } });
  for (const [k, n] of Object.entries(NOMBRES_PANELES)) {
    const l = E('label', { className: 'check' }, `<input type="checkbox" data-p="${k}"> ${n}`);
    $('input', l).checked = S.paneles[k] !== false;
    f('c-paneles').append(l);
  }

  f('c-cancelar').onclick = () => cerrarModal();
  f('c-ok').onclick = () => {
    const imgAntes = S.mascota.imagen;
    S.titulo = f('c-titulo').value.trim() || D.titulo;
    S.lema = f('c-lema').value.trim();
    S.tema = leerTema();
    S.banner = banner;
    S.gif = gif;
    Object.assign(S.mascota, { nombre: f('c-mascota').value.trim() || 'Mi perrito', imagen: f('c-mascota-img').value.trim() });
    // al elegir un tema con textura, el fondo de la página usa esa textura
    if (S.tema.ambiente !== 'panal' && (!S.global.patron || S.global.patron === 'lunares')) S.global.patron = 'tema';
    $$('[data-p]', caja).forEach((i) => { S.paneles[i.dataset.p] = i.checked; });
    guardarSitio();
    cerrarModal();
    render();
    msg(S.mascota.imagen !== imgAntes ? 'Guardado ✓ La nueva mascota aparece al recargar' : 'Guardado ✓');
  };
}

// ============================================================
// Canciones y stickers (modo creador)
// ============================================================
function nuevaCancion() {
  const caja = modal(`<h2>🎵 Agregar canción</h2>
    <div class="zona" id="z-audio"></div>
    <label class="campo"><span>Nombre de la canción</span><input id="m-n" autofocus placeholder="Ej: Dulce Soledad — Enjambre"></label>
    <div class="campo"><span>Portada (opcional)</span><div class="zona chica" id="z-cov"></div></div>
    <div class="acciones-modal"><button class="sec" id="m-cancelar">Cancelar</button><button class="prin" id="m-ok">Agregar</button></div>`, '', { fijo: true });
  const f = (id) => $('#' + id, caja);
  const za = zona(f('z-audio'), {
    texto: 'Elige la canción (mp3, m4a, ogg…)', icono: '🎵', acepta: 'audio/*',
    alCambiar(u, m, a) { if (a && !f('m-n').value) f('m-n').value = a.name.replace(/\.[^.]+$/, ''); },
  });
  const zc = zona(f('z-cov'), { texto: 'Imagen de la canción', icono: '💿', acepta: 'image/*', alCambiar() {} });
  f('m-cancelar').onclick = () => cerrarModal();
  f('m-ok').onclick = () => {
    if (!za.url) return msg('Primero elige la canción');
    S.musica.push({ n: f('m-n').value.trim() || 'Canción', u: za.url, c: zc.url });
    guardarSitio();
    pl();
    cerrarModal();
    msg('Canción agregada ✓');
  };
}


// ============================================================
// Libro
// ============================================================
let libroAbierto = false;
let libroInst = null;

function libro() {
  const titulo = S.libro.titulo || 'Mi libro';
  $('#libro-titulo').textContent = '📖 ' + titulo;
  const la = $('#libro-admin');
  la.innerHTML = '';
  if (adm) {
    const w = E('div', { className: 'fila-admin' });
    const i = E('input', { value: titulo, placeholder: 'Título del libro', 'aria-label': 'Título del libro' });
    w.append(i, E('button', { onclick() { S.libro.titulo = i.value.trim() || 'Mi libro'; guardarSitio(); libro(); } }, 'Guardar título'));
    la.append(w, E('p', {}, 'Abre el libro y usa ✎ Escribir, ＋ Página o 🖼 Imagen.'));
  }

  const b = $('#bk');
  if (libroAbierto && libroInst) {
    if (libroInst.op.editable !== adm) libroInst.setEditable(adm);
    return;
  }
  b.innerHTML = '';
  if (!libroAbierto) {
    b.append(E('button', { className: 'book-cover', onclick() { libroAbierto = true; libro(); } },
      `<img src="img/portada.png" alt="Abrir ${esc(titulo)}"><span>Toca el libro para abrirlo</span>`));
    return;
  }
  const host = E('div');
  b.append(host);
  libroInst = new LibroMinecraft(host, {
    paginas: clonar(S.libro.paginas && S.libro.paginas.length ? S.libro.paginas : [{ t: '', i: '' }]),
    editable: adm,
    onChange: (p) => { S.libro.paginas = clonar(p); guardarSitio(); },
    elegirImagen: () => elegirArchivo('image/*', 'Imagen para la página del libro'),
  });
  b.append(E('button', { className: 'lmc-close', onclick() { libroAbierto = false; libroInst = null; libro(); } }, '✕ Cerrar libro'));
}

// ============================================================
// Música / reproductor
// ============================================================
const au = new Audio();
let ti = 0;
au.onended = () => nx(1);

function nx(d) {
  if (!S.musica.length) return;
  ti = (ti + d + S.musica.length) % S.musica.length;
  pl(1);
  au.play().catch(() => {});
}

// Reproductor estilo iPhone: portada grande, fondo de vidrio con la portada
// difuminada, título y artista, barra de avance, botones y volumen.
const ICONO_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.6v14.8c0 .9 1 1.4 1.7.9l11.4-7.4c.7-.4.7-1.4 0-1.8L8.7 3.7C8 3.2 7 3.7 7 4.6z"/></svg>';
const ICONO_PAUSA = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="4" width="4.6" height="16" rx="1.4"/><rect x="13.9" y="4" width="4.6" height="16" rx="1.4"/></svg>';
const NOTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 3.2 9.3 4.9c-.5.1-.8.5-.8 1v9.4a3.2 3.2 0 1 0 1.6 2.7V9.4l6.8-1.4v5.3a3.2 3.2 0 1 0 1.6 2.7V4c0-.5-.5-.9-1-.8z"/></svg>';

// "Título — Artista" se separa en dos líneas, como en el iPhone
function partesCancion(n) {
  const m = String(n || '').split(/\s+[—–-]\s+/);
  return { titulo: m[0] || 'Canción', artista: m.slice(1).join(' – ') || 'Letras para mi creador' };
}
const fmtT = (s) => (isFinite(s) && s >= 0 ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00');

let portadaActual = null;
function portadaIp(url) {
  if (portadaActual === url) return;
  portadaActual = url;
  const c = $('#cv2'), r = $('#reproductor');
  c.innerHTML = url ? `<img src="${esc(url)}" alt="">` : `<span class="ip-sin-arte">${NOTA}</span>`;
  // el fondo de vidrio toma los colores de la portada
  r.style.setProperty('--arte', url ? `url("${url}")` : 'none');
  r.classList.toggle('sin-arte', !url);
}

function estadoIp() {
  const sonando = !au.paused;
  $('#reproductor').classList.toggle('sonando', sonando);
  $('#b1').innerHTML = sonando ? ICONO_PAUSA : ICONO_PLAY;
  $('#b1').setAttribute('aria-label', sonando ? 'Pausar' : 'Reproducir');
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = sonando ? 'playing' : 'paused';
}

// Los controles de música del celular o la computadora (pantalla bloqueada, teclas multimedia)
function sesionMultimedia(t) {
  if (!('mediaSession' in navigator) || !t || !window.MediaMetadata) return;
  const p = partesCancion(t.n), c = ok(t.c);
  navigator.mediaSession.metadata = new MediaMetadata({ title: p.titulo, artist: p.artista, album: S.titulo || D.titulo, artwork: c ? [{ src: new URL(c, location.href).href, sizes: '512x512' }] : [] });
}
if ('mediaSession' in navigator) {
  const ac = { play: () => au.play().catch(() => {}), pause: () => au.pause(), previoustrack: () => nx(-1), nexttrack: () => nx(1) };
  for (const [k, f] of Object.entries(ac)) try { navigator.mediaSession.setActionHandler(k, f); } catch (e) {}
}

function pl(go) {
  if (ti >= S.musica.length) ti = 0;
  const t = S.musica[ti];
  const p = t ? partesCancion(t.n) : { titulo: 'Sin canciones', artista: adm ? 'Toca “＋ Agregar canción”' : 'Pronto habrá música aquí' };
  portadaIp(t && ok(t.c));
  $('#tn').textContent = p.titulo;
  $('#ip-artista').textContent = p.artista;
  if (t && (go || au.dataset.u !== t.u)) {
    au.dataset.u = t.u;
    au.src = ok(t.u);
    sesionMultimedia(t);
  }
  // "A continuación": la lista con miniaturas
  const l = $('#tl');
  l.innerHTML = '';
  S.musica.forEach((m, i) => {
    const q = partesCancion(m.n), c = ok(m.c);
    const b = E('button', { className: 'pista' + (i === ti ? ' sonando' : ''), onclick() { ti = i; pl(1); au.play().catch(() => {}); } },
      `<span class="pista-arte">${c ? `<img src="${esc(c)}" alt="" loading="lazy">` : NOTA}</span>
       <span class="pista-txt"><b>${esc(q.titulo)}</b><small>${esc(q.artista)}</small></span>
       ${i === ti ? '<span class="ip-barras" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' : ''}`);
    if (adm) b.append(E('b', { className: 'x', title: 'Quitar', onclick(e) {
      e.stopPropagation();
      S.musica.splice(i, 1);
      if (i === ti) { au.pause(); au.removeAttribute('src'); au.dataset.u = ''; ti = 0; }
      else if (i < ti) ti--;
      guardarSitio();
      pl();
    } }, '✕'));
    l.append(b);
  });
  $('.ip-sig').hidden = !S.musica.length && !adm;
  if (adm) l.append(E('button', { className: 'ip-agregar', onclick: nuevaCancion }, '＋ Agregar canción'));
  estadoIp();
}

$('#b1').onclick = () => {
  if (!S.musica.length) return msg(adm ? 'Agrega una canción con ＋ Agregar canción' : 'Aún no hay canciones');
  if (!au.src) pl(1);
  au.paused ? au.play().catch(() => msg('No se pudo reproducir')) : au.pause();
};
au.onplay = () => pl();
au.onpause = estadoIp;
$('#b0').onclick = () => (au.currentTime > 3 ? (au.currentTime = 0) : nx(-1)); // como el iPhone: primero vuelve al inicio
$('#b2').onclick = () => nx(1);

// barras delgadas que se llenan (avance y volumen)
const pintarBarra = (inp, pct) => inp.style.setProperty('--p', pct + '%');
au.ontimeupdate = () => {
  if (!au.duration) return;
  const pr = $('#pr');
  if (!pr.matches(':active')) { pr.value = au.currentTime / au.duration * 100; pintarBarra(pr, pr.value); }
  $('#ct').textContent = fmtT(au.currentTime);
  $('#dt').textContent = '-' + fmtT(au.duration - au.currentTime);
};
$('#pr').oninput = (e) => {
  pintarBarra(e.target, e.target.value);
  if (au.duration) au.currentTime = e.target.value / 100 * au.duration;
};
// el volumen se recuerda para cada visitante
const volGuardado = ls('volumen');
au.volume = volGuardado == null ? 1 : Math.max(0, Math.min(1, +volGuardado || 0));
$('#vol').value = au.volume;
pintarBarra($('#vol'), au.volume * 100);
$('#vol').oninput = (e) => {
  au.volume = +e.target.value;
  pintarBarra(e.target, au.volume * 100);
  ls('volumen', String(au.volume));
};

// ============================================================
// Calendario (marca días con evento ✦ y con publicaciones)
// ============================================================
let cy = new Date().getFullYear();
let cm = new Date().getMonth();
let sd = '';

function calendario() {
  const b = $('#ca');
  b.innerHTML = '';
  const conPub = new Set(P.map((p) => p.fecha));
  const h = E('div', { className: 'ch' });
  h.append(
    E('button', { 'aria-label': 'Mes anterior', onclick() { if (--cm < 0) { cm = 11; cy--; } calendario(); } }, '◀'),
    E('b', {}, MESES[cm] + ' ' + cy),
    E('button', { 'aria-label': 'Mes siguiente', onclick() { if (++cm > 11) { cm = 0; cy++; } calendario(); } }, '▶'),
  );
  const g = E('div', { className: 'cg' }, '<span>D</span><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span>');
  for (let i = 0, f = new Date(cy, cm, 1).getDay(); i < f; i++) g.append(E('span'));
  for (let d = 1, n = new Date(cy, cm + 1, 0).getDate(); d <= n; d++) {
    const k = cy + '-' + String(cm + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const cls = [S.eventos[k] ? 'ev' : '', conPub.has(k) ? 'hay-pub' : '', k === sd ? 'sel' : '', k === hoy() ? 'hoy' : ''].join(' ');
    g.append(E('button', { className: cls, onclick() { sd = sd === k ? '' : k; calendario(); } }, d));
  }
  b.append(h, g);

  const e = $('#ed');
  e.innerHTML = '';
  if (!sd) { e.innerHTML = '<small>Toca una fecha · amarillo = evento · rojo = publicación</small>'; return; }
  // un evento puede ser solo texto (versión anterior) o {t: texto, i: imagen}
  const ev = typeof S.eventos[sd] === 'string' ? { t: S.eventos[sd], i: '' } : (S.eventos[sd] || { t: '', i: '' });
  e.append(E('b', {}, fechaBonita(sd)), E('div', {}, esc(ev.t || (adm || ev.i ? '' : 'Nada especial este día'))));
  if (ok(ev.i)) e.append(E('img', { src: ok(ev.i), alt: '', className: 'ev-img' }));
  P.filter((p) => p.fecha === sd).forEach((p) => e.append(E('button', { className: 'ir-pub', onclick: () => ver(p) }, `${(TIPOS[p.tipo] || TIPOS.nota)[0]} ${esc(p.titulo || 'Sin título')}`)));
  if (adm) {
    const t = E('textarea', { rows: 2, placeholder: 'Qué pasó / pasará este día', value: ev.t || '' });
    let img = ev.i || '';
    const z = E('div', { className: 'zona chica' });
    zona(z, { texto: 'Imagen de la fecha (opcional)', icono: '🖼', acepta: 'image/*', url: ok(img), mime: img ? 'image/' : '', alCambiar(u) { img = u; } });
    e.append(t, z, E('button', { onclick() {
      const v = t.value.trim();
      if (v || img) S.eventos[sd] = { t: v, i: img }; else delete S.eventos[sd];
      guardarSitio();
      calendario();
    } }, 'Guardar fecha'));
  }
}

// ============================================================
// Mascota (el perrito de mascota.js)
// ============================================================
let mascota = null;
function crearMascota() {
  if (mascota) return;
  mascota = new MascotaDigital({
    nombre: S.mascota.nombre,
    imagen: S.mascota.imagen,
    clave: 'letras-perrito',
    fotos: S.album,
    editable: adm,
    panel: $('#dock-mascota'),
    velocidad: S.mascota.velocidad,
    frases: S.mascota.frases,
    accesorios: S.mascota.accesorios,
    onChange: (f) => { S.album = clonar(f); guardarSitio(); },
    elegirFoto: () => elegirArchivo('image/*', 'Foto para el álbum'),
  });
}

// ============================================================
// Paneles de la derecha: orden, títulos, cuáles se ven
// (y se recuerda cuáles dejó abiertos cada visitante)
// ============================================================
const TITULOS_BASE = {};
$$('[data-panel]').forEach((d) => { TITULOS_BASE[d.dataset.panel] = $('summary h2', d).textContent.trim(); });

function paneles() {
  const lat = $('#lateral');
  const orden = S.orden.concat(Object.keys(TITULOS_BASE).filter((k) => !S.orden.includes(k)));
  orden.forEach((k) => { const d = $(`[data-panel="${k}"]`); if (d) lat.append(d); });
  $$('[data-panel]').forEach((d) => {
    const k = d.dataset.panel;
    d.hidden = S.paneles[k] === false;
    if (ls('panel-' + k) === '0') d.open = false;
    if (k !== 'mascota') $('summary h2', d).textContent = S.titulos[k] || TITULOS_BASE[k];
  });
  $('#nom-mascota').textContent = S.mascota.nombre;
  if (mascota) {
    mascota.setVisible(S.paneles.mascota !== false);
    mascota.setNombre(S.mascota.nombre);
    if (mascota.op.editable !== adm) mascota.setEditable(adm);
  }
}
$$('[data-panel]').forEach((d) => d.addEventListener('toggle', () => ls('panel-' + d.dataset.panel, d.open ? '1' : '0')));

// ============================================================
// Pizarra (se guarda en el navegador de cada visitante)
// ============================================================
const cv = $('#cv');
const cx = cv.getContext('2d', { willReadFrequently: true });
let col = '#000000';
let tool = 'pen';
let dr = 0;
cx.fillStyle = '#fff';
cx.fillRect(0, 0, cv.width, cv.height);
(() => {
  const g = ls('pizarra');
  if (!g) return;
  const im = new Image();
  im.onload = () => cx.drawImage(im, 0, 0);
  im.src = g;
})();
let tPiz;
const guardarPizarra = () => { clearTimeout(tPiz); tPiz = setTimeout(() => ls('pizarra', cv.toDataURL('image/png')), 500); };

const palette = ['#000000', '#ffffff', '#808080', '#c0c0c0', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ff8000', '#804000', '#5a3825', '#c1121f', '#f7d34a', '#2a9d8f', '#1d4ed8', '#ff6b6b', '#4ecdc4', '#ffe66d', '#1a1a2e', '#f38181', '#95e1d3', '#a8e6cf', '#ff8b94', '#ffaaa5', '#ffd3b6', '#dcedc1', '#ff9f1c', '#2ec4b6', '#e71d36', '#011627', '#f7b801', '#f18701', '#f35b04', '#d90429', '#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#00b4d8', '#0077b6', '#03045e', '#90e0ef', '#caf0f8', '#ff006e', '#fb5607', '#ffbe0b', '#3a86ff', '#8338ec'];
const commonColors = palette.slice(0, 12);
let showAllColors = false;
function renderPalette() {
  $('#cs').innerHTML = '';
  (showAllColors ? palette : commonColors).forEach((c) => {
    const b = E('button', { className: 'sw', title: c, 'aria-label': 'Color ' + c, onclick() { col = c; $('#cp').value = c; if (tool === 'eraser') setTool('pen'); } });
    b.style.background = c;
    $('#cs').append(b);
  });
}
renderPalette();
$('#togglePalette').onclick = () => {
  showAllColors = !showAllColors;
  $('#togglePalette').textContent = showAllColors ? 'Menos' : 'Todos';
  renderPalette();
};
$('#cp').oninput = (e) => { col = e.target.value; };

const pt = (e) => {
  const r = cv.getBoundingClientRect();
  return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height];
};

// Bote de pintura (flood fill)
function floodFill(startX, startY, fillColor) {
  const w = cv.width, h = cv.height;
  if (startX < 0 || startY < 0 || startX >= w || startY >= h) return;
  const img = cx.getImageData(0, 0, w, h);
  const data = img.data;
  const idx = (startY * w + startX) * 4;
  const target = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
  const fc = hexToRgba(fillColor);
  if (colorsMatch(target, fc)) return;
  const stack = [[startX, startY]];
  while (stack.length) {
    const [px, py] = stack.pop();
    if (px < 0 || py < 0 || px >= w || py >= h) continue;
    const i = (py * w + px) * 4;
    if (!colorsMatch([data[i], data[i + 1], data[i + 2], data[i + 3]], target)) continue;
    data[i] = fc[0]; data[i + 1] = fc[1]; data[i + 2] = fc[2]; data[i + 3] = fc[3];
    stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
  }
  cx.putImageData(img, 0, 0);
}
function hexToRgba(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}
function colorsMatch(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function setTool(t) {
  tool = t;
  $$('.paint-toolbar .tool').forEach((b) => b.classList.remove('active'));
  const map = { pen: '#toolPen', fill: '#toolFill', eraser: '#toolEraser' };
  if (map[t]) $(map[t]).classList.add('active');
}
$('#toolPen').onclick = () => setTool('pen');
$('#toolFill').onclick = () => setTool('fill');
$('#toolEraser').onclick = () => setTool('eraser');

cv.onpointerdown = (e) => {
  const [x, y] = pt(e);
  if (tool === 'fill') {
    floodFill(Math.floor(x), Math.floor(y), col);
    guardarPizarra();
    return;
  }
  dr = 1;
  cv.setPointerCapture(e.pointerId);
  cx.beginPath();
  cx.moveTo(x, y);
};
cv.onpointermove = (e) => {
  if (!dr) return;
  const [x, y] = pt(e);
  cx.strokeStyle = tool === 'eraser' ? '#ffffff' : col;
  cx.lineWidth = $('#sz').value * (tool === 'eraser' ? 2 : 1);
  cx.lineCap = 'round';
  cx.lineJoin = 'round';
  cx.lineTo(x, y);
  cx.stroke();
};
cv.onpointerup = cv.onpointercancel = () => { if (dr) guardarPizarra(); dr = 0; };
$('#cl').onclick = () => { cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); guardarPizarra(); };
$('#dl').onclick = () => E('a', { href: cv.toDataURL('image/png'), download: 'pizarra.png' }).click();

// ============================================================
// Ánimo y contador de tiempo en el blog
// ============================================================
const fmt = (s) => [s / 3600 | 0, s / 60 % 60 | 0, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
let visita = 0;
let tot = +ls('tot') || 0;
// las opciones de ánimo las escribe la creadora (⚙ del widget)
function animo() {
  const s = $('#mo'), actual = ls('mood');
  s.innerHTML = S.animos.map((o) => `<option>${esc(o)}</option>`).join('');
  if (S.animos.includes(actual)) s.value = actual;
}
$('#mo').onchange = (e) => ls('mood', e.target.value);
setInterval(() => {
  visita++;
  tot++;
  if (visita % 5 === 0) ls('tot', tot);
  $('#tm').innerHTML = `Esta visita: <b>${fmt(visita)}</b><br>Total en el blog: <b>${fmt(tot)}</b>`;
}, 1000);

// ============================================================
// Modo creador
// ============================================================
function entrar() {
  if (adm) return;
  const correo = ls('correo') || CORREO_CREADORA || '';
  const caja = modal(`<h2>🔑 Modo creador</h2><p>Entra con tu correo y tu contraseña de creadora.</p>
    <form id="f-entrar" class="campo">
      <input type="email" id="correo" autocomplete="username" placeholder="Correo" aria-label="Correo"${correo ? '' : ' autofocus'}>
      <input type="password" id="clave" autocomplete="current-password" placeholder="Contraseña" aria-label="Contraseña"${correo ? ' autofocus' : ''}>
      <div class="acciones-modal"><button class="prin">Entrar</button></div></form>`, 'chica');
  $('#correo', caja).value = correo;
  $('#f-entrar', caja).onsubmit = async (e) => {
    e.preventDefault();
    const b = $('.prin', caja);
    b.disabled = true;
    try {
      await api('entrar', { method: 'POST', json: { correo: $('#correo', caja).value, clave: $('#clave', caja).value } });
      ls('correo', $('#correo', caja).value.trim());
      cerrarModal();
      activarAdmin();
      msg('¡Hola, creadora! ✨ Ya puedes publicar');
    } catch (err) {
      msg(err.message);
      b.disabled = false;
      $('#clave', caja).select();
    }
  };
}

function activarAdmin() {
  adm = true;
  $('#barra-admin').hidden = false;
  estado('Listo');
  render();
  reiniciarHistoria();
  ajustarBarra();
  // la primera vez se muestra el recorrido guiado
  if (!MARCO && !ls('tour-visto')) setTimeout(() => tour(0), 500);
}

function salir() {
  if (!adm && !previa) return;
  adm = false;
  previa = false;
  document.body.classList.remove('previa');
  sel = null;
  cerrarPropiedades();
  api('salir').catch(() => {});
  $('#barra-admin').hidden = true;
  render();
  ajustarBarra();
}

function ajustarBarra() {
  document.documentElement.style.setProperty('--barra', adm || previa ? $('#barra-admin').offsetHeight + 'px' : '0px');
}
addEventListener('resize', ajustarBarra);

$('#barra-admin').onclick = (e) => {
  const b = e.target.closest('[data-accion]');
  if (!b) return;
  const a = b.dataset.accion;
  if (a === 'nueva') editor();
  if (a === 'agregar') catalogo();
  if (a === 'widgets') abrirPropiedades({ widgets: true });
  if (a === 'personalizar') personalizar();
  if (a === 'perfil') editarPerfil();
  if (a === 'deshacer') deshacer();
  if (a === 'rehacer') rehacer();
  if (a === 'rejilla') alternarRejilla();
  if (a === 'previa') modoVistaPrevia(true);
  if (a === 'volver') modoVistaPrevia(false);
  if (a === 'guardar') { if (tGuardar) guardarAhora(); else msg('Todo está guardado ✓'); }
  if (a === 'estilos') abrirPropiedades({ estilos: true });
  if (a === 'copias') abrirPropiedades({ copias: true });
  if (a === 'ayuda') tour(0);
  if (a === 'disp') verDispositivo(b.dataset.disp);
  if (a === 'salir') { salir(); msg('Saliste del modo creador'); }
};
// Para entrar: el botón discreto "Admin" del pie de página o Ctrl+Shift+E
$('#admin').onclick = () => (adm ? msg('Ya estás en el Modo Creador') : entrar());
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
    e.preventDefault();
    if (adm || previa) { salir(); msg('Saliste del modo creador'); } else entrar();
  }
});

// Búsqueda
$('#q').oninput = (e) => { busq = e.target.value.trim().toLowerCase(); publicaciones(); };

// ============================================================
// Render general e inicio
// ============================================================
function render() {
  document.body.classList.toggle('adm', adm);
  aplicarTema();
  cabecera();
  Cameo.poner(S.cameo, adm);
  publicaciones();
  libro();
  pl();
  calendario();
  paneles();
  animo();
  aplicarEstilos();
  dibujarElementos();
}

(async () => {
  document.body.classList.toggle('en-marco', MARCO);
  iniciarEditor();
  render();
  try {
    const [sitio, pubs, ses] = await Promise.all([api('sitio'), api('publicaciones'), api('sesion')]);
    S = mezclar(D, migrar(sitio));
    P = pubs;
    ordenar();
    if (ses.admin) { adm = true; $('#barra-admin').hidden = false; estado('Listo'); }
  } catch (e) {
    msg('No se pudo cargar la página. Revisa tu internet y recarga.');
  }
  crearMascota();
  render();
  reiniciarHistoria();
  ajustarBarra();
  if (adm && !MARCO && !ls('tour-visto')) setTimeout(() => tour(0), 800);
})();
