// ============================================================
// letras para mi creador — modo-creador.js
// Editor visual del Modo Creador:
//   · elementos libres (texto, imagen/GIF, sticker, botón) que se arrastran,
//     cambian de tamaño y giran, con guías de alineación y rejilla
//   · panel lateral de propiedades (contenido, estilo, animación)
//   · widgets de la derecha: activar/desactivar, ordenar y ajustar
//   · deshacer / rehacer y vista previa
// Usa las utilidades y el estado de app.js (S, adm, E, $, guardarSitio…).
// Este archivo se carga antes que app.js: aquí solo se definen funciones.
// ============================================================

let sel = null;        // id del elemento seleccionado
let previa = false;    // vista previa (ver la página como visitante)
let panelProp = null;  // qué muestra el panel de propiedades: {el} | {widget} | {widgets:true}

const nuevoId = () => Math.random().toString(36).slice(2, 10);
const rejilla = () => ls('rejilla') === '1';
const PASO_REJILLA = 16;

// Biblioteca de stickers: emojis y bloques de Minecraft dibujados en pixel-art
const STICKERS = ['🐝', '🍯', '🍎', '☀️', '🌻', '⭐', '💛', '🎵', '🎸', '⛏️', '💎', '🌲', '🐶', '🦴', '✨', '🔥', '🌙', '🍪',
  'img/stickers/pasto.svg', 'img/stickers/tierra.svg', 'img/stickers/diamante.svg', 'img/stickers/panal.svg'];

const ANIMACIONES = { '': 'Ninguna', flotar: 'Flotar', rebotar: 'Rebotar', girar: 'Girar', brillar: 'Brillar', aparecer: 'Aparecer al bajar' };
// Fuentes por estilo: clave -> [nombre, familia CSS, familia en Google Fonts]
// (pix y vt ya vienen en index.html; las demás se descargan solo cuando se usan)
const GRUPOS_FUENTES = {
  'Pixel y retro': {
    pix: ['Pixel (Minecraft)', "'Press Start 2P', monospace"],
    vt: ['Retro (VT323)', 'VT323, monospace'],
    silk: ['Silkscreen', "'Silkscreen', monospace", 'Silkscreen:wght@400;700'],
    pixelify: ['Pixelify', "'Pixelify Sans', sans-serif", 'Pixelify+Sans:wght@400;700'],
  },
  'Escrita a mano': {
    caveat: ['Caveat (cuaderno)', "'Caveat', cursive", 'Caveat:wght@400;700'],
    indie: ['Indie Flower', "'Indie Flower', cursive", 'Indie+Flower'],
    marcador: ['Plumón', "'Permanent Marker', cursive", 'Permanent+Marker'],
    sombras: ['Lápiz', "'Shadows Into Light', cursive", 'Shadows+Into+Light'],
  },
  'Elegante': {
    dancing: ['Dancing Script', "'Dancing Script', cursive", 'Dancing+Script:wght@400;700'],
    vibes: ['Great Vibes (firma)', "'Great Vibes', cursive", 'Great+Vibes'],
    playfair: ['Playfair (revista)', "'Playfair Display', serif", 'Playfair+Display:ital,wght@0,400;0,700;1,400;1,700'],
    cinzel: ['Cinzel (romana)', "'Cinzel', serif", 'Cinzel:wght@400;700'],
  },
  'Divertida': {
    pacifico: ['Pacifico', "'Pacifico', cursive", 'Pacifico'],
    lobster: ['Lobster', "'Lobster', cursive", 'Lobster'],
    bangers: ['Bangers (cómic)', "'Bangers', cursive", 'Bangers'],
    fredoka: ['Fredoka (redondita)', "'Fredoka', sans-serif", 'Fredoka:wght@400;700'],
    burbuja: ['Chicle', "'Bubblegum Sans', cursive", 'Bubblegum+Sans'],
  },
  'Rock y misterio': {
    metal: ['Metal', "'Metal Mania', cursive", 'Metal+Mania'],
    gotica: ['Gótica', "'UnifrakturMaguntia', serif", 'UnifrakturMaguntia'],
    terror: ['Terror', "'Creepster', cursive", 'Creepster'],
    maquina: ['Máquina de escribir', "'Special Elite', monospace", 'Special+Elite'],
  },
  'Sencilla': {
    montserrat: ['Moderna (Montserrat)', "'Montserrat', sans-serif", 'Montserrat:ital,wght@0,400;0,700;1,400;1,700'],
    lora: ['Libro (Lora)', "'Lora', serif", 'Lora:ital,wght@0,400;0,700;1,400;1,700'],
    normal: ['Normal', 'system-ui, sans-serif'],
  },
};
const FUENTES = {}, FAMILIAS = {}, GFUENTES = {};
for (const g of Object.values(GRUPOS_FUENTES)) {
  for (const [k, [nombre, fam, gf]] of Object.entries(g)) { FUENTES[k] = nombre; FAMILIAS[k] = fam; if (gf) GFUENTES[k] = gf; }
}
// Descarga de Google Fonts las fuentes que se van a usar (una sola vez cada una)
const fuentesCargadas = new Set();
function cargarFuentes(...ks) {
  const nuevas = ks.filter((k) => GFUENTES[k] && !fuentesCargadas.has(k));
  if (!nuevas.length) return;
  nuevas.forEach((k) => fuentesCargadas.add(k));
  document.head.append(E('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?' + nuevas.map((k) => 'family=' + GFUENTES[k]).join('&') + '&display=swap' }));
}
// Lista de fuentes agrupada por estilo, con una muestra de cómo se ve
function selectorFuente(valor, alCambiar) {
  cargarFuentes(...Object.keys(GFUENTES)); // solo en el editor: para que la lista muestre cada letra
  const s = E('select', {}, Object.entries(GRUPOS_FUENTES).map(([g, fs]) => `<optgroup label="${esc(g)}">` +
    Object.entries(fs).map(([k, [n, fam]]) => `<option value="${k}" style="font-family:${fam.replace(/"/g, '')}">${esc(n)}</option>`).join('') + '</optgroup>').join(''));
  s.value = FAMILIAS[valor] ? valor : 'vt';
  const muestra = E('div', { className: 'fuente-muestra' }, 'Letras para mi creador 🐝');
  const pintar = () => { muestra.style.fontFamily = FAMILIAS[s.value]; };
  s.onchange = () => { pintar(); alCambiar(s.value); };
  pintar();
  const w = E('div', { className: 'fuente-sel' });
  w.append(s, muestra);
  return w;
}

// Página abierta dentro de la vista de tablet/celular del editor
const MARCO = new URLSearchParams(location.search).has('marco');

// En celular (pantallas de 700 px o menos) cada elemento puede tener su propia
// posición, tamaño y giro en el.m. Si no la tiene, usa la de computadora.
const esMovil = () => innerWidth <= 700;
const vista = (el) => (esMovil() && el.m ? Object.assign({}, el, el.m) : el);
function destino(el) {
  if (!esMovil()) return el;
  if (!el.m) el.m = { x: el.x, y: el.y, w: el.w, r: el.r || 0 };
  return el.m;
}

const buscar = (id) => S.elementos.find((e) => e.id === id);
const nodo = (id) => $(`#st .el[data-id="${id}"]`);
const zMax = () => S.elementos.reduce((m, e) => Math.max(m, e.z || 0), 0);

// Los stickers viejos ({e, x, y}) se convierten en elementos
function migrar(s) {
  if (s && !Array.isArray(s.elementos) && Array.isArray(s.stickers)) {
    s.elementos = s.stickers.map((st, i) => ({ id: nuevoId(), tipo: 'sticker', c: st.e, x: st.x, y: st.y, w: 56, r: 0, z: i + 1 }));
  }
  if (s) delete s.stickers;
  // el accesorio viejo (un emoji) pasa a los accesorios dibujados
  if (s && s.mascota && s.mascota.accesorio && !s.mascota.accesorios) {
    const id = ACC_EMOJI[s.mascota.accesorio];
    s.mascota.accesorios = id ? { [ACCESORIOS[id].lugar]: id } : {};
    delete s.mascota.accesorio;
  }
  // antes el fondo por defecto era "lunares"; ahora es la textura del tema (una sola vez)
  if (s && s.global && !s.global.v) {
    if (!s.global.patron || s.global.patron === 'lunares') s.global.patron = 'tema';
    s.global.v = 2;
  }
  return s;
}

// ============================================================
// Dibujar los elementos libres
// ============================================================
function posicionar(n, el) {
  const v = vista(el);
  n.style.left = v.x + '%';
  n.style.top = v.y + 'px';
  n.style.width = v.w + 'px';
  n.style.zIndex = el.z || 1;
  n.style.opacity = el.op == null ? 1 : el.op;
  n.style.setProperty('--r', (v.r || 0) + 'deg');
}

function estiloTexto(t, el) {
  t.style.color = el.color || '';
  t.style.background = el.fondo || '';
  t.style.fontSize = (el.tam || 22) + 'px';
  cargarFuentes(el.fuente);
  t.style.fontFamily = FAMILIAS[el.fuente] || FAMILIAS.vt;
  t.style.textAlign = el.alin || 'left';
  t.style.fontWeight = el.negrita ? 'bold' : '';
  t.style.fontStyle = el.cursiva ? 'italic' : '';
}

function contenidoElemento(el) {
  const w = E('div', { className: 'el-in' });
  const u = ok(el.c);
  if (el.tipo === 'sticker') {
    if (u) w.innerHTML = `<img src="${esc(u)}" alt="" draggable="false">`;
    else { w.textContent = el.c; w.style.fontSize = Math.round(vista(el).w * 0.82) + 'px'; }
  } else if (el.tipo === 'imagen') {
    w.innerHTML = u ? `<img src="${esc(u)}" alt="${esc(el.alt || '')}" draggable="false">` : '<div class="el-vacio">🖼 Elige una imagen en el panel ⚙</div>';
  } else if (el.tipo === 'texto') {
    const t = E('div', { className: 'el-texto' });
    t.textContent = el.c || 'Escribe aquí';
    estiloTexto(t, el);
    w.append(t);
  } else if (el.tipo === 'boton') {
    const a = E('a', { className: 'el-boton', href: ok(el.enlace) || '#', target: '_blank', rel: 'noopener' });
    a.textContent = el.c || 'Botón';
    estiloTexto(a, el);
    w.append(a);
  }
  return w;
}

function nodoElemento(el) {
  const n = E('div', { className: 'el el-' + el.tipo + (el.anim ? ' anim-' + el.anim : '') + (el.lock ? ' bloqueado' : '') });
  n.dataset.id = el.id;
  posicionar(n, el);
  n.append(contenidoElemento(el));
  if (el.anim === 'aparecer') adm ? n.classList.add('visto') : observador.observe(n);
  return n;
}

// "Aparecer al bajar": se muestra cuando entra en la pantalla
const observador = 'IntersectionObserver' in window
  ? new IntersectionObserver((L) => L.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('visto'); observador.unobserve(x.target); } }), { threshold: 0.2 })
  : { observe: (n) => n.classList.add('visto'), unobserve() {} };

function dibujarElementos() {
  const capa = $('#st');
  capa.innerHTML = '';
  S.elementos.forEach((el) => capa.append(nodoElemento(el)));
  if (sel && !buscar(sel)) sel = null;
  marcarSeleccion();
}

// Recuadro de selección con tiradores y menú pequeño
function marcarSeleccion() {
  $$('#st .el').forEach((n) => {
    n.classList.toggle('sel', n.dataset.id === sel);
    n.querySelectorAll('.h').forEach((h) => h.remove());
  });
  const n = sel && adm ? nodo(sel) : null;
  if (!n) return;
  const el = buscar(sel);
  n.append(E('span', { className: 'h h-res', title: 'Arrastra para cambiar el tamaño' }), E('span', { className: 'h h-rot', title: 'Arrastra para girar' }));
  const b = E('div', { className: 'h el-barra' });
  [['ajustes', '⚙', 'Propiedades'], ['duplicar', '📋', 'Duplicar (Ctrl+D)'], ['frente', '⬆', 'Traer al frente'], ['atras', '⬇', 'Enviar atrás'],
    ['bloquear', el.lock ? '🔒' : '🔓', el.lock ? 'Desbloquear posición' : 'Bloquear posición'], ['borrar', '🗑', 'Borrar (Supr)']]
    .forEach(([a, i, t]) => b.append(E('button', { type: 'button', title: t, 'aria-label': t, onclick(e) { e.stopPropagation(); accionElemento(a); } }, i)));
  n.append(b);
}

function seleccionar(id) {
  sel = id;
  marcarSeleccion();
  if (id && panelProp && panelProp.el) abrirPropiedades({ el: id });
  if (!id && panelProp && panelProp.el) cerrarPropiedades();
}

// ============================================================
// Mover, cambiar tamaño y girar
// ============================================================
function quitarGuias() { $$('#st .guia').forEach((g) => g.remove()); }
function guia(tipo, pos) {
  const g = E('div', { className: 'guia ' + tipo });
  g.style[tipo === 'v' ? 'left' : 'top'] = pos + 'px';
  $('#st').append(g);
}

// Ajusta la posición a la rejilla y a las guías (centro de la página, bordes
// del contenido y de los demás elementos). Devuelve [x, y] en píxeles.
function ajustar(x, y, w, h, id, ancho) {
  const U = 6;
  quitarGuias();
  if (rejilla()) { x = Math.round(x / PASO_REJILLA) * PASO_REJILLA; y = Math.round(y / PASO_REJILLA) * PASO_REJILLA; }
  const c = $('#contenido'), l = $('#lateral');
  const vx = [ancho / 2, c.offsetLeft, c.offsetLeft + c.offsetWidth, c.offsetLeft + c.offsetWidth / 2, l.offsetLeft];
  const vy = [];
  $$('#st .el').forEach((o) => {
    if (o.dataset.id === id) return;
    vx.push(o.offsetLeft, o.offsetLeft + o.offsetWidth / 2, o.offsetLeft + o.offsetWidth);
    vy.push(o.offsetTop, o.offsetTop + o.offsetHeight / 2, o.offsetTop + o.offsetHeight);
  });
  let gx = null, gy = null;
  for (const v of vx) {
    for (const m of [x, x + w / 2, x + w]) if (gx == null && Math.abs(m - v) < U) { x += v - m; gx = v; }
  }
  for (const v of vy) {
    for (const m of [y, y + h / 2, y + h]) if (gy == null && Math.abs(m - v) < U) { y += v - m; gy = v; }
  }
  if (gx != null) guia('v', gx);
  if (gy != null) guia('h', gy);
  return [Math.max(0, Math.min(ancho - 20, x)), Math.max(0, y)];
}

function arrastrar(ev, el, n) {
  const R = $('#st').getBoundingClientRect();
  const v = vista(el);
  const x0 = ev.clientX, y0 = ev.clientY, px0 = v.x / 100 * R.width, py0 = v.y;
  let movio = false;
  n.setPointerCapture(ev.pointerId);
  n.onpointermove = (m) => {
    if (!movio && Math.hypot(m.clientX - x0, m.clientY - y0) < 3) return;
    movio = true;
    n.classList.add('moviendo');
    const [nx, ny] = ajustar(px0 + m.clientX - x0, py0 + m.clientY - y0, n.offsetWidth, n.offsetHeight, el.id, R.width);
    const d = destino(el);
    d.x = nx / R.width * 100;
    d.y = ny;
    posicionar(n, el);
  };
  n.onpointerup = n.onpointercancel = () => {
    n.onpointermove = n.onpointerup = n.onpointercancel = null;
    n.classList.remove('moviendo');
    quitarGuias();
    if (movio) { guardarSitio(); refrescarPropiedades(); }
  };
}

function redimensionar(ev, el, n) {
  const h = ev.target, x0 = ev.clientX, w0 = vista(el).w, R = $('#st').getBoundingClientRect();
  h.setPointerCapture(ev.pointerId);
  h.onpointermove = (m) => {
    let w = Math.max(24, Math.min(R.width, w0 + (m.clientX - x0)));
    if (rejilla()) w = Math.max(PASO_REJILLA, Math.round(w / PASO_REJILLA) * PASO_REJILLA);
    destino(el).w = Math.round(w);
    posicionar(n, el);
    if (el.tipo === 'sticker' && !ok(el.c)) n.querySelector('.el-in').style.fontSize = Math.round(w * 0.82) + 'px';
  };
  h.onpointerup = h.onpointercancel = () => { h.onpointermove = h.onpointerup = h.onpointercancel = null; guardarSitio(); refrescarPropiedades(); };
}

function girar(ev, el, n) {
  const h = ev.target, r = n.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  h.setPointerCapture(ev.pointerId);
  h.onpointermove = (m) => {
    let a = Math.atan2(m.clientY - cy, m.clientX - cx) * 180 / Math.PI + 90;
    a = ((a + 540) % 360) - 180;
    // con Shift o con la rejilla gira de 15 en 15; cerca de 0/45/90… se pega solo
    if (m.shiftKey || rejilla()) a = Math.round(a / 15) * 15;
    else if (Math.abs(a - Math.round(a / 45) * 45) < 4) a = Math.round(a / 45) * 45;
    destino(el).r = Math.round(a);
    posicionar(n, el);
  };
  h.onpointerup = h.onpointercancel = () => { h.onpointermove = h.onpointerup = h.onpointercancel = null; guardarSitio(); refrescarPropiedades(); };
}

// Ordena las capas: el elemento queda arriba o abajo de todos
function reordenarZ(el, alFrente) {
  const L = S.elementos.filter((e) => e !== el).sort((a, b) => (a.z || 0) - (b.z || 0));
  alFrente ? L.push(el) : L.unshift(el);
  L.forEach((e, i) => { e.z = i + 1; });
}

function accionElemento(a) {
  const i = S.elementos.findIndex((e) => e.id === sel);
  if (i < 0) return;
  const el = S.elementos[i];
  if (a === 'ajustes') return abrirPropiedades({ el: el.id });
  if (a === 'borrar') {
    S.elementos.splice(i, 1);
    sel = null;
    cerrarPropiedades();
    msg('Borrado · Ctrl+Z para deshacer');
  }
  if (a === 'duplicar') {
    const c = Object.assign(clonar(el), { id: nuevoId(), x: Math.min(90, el.x + 2), y: el.y + 24, z: zMax() + 1, lock: false });
    S.elementos.push(c);
    sel = c.id;
  }
  if (a === 'frente') reordenarZ(el, true);
  if (a === 'atras') reordenarZ(el, false);
  if (a === 'bloquear') { el.lock = !el.lock; msg(el.lock ? '🔒 Posición bloqueada' : '🔓 Posición libre'); }
  dibujarElementos();
  guardarSitio();
  if (sel && panelProp && panelProp.el) abrirPropiedades({ el: sel });
}

// Agregar un elemento nuevo en el centro de la pantalla
function agregarElemento(tipo) {
  const R = $('#st').getBoundingClientRect();
  const w = { texto: 300, imagen: 260, sticker: 72, boton: 200 }[tipo];
  const el = Object.assign(
    { id: nuevoId(), tipo, w, r: 0, z: zMax() + 1, c: { texto: 'Escribe aquí ✦', sticker: '🐝', boton: 'Mi botón', imagen: '' }[tipo] },
    { x: Math.max(0, (innerWidth / 2 - w / 2 - R.left) / R.width * 100), y: Math.max(0, Math.round(innerHeight / 2 - R.top - 40)) },
    tipo === 'texto' ? { tam: 26, color: '#3b2416', fuente: 'pix' } : {},
    tipo === 'boton' ? { enlace: '', tam: 22, color: '#3b2416', fondo: '#f7d34a', fuente: 'vt', alin: 'center' } : {},
  );
  S.elementos.push(el);
  sel = el.id;
  dibujarElementos();
  guardarSitio();
  abrirPropiedades({ el: el.id });
}

// ============================================================
// Panel de propiedades (a la derecha)
// ============================================================
let tLuego;
const guardarLuego = () => { clearTimeout(tLuego); tLuego = setTimeout(() => guardarSitio(), 450); };

// Etiqueta + control. Las zonas de subida van en un <div> (dentro de un <label>
// el clic abriría el selector de archivos dos veces).
function campo(etq, control, extra) {
  const l = E(control.classList && control.classList.contains('zona') ? 'div' : 'label', { className: 'campo' });
  l.append(E('span', {}, esc(etq)), control);
  if (extra) l.append(extra);
  return l;
}
function rango(etq, min, max, valor, unidad, alCambiar) {
  const i = E('input', { type: 'range', min, max, value: valor });
  const v = E('b', {}, valor + unidad);
  i.oninput = () => { v.textContent = i.value + unidad; alCambiar(+i.value); };
  const w = E('div', { className: 'prop-rango' });
  w.append(i, v);
  return campo(etq, w);
}
function seccion(p, titulo) {
  const s = E('div', { className: 'prop-sec' });
  s.append(E('h3', {}, titulo));
  p.append(s);
  return s;
}

function abrirPropiedades(que) {
  panelProp = que;
  const p = $('#propiedades');
  p.hidden = false;
  document.body.classList.add('con-prop');
  p.innerHTML = '';
  if (que.el) propsElemento(p, buscar(que.el));
  else if (que.widget) propsWidget(p, que.widget);
  else if (que.widgets) propsWidgets(p);
  else if (que.estilos) propsEstilos(p);
  else if (que.estilo) propsEstilo(p, que.estilo);
  else if (que.global) propsGlobal(p);
  else if (que.copias) propsCopias(p);
  else if (que.cameo) propsCameo(p);
}
function cerrarPropiedades() {
  panelProp = null;
  const p = $('#propiedades');
  p.hidden = true;
  p.innerHTML = '';
  document.body.classList.remove('con-prop');
}
// después de mover o girar con el mouse, los números del panel se actualizan
function refrescarPropiedades() { if (panelProp && panelProp.el === sel) abrirPropiedades(panelProp); }

function cabeceraPanel(p, titulo) {
  const c = E('div', { className: 'prop-cab' });
  c.append(E('h2', {}, titulo), E('button', { className: 'sec', title: 'Cerrar panel', 'aria-label': 'Cerrar panel', onclick: cerrarPropiedades }, '✕'));
  p.append(c);
}

function propsElemento(p, el) {
  if (!el) return cerrarPropiedades();
  cabeceraPanel(p, { texto: '📝 Texto', imagen: '🖼 Imagen', sticker: '🐝 Sticker', boton: '🔘 Botón' }[el.tipo]);
  // redibuja solo este elemento
  const cambio = (todo = true) => {
    const n = nodo(el.id);
    if (n) {
      if (todo) { n.replaceWith(nodoElemento(el)); marcarSeleccion(); }
      else posicionar(n, el);
    }
    guardarLuego();
  };

  // ----- contenido -----
  const s1 = seccion(p, 'Contenido');
  if (el.tipo === 'texto') {
    const t = E('textarea', { rows: 4, value: el.c || '' });
    t.oninput = () => { el.c = t.value; cambio(); };
    s1.append(campo('Texto (también puedes hacer doble clic sobre él)', t));
  }
  if (el.tipo === 'boton') {
    const t = E('input', { value: el.c || '' });
    t.oninput = () => { el.c = t.value; cambio(); };
    const u = E('input', { type: 'url', value: el.enlace || '', placeholder: 'https://…' });
    u.oninput = () => { el.enlace = conHttps(u.value.trim()); cambio(); };
    s1.append(campo('Texto del botón', t), campo('Enlace', u));
  }
  if (el.tipo === 'imagen') {
    const z = E('div', { className: 'zona chica' });
    s1.append(z);
    zona(z, { texto: 'Imagen o GIF', icono: '🖼', acepta: 'image/*', url: ok(el.c), mime: el.c ? 'image/' : '', alCambiar(u) { el.c = u; cambio(); } });
    const a = E('input', { value: el.alt || '', placeholder: 'Qué se ve en la imagen' });
    a.oninput = () => { el.alt = a.value; cambio(); };
    s1.append(campo('Descripción', a));
  }
  if (el.tipo === 'sticker') {
    const lib = E('div', { className: 'stickers-lib' });
    STICKERS.forEach((s) => {
      const b = E('button', { type: 'button', title: 'Usar este sticker', onclick() { el.c = s; cambio(); } }, ok(s) ? `<img src="${s}" alt="">` : s);
      lib.append(b);
    });
    const e = E('input', { value: ok(el.c) ? '' : el.c, placeholder: 'o escribe un emoji', maxLength: 8 });
    e.oninput = () => { if (e.value.trim()) { el.c = e.value.trim(); cambio(); } };
    const z = E('div', { className: 'zona chica' });
    s1.append(lib, e, campo('Tu propio sticker (imagen o GIF)', z));
    zona(z, { texto: 'Elegir sticker', icono: '📁', acepta: 'image/*', alCambiar(u) { if (u) { el.c = u; cambio(); } } });
  }

  // ----- estilo -----
  const s2 = seccion(p, 'Estilo');
  // en celular se muestra y se cambia la posición propia del celular
  if (esMovil()) {
    const aviso = E('div', { className: 'prop-movil' }, el.m ? '📱 Este elemento tiene su propia posición en celular.' : '📱 Lo que muevas aquí cambia solo en celular.');
    if (el.m) aviso.append(E('button', { type: 'button', className: 'sec', onclick() { delete el.m; cambio(); abrirPropiedades({ el: el.id }); } }, 'Usar la misma que en computadora'));
    s2.append(aviso);
  }
  const v = vista(el);
  s2.append(
    rango('Ancho', 24, 1200, v.w, ' px', (x) => { destino(el).w = x; cambio(el.tipo === 'sticker'); }),
    rango('Girar', -180, 180, v.r || 0, '°', (x) => { destino(el).r = x; cambio(false); }),
    rango('Opacidad', 10, 100, Math.round((el.op == null ? 1 : el.op) * 100), '%', (v) => { el.op = v / 100; cambio(false); }),
  );
  if (el.tipo === 'texto' || el.tipo === 'boton') {
    const f = selectorFuente(el.fuente || 'vt', (k) => { el.fuente = k; cambio(); });
    const col = E('input', { type: 'color', value: el.color || '#3b2416' });
    col.oninput = () => { el.color = col.value; cambio(); };
    const fon = E('input', { type: 'color', value: el.fondo || '#fbf4dc' });
    const sinFondo = E('label', { className: 'check' }, '<input type="checkbox"> Sin fondo');
    $('input', sinFondo).checked = !el.fondo;
    fon.oninput = () => { el.fondo = fon.value; $('input', sinFondo).checked = false; cambio(); };
    $('input', sinFondo).onchange = (e) => { el.fondo = e.target.checked ? '' : fon.value; cambio(); };
    const alin = E('div', { className: 'prop-fila' });
    [['left', '⬅ Izq.'], ['center', '↔ Centro'], ['right', 'Der. ➡']].forEach(([v, t]) => {
      const b = E('button', { type: 'button', className: 'sec', onclick() { el.alin = v; cambio(); $$('button', alin).forEach((x) => x.setAttribute('aria-pressed', x === b)); } }, t);
      b.setAttribute('aria-pressed', (el.alin || 'left') === v);
      alin.append(b);
    });
    const fmt = E('div', { className: 'prop-fila' });
    [['negrita', '<b>N</b> Negrita'], ['cursiva', '<i>C</i> Cursiva']].forEach(([k, t]) => {
      const b = E('button', { type: 'button', className: 'sec', onclick() { el[k] = !el[k]; b.setAttribute('aria-pressed', !!el[k]); cambio(); } }, t);
      b.setAttribute('aria-pressed', !!el[k]);
      fmt.append(b);
    });
    const colores = E('div', { className: 'fila' });
    colores.append(campo('Color de letra', col), campo('Fondo', fon, sinFondo));
    s2.append(rango('Tamaño de letra', 10, 120, el.tam || 22, ' px', (v) => { el.tam = v; cambio(); }), campo('Fuente', f), colores, campo('Alineación', alin), fmt);
  }

  // ----- animación -----
  const s3 = seccion(p, 'Animación');
  const an = E('div', { className: 'prop-fila' });
  Object.entries(ANIMACIONES).forEach(([k, t]) => {
    const b = E('button', { type: 'button', className: 'sec', onclick() {
      el.anim = k;
      $$('button', an).forEach((x) => x.setAttribute('aria-pressed', x === b));
      cambio();
      // en el editor se muestra la animación de "aparecer" una vez
      if (k === 'aparecer') { const n = nodo(el.id); n.classList.remove('visto'); setTimeout(() => n.classList.add('visto'), 80); }
    } }, t);
    b.setAttribute('aria-pressed', (el.anim || '') === k);
    an.append(b);
  });
  s3.append(an);

  // ----- acciones -----
  const s4 = seccion(p, 'Acciones');
  const lk = E('label', { className: 'check' }, '<input type="checkbox"> 🔒 Bloquear posición (no se mueve sin querer)');
  $('input', lk).checked = !!el.lock;
  $('input', lk).onchange = (e) => { el.lock = e.target.checked; dibujarElementos(); guardarSitio(); };
  const fila = E('div', { className: 'prop-fila' });
  fila.append(
    E('button', { type: 'button', onclick: () => accionElemento('duplicar') }, '📋 Duplicar'),
    E('button', { type: 'button', onclick: () => accionElemento('frente') }, '⬆ Al frente'),
    E('button', { type: 'button', onclick: () => accionElemento('atras') }, '⬇ Atrás'),
    E('button', { type: 'button', className: 'prin', onclick: () => accionElemento('borrar') }, '🗑 Borrar'),
  );
  s4.append(lk, fila);
}

// ----- un widget de la derecha -----
function propsWidget(p, k) {
  cabeceraPanel(p, '⚙ ' + NOMBRES_PANELES[k]);
  const s1 = seccion(p, 'General');
  const vis = E('label', { className: 'check' }, '<input type="checkbox"> Mostrar este widget');
  $('input', vis).checked = S.paneles[k] !== false;
  $('input', vis).onchange = (e) => { S.paneles[k] = e.target.checked; paneles(); guardarSitio(); };
  s1.append(vis);
  if (k !== 'mascota') {
    const t = E('input', { value: S.titulos[k] || '', placeholder: TITULOS_BASE[k] || '' });
    t.oninput = () => { S.titulos[k] = t.value.trim(); paneles(); guardarLuego(); };
    s1.append(campo('Título del panel (vacío = el original)', t));
  }
  s1.append(E('button', { type: 'button', onclick: () => abrirPropiedades({ estilo: k }) }, '🖌 Estilo de este widget'));

  const s2 = seccion(p, 'Contenido');
  if (k === 'musica') {
    const lista = E('div', { className: 'w-lista' });
    const pintar = () => {
      lista.innerHTML = '';
      if (!S.musica.length) lista.append(E('p', { className: 'ayuda' }, 'Todavía no hay canciones.'));
      S.musica.forEach((m, i) => {
        const f = E('div', { className: 'w-fila' });
        f.append(
          E('button', { type: 'button', className: 'sec', title: 'Subir', 'aria-label': 'Subir', disabled: i === 0, onclick() { [S.musica[i - 1], S.musica[i]] = [S.musica[i], S.musica[i - 1]]; pl(); guardarSitio(); pintar(); } }, '↑'),
          E('button', { type: 'button', className: 'sec', title: 'Bajar', 'aria-label': 'Bajar', disabled: i === S.musica.length - 1, onclick() { [S.musica[i + 1], S.musica[i]] = [S.musica[i], S.musica[i + 1]]; pl(); guardarSitio(); pintar(); } }, '↓'),
          E('span', {}, '♪ ' + esc(m.n)),
          E('button', { type: 'button', className: 'sec', title: 'Quitar', 'aria-label': 'Quitar', async onclick() {
            if (!(await confirmar(`¿Seguro que quieres quitar “${m.n}”?`))) return;
            S.musica.splice(i, 1);
            pl();
            guardarSitio();
            abrirPropiedades({ widget: 'musica' });
          } }, '🗑'),
        );
        lista.append(f);
      });
    };
    pintar();
    s2.append(lista, E('button', { type: 'button', className: 'prin', onclick: nuevaCancion }, '＋ Agregar canción'));
  }
  if (k === 'mascota') {
    const n = E('input', { value: S.mascota.nombre, maxLength: 30 });
    n.oninput = () => { S.mascota.nombre = n.value.trim() || 'Mi perrito'; paneles(); guardarLuego(); };
    const im = E('input', { value: S.mascota.imagen, placeholder: 'vacío = perrito pixelado · 🐶 · https://…' });
    im.onchange = () => { S.mascota.imagen = im.value.trim(); guardarSitio(); msg('La nueva mascota aparece al recargar la página'); };
    S.mascota.accesorios = S.mascota.accesorios || {};
    const opciones = () => { if (mascota) mascota.setOpciones({ velocidad: S.mascota.velocidad, frases: S.mascota.frases, accesorios: S.mascota.accesorios }); };
    const vel = rango('Velocidad', 3, 30, Math.round((S.mascota.velocidad || 1) * 10), '', (x) => { S.mascota.velocidad = x / 10; opciones(); guardarLuego(); });
    $('b', vel).textContent = '×' + (S.mascota.velocidad || 1);
    $('input', vel).addEventListener('input', (e) => { $('b', vel).textContent = '×' + e.target.value / 10; });
    const fr = E('textarea', { rows: 4, value: (S.mascota.frases || []).join('\n'), placeholder: '¡Guau! 🐾\nVamos a pasear\n…' });
    fr.oninput = () => { S.mascota.frases = fr.value.split('\n').map((x) => x.trim()).filter(Boolean); opciones(); guardarLuego(); };
    s2.append(campo('Nombre', n), campo('Foto o emoji', im), vel, campo('Frases que dice (una por línea)', fr),
      E('p', { className: 'ayuda' }, 'Las fotos del álbum se agregan con el botón 📷 del panel de la mascota.'));

    // ----- accesorios en pixel-art: uno por lugar, se combinan -----
    const s3 = seccion(p, '🎀 Accesorios');
    const vista = E('div', { className: 'acc-vista' });
    const pintarVista = () => { vista.innerHTML = perroVestido(S.mascota.accesorios, 132); };
    pintarVista();
    s3.append(vista);
    if (S.mascota.imagen) s3.append(E('p', { className: 'ayuda' }, 'Los accesorios se ven en el perrito pixelado (deja vacío “Foto o emoji”).'));
    for (const [lugar, nombre] of Object.entries(LUGARES)) {
      const fila = E('div', { className: 'acc-fila' });
      const ids = [''].concat(Object.keys(ACCESORIOS).filter((k) => ACCESORIOS[k].lugar === lugar));
      ids.forEach((id) => {
        const b = E('button', { type: 'button', className: 'acc-op', title: id ? ACCESORIOS[id].nombre : 'Nada', 'aria-label': id ? ACCESORIOS[id].nombre : 'Nada en ' + nombre.toLowerCase(), onclick() {
          if (id) S.mascota.accesorios[lugar] = id; else delete S.mascota.accesorios[lugar];
          $$('button', fila).forEach((x) => x.setAttribute('aria-pressed', x === b));
          pintarVista();
          opciones();
          guardarSitio();
        } }, id ? dibujoAccesorio(id, 34) : '∅');
        b.setAttribute('aria-pressed', (S.mascota.accesorios[lugar] || '') === id);
        fila.append(b);
      });
      const c = E('div', { className: 'campo' });
      c.append(E('span', {}, nombre), fila);
      s3.append(c);
    }
  }
  if (k === 'animo') {
    const t = E('textarea', { rows: 7, value: S.animos.join('\n') });
    t.oninput = () => { S.animos = t.value.split('\n').map((x) => x.trim()).filter(Boolean); animo(); guardarLuego(); };
    s2.append(campo('Opciones de ánimo (una por línea)', t));
  }
  if (k === 'calendario') s2.append(E('p', { className: 'ayuda' }, 'Toca un día del calendario y escribe qué pasó o pasará. Los días con evento se ven amarillos y los días con publicación tienen una raya roja.'));
  if (k === 'pizarra') s2.append(E('p', { className: 'ayuda' }, 'Cada visitante dibuja en su propia pizarra y puede descargar su dibujo con 💾.'));
}

// ----- personaje invitado de la cabecera (AuronPlay) -----
function propsCameo(p) {
  S.cameo = Object.assign({ visible: true, nombre: 'AuronPlay', saludo: SALUDO_CAMEO, frases: FRASES_CAMEO.slice() }, S.cameo);
  const c = S.cameo;
  cabeceraPanel(p, '📺 ' + (c.nombre || 'Invitado'));
  const s = seccion(p, 'Personaje invitado');
  const vis = E('label', { className: 'check' }, '<input type="checkbox"> Mostrarlo');
  $('input', vis).checked = c.visible !== false;
  $('input', vis).onchange = (e) => { c.visible = e.target.checked; Cameo.poner(c, adm); guardarSitio(); };
  const n = E('input', { value: c.nombre || '', maxLength: 30 });
  n.oninput = () => { c.nombre = n.value.trim() || 'AuronPlay'; Cameo.poner(c, adm); guardarLuego(); };
  s.append(vis, campo('Nombre', n));

  const s2 = seccion(p, '💬 Lo que dice');
  const sal = E('textarea', { rows: 3, value: c.saludo || '', placeholder: 'Frase que dice al entrar a la página' });
  sal.oninput = () => { c.saludo = sal.value.trim(); Cameo.poner(c, adm); guardarLuego(); };
  const f = E('textarea', { rows: 7, value: (c.frases || []).join('\n'), placeholder: 'Una frase por línea' });
  f.oninput = () => { c.frases = f.value.split('\n').map((x) => x.trim()).filter(Boolean); Cameo.poner(c, adm); guardarLuego(); };
  const probar = E('div', { className: 'prop-fila' });
  probar.append(
    E('button', { type: 'button', className: 'sec', onclick: () => c.saludo && Cameo.decir(c.saludo) }, '▶ Oír el saludo'),
    E('button', { type: 'button', className: 'sec', onclick: () => { const F = c.frases && c.frases.length ? c.frases : FRASES_CAMEO; Cameo.decir(F[Math.floor(Math.random() * F.length)]); } }, '▶ Oír una frase'),
  );
  s2.append(campo('Frase al entrar (la dice primero, cada vez que alguien abre la página)', sal), campo('Sus otras frases (una por línea; dice una cada 12 segundos y otra al tocarlo)', f), probar);

  const s3 = seccion(p, '📍 Dónde está');
  s3.append(E('p', { className: 'ayuda' }, 'Arrástralo con el mouse (o el dedo) a donde quieras: se queda ahí para todos tus visitantes. Un toque sin moverlo hace que hable.'),
    E('button', { type: 'button', className: 'sec', onclick() { delete c.x; delete c.y; Cameo.poner(c, adm); Cameo.colocar(); guardarSitio(); msg('Volvió a la esquina de la cabecera'); } }, '↺ Volver a la cabecera'));
}

// ----- lista de todos los widgets: activar y ordenar -----
function propsWidgets(p) {
  cabeceraPanel(p, '🧩 Mis widgets');
  p.append(E('p', { className: 'ayuda' }, 'Activa, desactiva y ordena los paneles de la derecha. ⚙ abre sus opciones.'));
  const lista = E('div', { className: 'w-lista' });
  S.orden.forEach((k, i) => {
    const f = E('div', { className: 'w-fila' });
    const vis = E('label', { className: 'check' }, `<input type="checkbox"> ${esc(NOMBRES_PANELES[k])}`);
    $('input', vis).checked = S.paneles[k] !== false;
    $('input', vis).onchange = (e) => { S.paneles[k] = e.target.checked; paneles(); guardarSitio(); };
    const mover = (d) => { const j = i + d; [S.orden[i], S.orden[j]] = [S.orden[j], S.orden[i]]; paneles(); guardarSitio(); abrirPropiedades({ widgets: true }); };
    f.append(
      E('button', { type: 'button', className: 'sec', title: 'Subir', 'aria-label': 'Subir', disabled: i === 0, onclick: () => mover(-1) }, '↑'),
      E('button', { type: 'button', className: 'sec', title: 'Bajar', 'aria-label': 'Bajar', disabled: i === S.orden.length - 1, onclick: () => mover(1) }, '↓'),
      vis,
      E('button', { type: 'button', className: 'sec', title: 'Opciones', 'aria-label': 'Opciones', onclick: () => abrirPropiedades({ widget: k }) }, '⚙'),
    );
    lista.append(f);
  });
  p.append(lista);
  // el personaje invitado también se ajusta desde aquí
  if (S.cameo) {
    const f = E('div', { className: 'w-fila' });
    const vis = E('label', { className: 'check' }, `<input type="checkbox"> 📺 ${esc(S.cameo.nombre || 'AuronPlay')}`);
    $('input', vis).checked = S.cameo.visible !== false;
    $('input', vis).onchange = (e) => { S.cameo.visible = e.target.checked; Cameo.poner(S.cameo, adm); guardarSitio(); };
    f.append(E('span'), E('span'), vis, E('button', { type: 'button', className: 'sec', title: 'Sus frases', 'aria-label': 'Sus frases', onclick: () => abrirPropiedades({ cameo: true }) }, '⚙'));
    p.append(E('h3', { className: 'cat-sub' }, 'Personaje invitado'), f);
  }
}

// ============================================================
// Catálogo "+ Agregar"
// ============================================================
function catalogo() {
  const ocultos = S.orden.filter((k) => S.paneles[k] === false);
  const caja = modal(`<h2>✚ Agregar a la página</h2>
    <div class="catalogo">
      <button data-t="texto"><span>📝</span>Texto</button>
      <button data-t="imagen"><span>🖼</span>Imagen o GIF</button>
      <button data-t="sticker"><span>🐝</span>Sticker</button>
      <button data-t="boton"><span>🔘</span>Botón</button>
      <button data-t="publicacion"><span>📜</span>Publicación</button>
    </div>
    ${S.cameo && S.cameo.visible === false ? `<h3 class="cat-sub">Personaje</h3><div class="catalogo"><button data-c="1"><span>📺</span>${esc(S.cameo.nombre || 'AuronPlay')}</button></div>` : ''}
    <h3 class="cat-sub">Widgets</h3>
    <div class="catalogo">${ocultos.length
      ? ocultos.map((k) => `<button data-w="${k}"><span>${NOMBRES_PANELES[k].split(' ')[0]}</span>${esc(NOMBRES_PANELES[k].split(' ').slice(1).join(' '))}</button>`).join('')
      : '<p class="ayuda">Todos los widgets ya están en la página. Puedes ordenarlos en 🧩 Widgets.</p>'}</div>`);
  caja.addEventListener('click', (e) => {
    const b = e.target.closest('[data-t],[data-w],[data-c]');
    if (!b) return;
    cerrarModal();
    if (b.dataset.c) { S.cameo.visible = true; Cameo.poner(S.cameo, adm); guardarSitio(); msg('📺 Volvió a la cabecera'); return; }
    if (b.dataset.w) { S.paneles[b.dataset.w] = true; paneles(); guardarSitio(); msg('Widget agregado a la derecha ✓'); return; }
    if (b.dataset.t === 'publicacion') return editor();
    agregarElemento(b.dataset.t);
  });
}

// ============================================================
// Deshacer / rehacer (guarda hasta 60 pasos)
// ============================================================
const historia = { atras: [], adelante: [], ultimo: '' };

// app.js la llama en cada guardarSitio(): guarda cómo estaba antes del cambio
function registrarHistoria() {
  const ahora = JSON.stringify(S);
  if (historia.ultimo && ahora !== historia.ultimo) {
    historia.atras.push(historia.ultimo);
    if (historia.atras.length > 60) historia.atras.shift();
    historia.adelante = [];
  }
  historia.ultimo = ahora;
  botonesHistoria();
}
function reiniciarHistoria() {
  historia.atras = [];
  historia.adelante = [];
  historia.ultimo = JSON.stringify(S);
  botonesHistoria();
}
function botonesHistoria() {
  const d = $('#ba-deshacer'), r = $('#ba-rehacer');
  if (d) d.disabled = !historia.atras.length;
  if (r) r.disabled = !historia.adelante.length;
}
function deshacer() {
  if (!historia.atras.length) return msg('No hay nada que deshacer');
  historia.adelante.push(JSON.stringify(S));
  restaurar(historia.atras.pop());
  msg('↶ Deshecho');
}
function rehacer() {
  if (!historia.adelante.length) return msg('No hay nada que rehacer');
  historia.atras.push(JSON.stringify(S));
  restaurar(historia.adelante.pop());
  msg('↷ Rehecho');
}
function restaurar(txt) {
  S = JSON.parse(txt);
  historia.ultimo = txt;
  if (sel && !buscar(sel)) sel = null;
  render();
  if (libroInst) libroInst.setPaginas(clonar(S.libro.paginas));
  if (mascota) mascota.setFotos(S.album);
  if (panelProp) abrirPropiedades(panelProp);
  guardarSitio(true);
  botonesHistoria();
}

// ============================================================
// Vista previa y rejilla
// ============================================================
function modoVistaPrevia(si) {
  previa = si;
  adm = !si;
  document.body.classList.toggle('previa', si);
  sel = null;
  cerrarPropiedades();
  render();
  ajustarBarra();
  msg(si ? '👁 Así ven la página tus visitantes' : '✏ Volviste a editar');
}
function alternarRejilla() {
  const on = !rejilla();
  ls('rejilla', on ? '1' : '0');
  pintarRejilla();
  msg(on ? '▦ Ajustar a la rejilla: activado' : 'Ajustar a la rejilla: desactivado');
}
function pintarRejilla() {
  document.body.classList.toggle('con-rejilla', rejilla());
  const b = $('#ba-rejilla');
  if (b) b.setAttribute('aria-pressed', rejilla());
}

// ============================================================
// Inicio del editor (lo llama app.js una vez)
// ============================================================
function iniciarEditor() {
  const capa = $('#st');

  // seleccionar y arrastrar
  capa.addEventListener('pointerdown', (ev) => {
    if (!adm) return;
    const n = ev.target.closest('.el');
    if (!n || ev.target.closest('.el-barra') || n.querySelector('[contenteditable=true]')) return;
    ev.preventDefault();
    const el = buscar(n.dataset.id);
    if (sel !== el.id) seleccionar(el.id);
    if (ev.target.classList.contains('h-res')) return redimensionar(ev, el, nodo(el.id));
    if (ev.target.classList.contains('h-rot')) return girar(ev, el, nodo(el.id));
    if (!el.lock) arrastrar(ev, el, nodo(el.id));
  });
  // en el editor los botones no abren su enlace
  capa.addEventListener('click', (ev) => { if (adm && ev.target.closest('.el-boton')) ev.preventDefault(); });
  // doble clic: escribir directo sobre el texto
  capa.addEventListener('dblclick', (ev) => {
    if (!adm) return;
    const n = ev.target.closest('.el');
    const t = n && n.querySelector('.el-texto, .el-boton');
    if (!t) return;
    const el = buscar(n.dataset.id);
    t.contentEditable = 'true';
    t.focus();
    getSelection().selectAllChildren(t);
    t.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Escape') t.blur(); };
    t.onblur = () => {
      t.contentEditable = 'false';
      t.onblur = t.onkeydown = null;
      el.c = t.innerText.trim();
      guardarSitio();
      refrescarPropiedades();
    };
  });
  // clic fuera: quitar la selección
  document.addEventListener('pointerdown', (ev) => {
    if (!adm || !sel) return;
    if (ev.target.closest('#st .el, #propiedades, .barra-admin, .modal')) return;
    seleccionar(null);
  });

  // ⚙ en cada widget de la derecha (solo se ve en el Modo Creador)
  $$('[data-panel]').forEach((d) => {
    const s = $('summary', d);
    const b = E('button', { type: 'button', className: 'w-ajustes', title: 'Opciones del widget', 'aria-label': 'Opciones del widget' }, '⚙');
    b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); abrirPropiedades({ widget: d.dataset.panel }); };
    s.insertBefore(b, s.lastElementChild && s.lastElementChild.classList.contains('win95-controls') ? s.lastElementChild : null);
  });

  // teclado: Ctrl+Z, Ctrl+Y, Ctrl+D, Supr, flechas, Esc
  document.addEventListener('keydown', (e) => {
    if (!adm || modalActual) return;
    const escribiendo = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable;
    if (escribiendo) return;
    const k = e.key.toLowerCase();
    if (e.ctrlKey || e.metaKey) {
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); deshacer(); }
      else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); rehacer(); }
      else if (k === 'd' && sel) { e.preventDefault(); accionElemento('duplicar'); }
      return;
    }
    if (!sel) return;
    const el = buscar(sel);
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); accionElemento('borrar'); }
    else if (e.key === 'Escape') seleccionar(null);
    else if (e.key.startsWith('Arrow') && !el.lock) {
      e.preventDefault();
      const d = e.shiftKey ? 10 : 1, ancho = $('#st').offsetWidth, t = destino(el);
      if (e.key === 'ArrowLeft') t.x -= d / ancho * 100;
      if (e.key === 'ArrowRight') t.x += d / ancho * 100;
      if (e.key === 'ArrowUp') t.y = Math.max(0, t.y - d);
      if (e.key === 'ArrowDown') t.y += d;
      posicionar(nodo(el.id), el);
      guardarLuego();
    }
  });

  pintarRejilla();

  // al pasar de computadora a celular (o al revés) cambian las posiciones
  let tRes, eraMovil = esMovil();
  addEventListener('resize', () => {
    clearTimeout(tRes);
    tRes = setTimeout(() => { if (esMovil() !== eraMovil) { eraMovil = esMovil(); dibujarElementos(); } }, 150);
  });
}

// ============================================================
// Estilos: globales, de cada sección y de cada widget (estilo Webflow)
// ============================================================
// [nombre, selector, selector del fondo (si es otro)]
const SECCIONES = {
  hero: ['🏠 Cabecera', '.hero', '.hero-banner'],
  destacada: ['★ Publicación destacada', '.destacada'],
  tarjetas: ['🗂 Tarjetas de publicaciones', '.tarjeta, .tarjeta.sin-media'],
  libro: ['📖 Sección del libro', '.libro-sec'],
  pie: ['⬇ Pie de página', '.pie'],
};
const SOMBRAS = { '': 'La del tema', no: 'Sin sombra', pixel: 'Pixel', suave: 'Suave', grande: 'Grande' };
const SOMBRA_CSS = { no: 'none', pixel: '6px 6px 0 var(--b2)', suave: '0 10px 28px #0004', grande: '14px 14px 0 #0007' };
const PATRONES = { tema: 'Textura del tema', lunares: 'Lunares', cuadros: 'Cuadritos', liso: 'Liso', imagen: 'Imagen propia' };
const nombreDe = (k) => (SECCIONES[k] ? SECCIONES[k][0] : NOMBRES_PANELES[k] || k);

// Escribe una hoja de estilos con todo lo que eligió la creadora
function aplicarEstilos() {
  const g = Object.assign({}, D.global, S.global);
  cargarFuentes(g.fTitulo, g.fTexto);
  let css = `:root{--vt:${FAMILIAS[g.fTexto] || FAMILIAS.vt};}`;
  // la fuente de títulos cambia solo los títulos (las etiquetas pequeñas siguen pixeladas);
  // las fuentes no pixeladas se ven más chicas, por eso llevan su propio tamaño
  if (g.fTitulo && g.fTitulo !== 'pix' && FAMILIAS[g.fTitulo]) {
    const f = FAMILIAS[g.fTitulo];
    const tam = {
      '.hero h1': 'clamp(40px, 7vw, 84px)', '.pie-titulo': 'clamp(28px, 4vw, 48px)', '.pub-cabeza h2, .libro-texto h2': '36px',
      '.destacada h2, .v-texto h2': '34px', '.tarjeta h3': '26px', '.perfil-nombre': '28px', '.panel > summary h2': '24px', '.b-titulo': '30px', '.b-resena b': '24px',
    };
    for (const [s, t] of Object.entries(tam)) css += `${s}{font-family:${f} !important;font-size:${t} !important;line-height:1.1 !important;}`;
  }
  css += `body{font-size:${Math.max(14, Math.min(32, +g.tam || 22))}px;}`;
  const fondos = {
    lunares: 'radial-gradient(#fff9 22%, transparent 24%) 0 0 / 26px 26px, var(--ye)',
    cuadros: 'linear-gradient(90deg, #0000 50%, #00000012 0) 0 0 / 32px 32px, linear-gradient(#0000 50%, #00000012 0) 0 0 / 32px 32px, var(--ye)',
    liso: 'var(--ye)',
  };
  if (g.patron === 'imagen' && ok(g.fondoImg)) css += `body{background:url("${ok(g.fondoImg)}") center / cover fixed, var(--ye) !important;}`;
  else if (g.patron !== 'lunares' && fondos[g.patron]) css += `body{background:${fondos[g.patron]} !important;}`;

  for (const [k, e] of Object.entries(S.estilos || {})) {
    const sel = SECCIONES[k] ? SECCIONES[k][1] : `[data-panel="${k}"]`;
    const selFondo = SECCIONES[k] && SECCIONES[k][2] ? SECCIONES[k][2] : sel;
    const caja = [], fondo = [];
    const hay = (x) => x != null && x !== '';
    if (e.fondo === 'transparente') fondo.push('background:transparent');
    else if (e.fondo) fondo.push(`background:${e.fondo}`);
    if (ok(e.img)) fondo.push(`background-image:url("${ok(e.img)}")`, 'background-size:cover', 'background-position:center');
    if (e.texto) caja.push(`color:${e.texto}`);
    if (hay(e.borde)) caja.push(`border-width:${+e.borde}px`, 'border-style:solid');
    if (e.bordeColor) caja.push(`border-color:${e.bordeColor}`);
    if (hay(e.radio)) caja.push(`border-radius:${+e.radio}px`, 'overflow:hidden');
    if (e.sombra && SOMBRA_CSS[e.sombra]) caja.push(`box-shadow:${SOMBRA_CSS[e.sombra]}`);
    if (hay(e.relleno)) caja.push(`padding:${+e.relleno}px`);
    if (hay(e.margen)) caja.push(`margin-bottom:${+e.margen}px`);
    if (hay(e.op)) caja.push(`opacity:${+e.op / 100}`);
    const regla = (s, L) => (L.length ? `${s}{${L.map((x) => x + ' !important').join(';')}}` : '');
    css += selFondo === sel ? regla(sel, fondo.concat(caja)) : regla(sel, caja) + regla(selFondo, fondo);
  }
  css += '\n' + (S.css || '');
  let st = $('#estilos-usuario');
  if (!st) { st = E('style', { id: 'estilos-usuario' }); document.head.append(st); }
  st.textContent = css;
  // la textura del tema depende del fondo elegido aquí
  aplicarAmbiente(S.tema);
}

// Lista de todo lo que se puede estilizar
function propsEstilos(p) {
  cabeceraPanel(p, '🖌 Estilos');
  p.append(E('p', { className: 'ayuda' }, 'Elige qué quieres cambiar. Los colores principales están en 🎨 Temas.'));
  const lista = E('div', { className: 'w-lista' });
  const fila = (txt, que) => lista.append(E('button', { type: 'button', className: 'est-fila', onclick: () => abrirPropiedades(que) }, txt + ' <span>›</span>'));
  fila('🌐 Toda la página: fuentes, tamaño y fondo', { global: true });
  Object.keys(SECCIONES).forEach((k) => fila(SECCIONES[k][0], { estilo: k }));
  Object.keys(NOMBRES_PANELES).forEach((k) => fila(NOMBRES_PANELES[k], { estilo: k }));
  p.append(lista);

  // CSS personalizado (para usuarios avanzados)
  const s = seccion(p, '⌨ CSS personalizado (avanzado)');
  const t = E('textarea', { rows: 8, value: S.css || '', placeholder: '.tarjeta h3 { color: #c1121f; }', spellcheck: false, className: 'css-campo' });
  t.oninput = () => { S.css = t.value; aplicarEstilos(); guardarLuego(); };
  s.append(t, E('p', { className: 'ayuda' }, 'Se aplica en vivo. Si algo se ve raro, bórralo o usa ↶ Deshacer.'));
}

function propsGlobal(p) {
  cabeceraPanel(p, '🌐 Toda la página');
  p.append(E('button', { type: 'button', className: 'sec volver', onclick: () => abrirPropiedades({ estilos: true }) }, '‹ Estilos'));
  S.global = Object.assign({}, D.global, S.global);
  const g = S.global;
  const cambio = () => { aplicarEstilos(); guardarLuego(); };
  const sel = (opciones, k) => {
    const s = E('select', {}, Object.entries(opciones).map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join(''));
    s.value = g[k];
    s.onchange = () => { g[k] = s.value; cambio(); if (k === 'patron') abrirPropiedades({ global: true }); };
    return s;
  };
  const s1 = seccion(p, 'Letras');
  const fuente = (k) => selectorFuente(g[k], (v) => { g[k] = v; cambio(); });
  s1.append(campo('Fuente de los títulos', fuente('fTitulo')), campo('Fuente del texto', fuente('fTexto')),
    rango('Tamaño del texto', 16, 30, g.tam, ' px', (x) => { g.tam = x; cambio(); }));
  const s2 = seccion(p, 'Fondo de la página');
  s2.append(campo('Patrón', sel(PATRONES, 'patron')));
  if (g.patron === 'imagen') {
    const z = E('div', { className: 'zona chica' });
    s2.append(z);
    zona(z, { texto: 'Imagen de fondo', icono: '🏞', acepta: 'image/*', url: ok(g.fondoImg), mime: g.fondoImg ? 'image/' : '', alCambiar(u) { g.fondoImg = u; cambio(); } });
  }
}

// Estilo de una sección o de un widget
function propsEstilo(p, k) {
  cabeceraPanel(p, '🖌 ' + nombreDe(k));
  p.append(E('button', { type: 'button', className: 'sec volver', onclick: () => abrirPropiedades({ estilos: true }) }, '‹ Estilos'));
  S.estilos = S.estilos || {};
  const e = S.estilos[k] = S.estilos[k] || {};
  const cambio = () => { aplicarEstilos(); guardarLuego(); };
  // color con botón ↺ para volver al del tema
  const color = (etq, prop, base) => {
    const i = E('input', { type: 'color', value: /^#/.test(e[prop] || '') ? e[prop] : base });
    i.oninput = () => { e[prop] = i.value; cambio(); };
    const r = E('button', { type: 'button', className: 'sec', title: 'Volver al del tema', onclick() { delete e[prop]; i.value = base; cambio(); } }, '↺');
    const w = E('div', { className: 'prop-color' });
    w.append(i, r);
    return campo(etq, w);
  };
  const num = (etq, prop, min, max, base, unidad) => rango(etq, min, max, e[prop] == null || e[prop] === '' ? base : e[prop], unidad, (x) => { e[prop] = x; cambio(); });

  const s1 = seccion(p, 'Fondo');
  const sinFondo = E('label', { className: 'check' }, '<input type="checkbox"> Transparente');
  $('input', sinFondo).checked = e.fondo === 'transparente';
  $('input', sinFondo).onchange = (ev) => { if (ev.target.checked) e.fondo = 'transparente'; else delete e.fondo; cambio(); };
  const z = E('div', { className: 'zona chica' });
  s1.append(color('Color de fondo', 'fondo', '#fbf4dc'), sinFondo, campo('Imagen de fondo (opcional)', z));
  zona(z, { texto: 'Imagen de fondo', icono: '🏞', acepta: 'image/*', url: ok(e.img), mime: e.img ? 'image/' : '', alCambiar(u) { e.img = u; cambio(); } });

  const s2 = seccion(p, 'Texto y borde');
  s2.append(color('Color del texto', 'texto', '#3b2416'), num('Grosor del borde', 'borde', 0, 12, 4, ' px'), color('Color del borde', 'bordeColor', '#5a3825'), num('Esquinas redondeadas', 'radio', 0, 40, 6, ' px'));

  const s3 = seccion(p, 'Sombra y espacio');
  const so = E('select', {}, Object.entries(SOMBRAS).map(([v, t]) => `<option value="${v}">${t}</option>`).join(''));
  so.value = e.sombra || '';
  so.onchange = () => { if (so.value) e.sombra = so.value; else delete e.sombra; cambio(); };
  s3.append(campo('Sombra', so), num('Relleno (espacio por dentro)', 'relleno', 0, 60, 10, ' px'), num('Espacio debajo', 'margen', 0, 80, 14, ' px'), num('Opacidad', 'op', 20, 100, 100, '%'));

  const s4 = seccion(p, '');
  s4.append(E('button', { type: 'button', className: 'prin', async onclick() {
    if (!(await confirmar(`¿Quitar todos los cambios de estilo de “${nombreDe(k)}”?`, 'Sí, restablecer'))) return;
    delete S.estilos[k];
    aplicarEstilos();
    guardarSitio();
    abrirPropiedades({ estilo: k });
  } }, '↺ Restablecer como el tema'));
  // resalta un momento lo que se está editando
  const objetivo = $(SECCIONES[k] ? SECCIONES[k][1].split(',')[0] : `[data-panel="${k}"]`);
  if (objetivo) { objetivo.scrollIntoView({ behavior: 'smooth', block: 'center' }); objetivo.classList.add('resaltado'); setTimeout(() => objetivo.classList.remove('resaltado'), 1400); }
}

// ============================================================
// Copias de seguridad y versiones
// ============================================================
function propsCopias(p) {
  cabeceraPanel(p, '🗂 Copias y versiones');
  const s1 = seccion(p, 'Copia de seguridad');
  s1.append(E('p', { className: 'ayuda' }, 'Descarga un archivo con todo el diseño y las publicaciones. Guárdalo en tu computadora por si algo pasa.'));
  s1.append(E('button', { type: 'button', onclick() {
    const datos = { app: 'letras-para-mi-creador', version: 1, fecha: new Date().toISOString(), sitio: S, publicaciones: P };
    const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }));
    E('a', { href: url, download: `letras-copia-${hoy()}.json` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    msg('📥 Copia descargada');
  } }, '📥 Descargar copia de seguridad'));
  const inp = E('input', { type: 'file', accept: '.json,application/json', hidden: true });
  const conPubs = E('label', { className: 'check' }, '<input type="checkbox" checked> También recuperar las publicaciones que falten');
  inp.onchange = async () => {
    const f = inp.files[0];
    inp.value = '';
    if (!f) return;
    let d;
    try { d = JSON.parse(await f.text()); } catch (e) { return msg('Ese archivo no es una copia de seguridad válida'); }
    if (!d || !d.sitio || typeof d.sitio !== 'object') return msg('Ese archivo no es una copia de seguridad de esta página');
    if (!(await confirmar('¿Cambiar el diseño actual por el de la copia? (Puedes deshacerlo con ↶)', 'Sí, recuperar'))) return;
    S = mezclar(D, migrar(d.sitio));
    render();
    if (libroInst) libroInst.setPaginas(clonar(S.libro.paginas));
    if (mascota) mascota.setFotos(S.album);
    guardarSitio();
    let n = 0;
    if ($('input', conPubs).checked && Array.isArray(d.publicaciones)) {
      const hay = new Set(P.map((x) => (x.titulo || '') + '|' + (x.fecha || '')));
      for (const x of d.publicaciones) {
        if (hay.has((x.titulo || '') + '|' + (x.fecha || ''))) continue;
        const { id, creado, ...datos } = x;
        try { P.push(await api('publicaciones', { method: 'POST', json: datos })); n++; } catch (e) {}
      }
      ordenar();
      publicaciones();
      calendario();
    }
    msg(`✔ Copia recuperada${n ? ` · ${n} publicaciones agregadas` : ''}`);
  };
  s1.append(E('button', { type: 'button', className: 'sec', onclick: () => inp.click() }, '📤 Recuperar desde una copia'), conPubs, inp);

  const s2 = seccion(p, 'Versiones del diseño');
  s2.append(E('p', { className: 'ayuda' }, 'Mientras editas se guarda una versión automática cada 10 minutos. También puedes guardar una con nombre.'));
  const nom = E('input', { placeholder: 'Ej: Diseño de Halloween', maxLength: 80 });
  const lista = E('div', { className: 'w-lista' }, '<p class="ayuda">Cargando…</p>');
  const cargar = async () => {
    try {
      const V = await api('versiones');
      lista.innerHTML = '';
      if (!V.length) lista.append(E('p', { className: 'ayuda' }, 'Todavía no hay versiones guardadas.'));
      V.forEach((v) => {
        const f = E('div', { className: 'ver-fila' });
        f.append(E('div', {}, `<b>${esc(v.nombre)}</b><br><small>${esc(new Date(v.fecha).toLocaleString('es'))}</small>`),
          E('button', { type: 'button', className: 'sec', async onclick() {
            if (!(await confirmar(`¿Volver al diseño “${v.nombre}”? (Puedes deshacerlo con ↶)`, 'Sí, volver'))) return;
            try {
              const d = await api('versiones/' + v.id);
              S = mezclar(D, migrar(d.datos));
              render();
              if (libroInst) libroInst.setPaginas(clonar(S.libro.paginas));
              if (mascota) mascota.setFotos(S.album);
              guardarSitio();
              msg('↩ Volviste a “' + v.nombre + '”');
            } catch (e) { msg('No se pudo abrir esa versión'); }
          } }, '↩ Volver a esta'));
        lista.append(f);
      });
    } catch (e) { lista.innerHTML = '<p class="ayuda">No se pudieron cargar las versiones.</p>'; }
  };
  s2.append(campo('Nombre de la versión', nom), E('button', { type: 'button', async onclick() {
    if (tGuardar) await guardarAhora();
    try { await api('versiones', { method: 'POST', json: { nombre: nom.value.trim() } }); nom.value = ''; msg('📌 Versión guardada'); cargar(); } catch (e) { msg('No se pudo guardar la versión'); }
  } }, '📌 Guardar versión ahora'), lista);
  cargar();
}

// ============================================================
// Vista por dispositivo: 💻 computadora · 📱 tablet · 📱 celular
// La página se abre dentro de un marco con ese ancho y se puede editar ahí.
// ============================================================
let dispositivo = 'pc';
async function verDispositivo(d) {
  if (d === dispositivo) return;
  if (d === 'pc') return cerrarDispositivo();
  if (tGuardar) await guardarAhora();
  seleccionar(null);
  cerrarPropiedades();
  dispositivo = d;
  let cont = $('#dispositivo');
  if (!cont) { cont = E('div', { id: 'dispositivo', className: 'dispositivo' }); document.body.append(cont); }
  const ancho = d === 'tablet' ? 768 : 390;
  cont.innerHTML = `<p class="disp-info">${d === 'tablet' ? '📱 Tablet · 768 px — puedes editar aquí igual que en la computadora.' : '📱 Celular · 390 px — lo que muevas aquí cambia solo en celular.'} Toca 💻 para volver.</p>
    <iframe src="/?marco=1" title="Vista de ${d === 'tablet' ? 'tablet' : 'celular'}" style="width:${ancho}px"></iframe>`;
  document.body.classList.add('con-dispositivo');
  pintarDispositivo();
}
async function cerrarDispositivo() {
  const cont = $('#dispositivo');
  if (cont) cont.remove();
  document.body.classList.remove('con-dispositivo');
  dispositivo = 'pc';
  pintarDispositivo();
  // lo editado dentro del marco ya está en el servidor: se vuelve a leer
  try {
    S = mezclar(D, migrar(await api('sitio')));
    P = await api('publicaciones');
    ordenar();
  } catch (e) {}
  render();
  if (libroInst) libroInst.setPaginas(clonar(S.libro.paginas));
  if (mascota) mascota.setFotos(S.album);
  reiniciarHistoria();
}
function pintarDispositivo() { $$('[data-disp]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.disp === dispositivo)); }

// ============================================================
// Recorrido guiado (❓ Ayuda)
// ============================================================
const PASOS_TOUR = [
  [null, '¡Bienvenida al Modo Creador! ✨ Te enseño las herramientas en unos pasos. Puedes repetir este recorrido cuando quieras con ❓ Ayuda.'],
  ['[data-accion=nueva]', '➕ Publicar: sube fotos, videos, canciones o PDF, y arma tu publicación con bloques (títulos, galerías, reseñas, YouTube…).'],
  ['[data-accion=agregar]', '✚ Agregar: pon textos, imágenes, stickers o botones en cualquier lugar. Arrástralos, gíralos y cámbiales el tamaño. Doble clic en un texto para escribir.'],
  ['[data-accion=widgets]', '🧩 Widgets: activa, desactiva y ordena los paneles de la derecha. Cada uno tiene su ⚙ con sus opciones.'],
  ['[data-accion=estilos]', '🖌 Estilos: fuentes, fondo de la página y el fondo, borde, sombra y esquinas de cada sección.'],
  ['[data-accion=personalizar]', '🎨 Temas: cambia todos los colores con un clic (Panal, Mina de noche, Pradera Minecraft, Enjambre concierto…).'],
  ['#ba-deshacer', '↶ ↷ Deshacer y rehacer (Ctrl+Z / Ctrl+Y). Equivocarse no pasa nada.'],
  ['[data-disp=movil]', '💻 📱 Mira y ajusta cómo se ve en tablet y en celular.'],
  ['[data-accion=copias]', '🗂 Copias: descarga una copia de seguridad o vuelve a una versión anterior del diseño.'],
  ['#ba-estado', 'Todo se guarda solo. Cuando veas “Guardado ✓”, ya está en la base de datos.'],
  ['[data-accion=ayuda]', '❓ Aquí vuelves a ver este recorrido. ¡A crear! 🐝'],
];
function cerrarTour() { const t = $('#tour'); if (t) t.remove(); }
function tour(i = 0) {
  cerrarTour();
  if (i < 0 || i >= PASOS_TOUR.length) return;
  ls('tour-visto', '1');
  const [s, txt] = PASOS_TOUR[i];
  const objetivo = s && $(s);
  const capa = E('div', { id: 'tour', className: 'tour' });
  const luz = E('div', { className: 'tour-luz' });
  const ultimo = i === PASOS_TOUR.length - 1;
  const globo = E('div', { className: 'tour-globo', role: 'dialog', 'aria-label': 'Recorrido guiado' },
    `<p>${esc(txt)}</p><div class="tour-nav"><small>${i + 1} / ${PASOS_TOUR.length}</small>
      ${ultimo ? '' : '<button class="sec" data-t="saltar">Saltar</button>'}${i ? '<button class="sec" data-t="ant">◀</button>' : ''}
      <button class="prin" data-t="sig">${ultimo ? '¡Listo!' : 'Siguiente ▶'}</button></div>`);
  capa.append(luz, globo);
  document.body.append(capa);
  if (objetivo && objetivo.getClientRects().length) {
    const r = objetivo.getBoundingClientRect();
    Object.assign(luz.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' });
    const gw = Math.min(360, innerWidth - 24);
    globo.style.left = Math.max(12, Math.min(innerWidth - gw - 12, r.left + r.width / 2 - gw / 2)) + 'px';
    globo.style.top = Math.min(innerHeight - 200, r.bottom + 16) + 'px';
  } else {
    capa.classList.add('centro');
  }
  globo.onclick = (e) => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    if (b.dataset.t === 'sig') ultimo ? cerrarTour() : tour(i + 1);
    if (b.dataset.t === 'ant') tour(i - 1);
    if (b.dataset.t === 'saltar') cerrarTour();
  };
  capa.onkeydown = (e) => { if (e.key === 'Escape') cerrarTour(); };
  setTimeout(() => $('[data-t=sig]', globo).focus(), 30);
}
