// ============================================================
// letras para mi creador — datos.js
// Guarda y lee todo a través del servidor (server.js), que lo guarda en MongoDB Atlas:
//   /api/sitio          → diseño, perfil, libro, música…
//   /api/publicaciones  → cada publicación
//   /api/versiones      → copias del diseño
//   /api/archivos       → fotos, videos y canciones
// app.js usa api('ruta', {method, json}) sin saber qué hay detrás.
// ============================================================

// Correo de la creadora (para no escribirlo cada vez que entras)
const CORREO_CREADORA = '';

async function api(ruta, op = {}) {
  const metodo = ruta === 'salir' ? 'POST' : op.method || 'GET';
  let r;
  try {
    r = await fetch('api/' + ruta, {
      method: metodo,
      credentials: 'same-origin',
      headers: op.json !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: op.json !== undefined ? JSON.stringify(op.json) : undefined,
    });
  } catch (e) {
    throw Object.assign(new Error('Sin conexión. Revisa tu internet.'), { codigo: 'sin-conexion' });
  }
  let d = {};
  try { d = await r.json(); } catch (e) {}
  if (r.ok) return d;
  const err = Object.assign(new Error(d.error || 'Algo falló. Intenta de nuevo.'), { codigo: d.codigo || 'http-' + r.status });
  // si la sesión se venció mientras editaba, sale del Modo Creador
  if (err.codigo === 'unauthenticated' && ruta !== 'entrar' && typeof adm !== 'undefined' && adm) { salir(); msg(err.message); }
  throw err;
}

// ---------- subir archivos (se guardan en MongoDB Atlas) ----------
const puedeSubir = () => true;

// las fotos grandes se reducen a 1600 px antes de subirlas
function reducir(f, max = 1600) {
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return Promise.resolve(f);
  return new Promise((listo) => {
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(im.src);
      const k = Math.min(1, max / Math.max(im.width, im.height));
      if (k === 1 && f.size < 1.5e6) return listo(f);
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      c.toBlob((b) => listo(b && b.size < f.size ? b : f), f.type === 'image/png' ? 'image/webp' : 'image/jpeg', 0.86);
    };
    im.onerror = () => listo(f);
    im.src = URL.createObjectURL(f);
  });
}

// sube un archivo y devuelve { url, tipo }; prog(0..1) informa el avance
async function subir(archivo, prog) {
  if (/^audio\//.test(archivo.type) && archivo.size > 10 * 1048576) throw new Error('La canción pesa más de 10 MB');
  if (archivo.size > 50 * 1048576) throw new Error('El archivo es demasiado grande (máximo 50 MB)');
  const f = await reducir(archivo);
  return new Promise((listo, falla) => {
    const x = new XMLHttpRequest();
    x.open('POST', 'api/archivos');
    x.setRequestHeader('Content-Type', f.type || archivo.type || 'application/octet-stream');
    x.setRequestHeader('X-Nombre', encodeURIComponent(archivo.name));
    if (prog) x.upload.onprogress = (e) => e.lengthComputable && prog(e.loaded / e.total);
    x.onload = () => {
      let d = {};
      try { d = JSON.parse(x.responseText); } catch (e) {}
      if (x.status < 300 && d.url) listo({ url: d.url, tipo: d.tipo || archivo.type });
      else falla(new Error(d.error || 'No se pudo subir el archivo'));
    };
    x.onerror = () => falla(new Error('Sin conexión. Revisa tu internet.'));
    x.send(f);
  });
}

// ---------- archivos que ya tiene la página ----------
// Los archivos están en public/archivos y public/img. La lista la arma
// listar-archivos.js cada vez que arranca el servidor (archivos/lista.json).
let listaArchivos = null;
async function archivosDisponibles() {
  if (!listaArchivos) {
    try { listaArchivos = await (await fetch('archivos/lista.json', { cache: 'no-cache' })).json(); } catch (e) { listaArchivos = []; }
  }
  return listaArchivos;
}
function mimeDe(u) {
  const x = String(u || '').toLowerCase().split('?')[0];
  const m = /\.(\w+)$/.exec(x);
  const e = m ? m[1] : '';
  return { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml',
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4', aac: 'audio/aac', pdf: 'application/pdf' }[e] || '';
}
