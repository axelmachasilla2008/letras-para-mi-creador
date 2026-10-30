// Arma public/archivos/lista.json con los archivos que tiene la página
// (fotos, canciones, videos…). El Modo Creador los muestra para elegirlos.
// Se ejecuta solo cada vez que arranca el servidor (npm start / npm run local).
const fs = require('node:fs');
const path = require('node:path');

const PUBLICO = path.join(__dirname, 'public');
const CARPETAS = ['archivos', 'img'];
const TIPOS = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4', aac: 'audio/aac', pdf: 'application/pdf' };

const lista = [];
function recorrer(rel) {
  const abs = path.join(PUBLICO, rel);
  if (!fs.existsSync(abs)) return;
  for (const n of fs.readdirSync(abs, { withFileTypes: true })) {
    const r = rel + '/' + n.name;
    if (n.isDirectory()) recorrer(r);
    else {
      const tipo = TIPOS[path.extname(n.name).slice(1).toLowerCase()];
      if (tipo) lista.push({ u: r.split(path.sep).join('/'), tipo, nombre: n.name });
    }
  }
}
CARPETAS.forEach(recorrer);
lista.sort((a, b) => a.u.localeCompare(b.u));
fs.mkdirSync(path.join(PUBLICO, 'archivos'), { recursive: true });
fs.writeFileSync(path.join(PUBLICO, 'archivos', 'lista.json'), JSON.stringify(lista, null, 1));
console.log(`lista de archivos: ${lista.length}`);
