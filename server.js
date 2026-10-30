// ============================================================
// letras para mi creador — server.js
// Servidor de la página: entrega la carpeta public/ y guarda todo en MongoDB Atlas.
//   sitio          { _id: 'principal', ... } → diseño, perfil, libro, música…
//   publicaciones  → cada publicación
//   versiones      → copias del diseño
//   archivos.*     → fotos, videos y canciones (GridFS)
// La creadora entra con ADMIN_PASSWORD (y ADMIN_CORREO si está puesto).
// ============================================================
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');

// en tu computadora los datos salen de .env; en Render, de sus "Environment Variables"
if (fs.existsSync(path.join(__dirname, '.env'))) process.loadEnvFile(path.join(__dirname, '.env'));

const ENV = process.env;
for (const k of ['MONGODB_URI', 'ADMIN_PASSWORD']) {
  if (!ENV[k]) { console.error(`✖ Falta ${k} (revisa .env o las variables de entorno)`); process.exit(1); }
}
const URI = ENV.MONGODB_URI.replace(/<(db_)?password>/, encodeURIComponent(ENV.MONGODB_PASSWORD || ''));
const PUERTO = Number(ENV.PORT) || 3100;
const MAX_MB = Number(ENV.MAX_UPLOAD_MB) || 50;
const SECRETO = ENV.SESSION_SECRET || crypto.createHash('sha256').update('letras|' + ENV.ADMIN_PASSWORD).digest('hex');
const DURACION = 30 * 24 * 3600 * 1000; // la sesión dura 30 días

const cli = new MongoClient(URI);
const db = cli.db(ENV.MONGODB_DB || 'letras');
const cSitio = db.collection('sitio');
const cPubs = db.collection('publicaciones');
const cVers = db.collection('versiones');
const bucket = new GridFSBucket(db, { bucketName: 'archivos' });

// ---------- sesión de la creadora (cookie firmada) ----------
const firmar = (exp) => exp + '.' + crypto.createHmac('sha256', SECRETO).update(String(exp)).digest('hex');
function esAdmin(req) {
  const m = /(?:^|;\s*)sesion=([^;]+)/.exec(req.headers.cookie || '');
  if (!m) return false;
  const [exp] = m[1].split('.');
  const a = Buffer.from(m[1]), b = Buffer.from(firmar(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b) && Number(exp) > Date.now();
}
function cookie(req, res, valor, maxAge) {
  const seguro = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `sesion=${valor}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAge / 1000)}${seguro}`);
}
const soloAdmin = (req, res, next) => (esAdmin(req) ? next() : res.status(401).json({ error: 'Tu sesión terminó, vuelve a entrar', codigo: 'unauthenticated' }));

// comparar sin dar pistas por el tiempo de respuesta
const igual = (a, b) => crypto.timingSafeEqual(crypto.createHash('sha256').update(String(a)).digest(), crypto.createHash('sha256').update(String(b)).digest());

// máximo 10 intentos fallidos cada 15 minutos por dirección
const intentos = new Map();
function bloqueado(ip) {
  const x = intentos.get(ip);
  if (x && Date.now() - x.desde > 15 * 60000) intentos.delete(ip);
  return (intentos.get(ip) || { n: 0 }).n >= 10;
}
function fallo(ip) {
  const x = intentos.get(ip) || { n: 0, desde: Date.now() };
  x.n++;
  intentos.set(ip, x);
}

// ---------- utilidades ----------
const idDe = (s) => (/^[a-f0-9]{24}$/.test(s) ? new ObjectId(s) : s);
const conId = ({ _id, ...x }) => Object.assign({ id: String(_id) }, x);

const CAMPOS_PUB = ['titulo', 'tipo', 'fecha', 'texto', 'media', 'mediaTipo', 'portada', 'pestana', 'enlace', 'destacado', 'bloques'];
function limpiarPub(b) {
  const p = {};
  for (const k of CAMPOS_PUB) {
    if (b[k] === undefined) continue;
    if (k === 'destacado') p[k] = !!b[k];
    else if (k === 'bloques') p[k] = Array.isArray(b[k]) ? b[k].filter((x) => x && typeof x.tipo === 'string').slice(0, 200) : [];
    else p[k] = b[k] == null ? '' : String(b[k]).slice(0, k === 'texto' ? 100000 : 2000);
  }
  return p;
}

// cada 10 minutos de trabajo se guarda cómo estaba el diseño antes (versión automática)
async function versionAutomatica() {
  const ult = await cVers.findOne({ auto: true }, { sort: { fecha: -1 }, projection: { fecha: 1 } });
  if (ult && Date.now() - ult.fecha < 10 * 60000) return;
  const antes = await cSitio.findOne({ _id: 'principal' });
  if (!antes) return;
  delete antes._id;
  await cVers.insertOne({ fecha: Date.now(), nombre: 'Automática', auto: true, datos: antes });
  // se guardan como máximo 30 versiones automáticas
  const viejas = await cVers.find({ auto: true }, { projection: { _id: 1 } }).sort({ fecha: -1 }).skip(30).toArray();
  if (viejas.length) await cVers.deleteMany({ _id: { $in: viejas.map((v) => v._id) } });
}

// borra de GridFS los archivos de una publicación borrada que ya nadie usa
async function borrarArchivosSueltos(pub) {
  const ids = [...new Set([...JSON.stringify(pub).matchAll(/\/api\/archivos\/([a-f0-9]{24})/g)].map((m) => m[1]))];
  if (!ids.length) return;
  const resto = JSON.stringify([await cSitio.findOne({ _id: 'principal' }), await cPubs.find().toArray()]);
  for (const id of ids) {
    if (!resto.includes('/api/archivos/' + id)) await bucket.delete(new ObjectId(id)).catch(() => {});
  }
}

// ---------- servidor ----------
const app = express();
app.set('trust proxy', 1); // Render está detrás de un proxy (para https y la IP)
app.disable('x-powered-by');
const api = express.Router();
const json = express.json({ limit: '8mb' });

api.get('/sesion', (req, res) => res.json({ admin: esAdmin(req), almacen: 'MongoDB Atlas' }));

api.post('/entrar', json, (req, res) => {
  if (bloqueado(req.ip)) return res.status(429).json({ error: 'Demasiados intentos, espera un momento' });
  const { correo = '', clave = '' } = req.body || {};
  const correoOk = !ENV.ADMIN_CORREO || String(correo).trim().toLowerCase() === ENV.ADMIN_CORREO.trim().toLowerCase();
  if (!(igual(clave, ENV.ADMIN_PASSWORD) && correoOk)) {
    fallo(req.ip);
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }
  intentos.delete(req.ip);
  cookie(req, res, firmar(Date.now() + DURACION), DURACION);
  res.json({ ok: true });
});

api.post('/salir', (req, res) => { cookie(req, res, '', 0); res.json({ ok: true }); });

api.get('/sitio', async (req, res) => {
  const s = (await cSitio.findOne({ _id: 'principal' })) || {};
  delete s._id;
  res.json(s);
});
api.put('/sitio', soloAdmin, json, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ error: 'Datos no válidos' });
  await versionAutomatica().catch(() => {});
  const { _id, ...datos } = req.body;
  await cSitio.replaceOne({ _id: 'principal' }, datos, { upsert: true });
  res.json({ ok: true });
});

api.get('/publicaciones', async (req, res) => res.json((await cPubs.find().toArray()).map(conId)));
api.post('/publicaciones', soloAdmin, json, async (req, res) => {
  const p = limpiarPub(req.body || {});
  p.creado = Date.now();
  const r = await cPubs.insertOne(p);
  res.json(conId({ _id: r.insertedId, ...p }));
});
api.put('/publicaciones/:id', soloAdmin, json, async (req, res) => {
  const p = await cPubs.findOneAndUpdate({ _id: idDe(req.params.id) }, { $set: limpiarPub(req.body || {}) }, { returnDocument: 'after' });
  if (!p) return res.status(404).json({ error: 'Esa publicación ya no existe' });
  res.json(conId(p));
});
api.delete('/publicaciones/:id', soloAdmin, async (req, res) => {
  const p = await cPubs.findOneAndDelete({ _id: idDe(req.params.id) });
  if (p) await borrarArchivosSueltos(p).catch(() => {});
  res.json({ ok: true });
});

api.get('/versiones', soloAdmin, async (req, res) => {
  const V = await cVers.find({}, { projection: { datos: 0 } }).sort({ fecha: -1 }).limit(60).toArray();
  res.json(V.map(conId));
});
api.post('/versiones', soloAdmin, json, async (req, res) => {
  const s = await cSitio.findOne({ _id: 'principal' });
  if (!s) return res.status(400).json({ error: 'Todavía no hay nada guardado' });
  delete s._id;
  const nombre = String((req.body && req.body.nombre) || '').slice(0, 80) || 'Guardada a mano';
  await cVers.insertOne({ fecha: Date.now(), nombre, auto: false, datos: s });
  res.json({ ok: true });
});
api.get('/versiones/:id', soloAdmin, async (req, res) => {
  const v = await cVers.findOne({ _id: idDe(req.params.id) });
  if (!v) return res.status(404).json({ error: 'No existe esa versión' });
  res.json(conId(v));
});

// subir: el cuerpo es el archivo tal cual; el nombre va en X-Nombre
api.post('/archivos', soloAdmin, (req, res) => {
  const tipo = String(req.headers['content-type'] || 'application/octet-stream').split(';')[0];
  if (!/^(image|video|audio)\/|^application\/pdf$/.test(tipo)) return res.status(400).json({ error: 'Ese tipo de archivo no se puede subir' });
  if (Number(req.headers['content-length']) > MAX_MB * 1048576) return res.status(413).json({ error: `El archivo pesa más de ${MAX_MB} MB` });
  let nombre = 'archivo';
  try { nombre = decodeURIComponent(String(req.headers['x-nombre'] || 'archivo')).slice(0, 120); } catch (e) {}
  const sube = bucket.openUploadStream(nombre, { metadata: { tipo } });
  let bytes = 0;
  req.on('data', (c) => {
    bytes += c.length;
    if (bytes > MAX_MB * 1048576) { req.unpipe(sube); sube.abort().catch(() => {}); res.status(413).json({ error: `El archivo pesa más de ${MAX_MB} MB` }); req.destroy(); }
  });
  req.pipe(sube)
    .on('finish', () => { if (!res.headersSent) res.json({ url: '/api/archivos/' + sube.id, tipo }); })
    .on('error', () => { if (!res.headersSent) res.status(500).json({ error: 'No se pudo subir el archivo' }); });
});

// ver/descargar (con Range, para poder adelantar canciones y videos)
api.get('/archivos/:id', async (req, res) => {
  if (!/^[a-f0-9]{24}$/.test(req.params.id)) return res.sendStatus(404);
  const [f] = await bucket.find({ _id: new ObjectId(req.params.id) }).toArray();
  if (!f) return res.sendStatus(404);
  res.set({ 'Content-Type': (f.metadata && f.metadata.tipo) || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=31536000, immutable' });
  const r = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  let ini = 0, fin = f.length - 1;
  if (r && (r[1] || r[2])) {
    ini = r[1] ? Number(r[1]) : Math.max(0, f.length - Number(r[2]));
    fin = r[1] && r[2] ? Math.min(Number(r[2]), f.length - 1) : f.length - 1;
    if (ini > fin || ini >= f.length) { res.set('Content-Range', `bytes */${f.length}`); return res.sendStatus(416); }
    res.status(206).set('Content-Range', `bytes ${ini}-${fin}/${f.length}`);
  }
  res.set('Content-Length', String(fin - ini + 1));
  bucket.openDownloadStream(f._id, { start: ini, end: fin + 1 }).on('error', () => res.destroy()).pipe(res);
});

api.use((req, res) => res.status(404).json({ error: 'Ruta desconocida' }));
// cualquier error de la base de datos llega aquí
api.use((err, req, res, next) => {
  console.error('✖', req.method, req.originalUrl, err.message);
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Es demasiado grande para guardarlo' });
  res.status(500).json({ error: 'Algo falló. Intenta de nuevo.' });
});
app.use('/api', api);

// la página (mismos tiempos de caché que tenía Firebase Hosting)
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders(res, f) {
    if (/\.(jpe?g|png|gif|webp|avif|svg|mp3|mp4|wav|ogg|m4a|webm|mov|pdf)$/i.test(f)) res.setHeader('Cache-Control', 'public, max-age=604800');
    else res.setHeader('Cache-Control', 'public, max-age=300');
  },
}));

(async () => {
  await cli.connect();
  await db.command({ ping: 1 });
  await cVers.createIndex({ auto: 1, fecha: -1 });
  console.log(`✔ Conectado a MongoDB Atlas (base de datos "${db.databaseName}")`);
  app.listen(PUERTO, () => console.log(`✔ Página lista en http://localhost:${PUERTO}`));
})().catch((e) => {
  console.error('✖ No se pudo conectar a MongoDB Atlas:', e.message);
  console.error('  Revisa MONGODB_URI y MONGODB_PASSWORD, y que tu IP esté permitida en Atlas → Network Access.');
  process.exit(1);
});
