// ============================================================
// letras para mi creador — temas.js
// Ambientes: cada tema trae colores, una textura pixelada (dibujada aquí con
// código), una cabecera animada, partículas en movimiento y criaturas que
// caminan por abajo de la pantalla. Todo se apaga solo si el visitante
// prefiere "reducir movimiento" o desactiva ✨ Efectos en el pie de página.
// Usa E() y ls() de app.js (se llaman cuando la página ya cargó).
// ============================================================

// ---------- dibujos en pixel-art ----------
// Cada letra es un pixel con el color de la paleta; "." es transparente.
function pixelArte(filas, pal, escala = 1) {
  const h = filas.length, w = filas[0].length;
  let r = '';
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = filas[y][x];
      let n = 1;
      if (c !== '.') {
        while (x + n < w && filas[y][x + n] === c) n++;
        r += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${pal[c]}"/>`;
      }
      x += n;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * escala}" height="${h * escala}" shape-rendering="crispEdges">${r}</svg>`;
}
const svgURL = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

// Criaturas (mobs) — dibujadas mirando a la derecha.
// frases: lo que dicen al tocarlas (y de vez en cuando solas).
// modo: 'camina' (normal), 'flota' (vuela un poco arriba), 'salta' (va brincando), 'quieto'
const MOBS = {
  creeper: { nombre: 'Creeper', vel: 26, frases: ['Sssss…', '¡Qué bonita casa tienes…!', 'Ssss… ¿me das un abrazo?', 'Abrazo explosivo 💥', 'No te asustes… ssss'],
    pal: { G: '#4caf3c', g: '#2e7d24', L: '#7ed36b', K: '#111111' }, filas: [
    '.GGLGGgGG.', '.GgGGLGGg.', '.GKKGGKKG.', '.GKKGgKKG.', '.LGGKKGGg.', '.GGKKKKGG.', '.gGKGGKGL.',
    '..GGgGLG..', '..gGGGgG..', '..GLGgGG..', '..GGgGGg..', '.GgG..GgG.', '.GGg..gGG.'] },
  zombie: { nombre: 'Zombie', vel: 22, frases: ['Grrr… cerebros…', 'Uuuurgh…', '¡Ese aldeano es mío!', 'El sol me quema…', '¿Tienes una zanahoria? Grrr'],
    pal: { S: '#5d9c4a', H: '#2d4a1f', K: '#1b1b1b', B: '#2f8fb5', P: '#3b3b9a' }, filas: [
    '..HHHHHH..', '..SSSSSS..', '..SKSSKS..', '..SSSSSS..', '..SSKKSS..', '.BBBBBBBB.', 'SSBBBBBBSS',
    'SSBBBBBBSS', '..BBBBBB..', '..PPPPPP..', '..PP..PP..', '..PP..PP..', '..KK..KK..'] },
  esqueleto: { nombre: 'Esqueleto', vel: 28, frases: ['*clac clac*', '¡Te tengo en la mira! 🏹', 'Me quedé sin flechas…', 'Huesos para tu perrito 🦴', '*sonido de arco*'],
    pal: { W: '#d9d9d0', w: '#a8a8a0', K: '#222222' }, filas: [
    '..WWWWWW..', '..WKWWKW..', '..WWWWWW..', '..WKKKKW..', '...WwwW...', '.W.WWWW.W.', '.W.wWWw.W.',
    '.W.WWWW.W.', '...wWWw...', '...W..W...', '...W..W...', '...W..W...', '..WW..WW..'] },
  arana: { nombre: 'Araña', vel: 40, frases: ['*tsss*', 'Trepo paredes, ¿y tú? 🕷️', 'De día soy inofensiva', '*clic clic*', '¿Quieres hilo?'],
    pal: { B: '#3a2f2a', b: '#241c18', R: '#e0182b' }, filas: [
    'B.b........b.B', '.B.b.BBBB.b.B.', '..BbBBBBBBbB..', '.BbBRBBBBRBbB.', 'B..bBBBBBBb..B', '..b.BbbbbB.b..', '.b....bb....b.'] },
  oveja: { nombre: 'Oveja', vel: 18, frases: ['¡Beee!', 'Sin mi lana tengo frío', '¿Me tiñes de rosa? 🌸', 'Beeee… pasto rico', '¡Bee! No me trasquiles'],
    pal: { W: '#f2f2ee', w: '#d6d6cf', F: '#e9c9b0', K: '#222222', L: '#d8c0a8' }, filas: [
    '..wWWWWWw...', '.WWwWWWWWWFF', '.WWWWWwWWWFK', 'wWWWWWWWWWFF', '.WWwWWWWWW..', '..WWWWWWw...', '..LL....LL..', '..LL....LL..'] },
  cerdo: { nombre: 'Cerdo', vel: 20, frases: ['¡Oink!', '¡Oink oink! 🥕', 'No me subas con una caña de zanahoria', 'Oink… ¿y la comida?', '¡Oiiink!'],
    pal: { P: '#f0a5b0', p: '#d9849a', K: '#222222', N: '#e48a9d' }, filas: [
    '..PPPPPPP...', '.PPPPPPPPPPP', 'pPPPPPPPPKPP', '.PPPPPPPPPNN', '.PPPPPPPPPNN', '..PPPPPPPP..', '..pp....pp..', '..pp....pp..'] },
  vaca: { nombre: 'Vaca', vel: 16, frases: ['¡Muuu!', '¿Quieres leche? 🥛', 'Muuu… aquí pastando', 'Mu.', '¡Muuuu! Trae una cubeta'],
    pal: { B: '#4a3020', W: '#f0eee8', K: '#111111', N: '#d9b8a0', H: '#cfc7b0' }, filas: [
    '.........H..', '.BBWWBBBBBBH', 'BBBWWBBBWBKB', 'BWWBBBBBBBNN', 'BWWBBBWWBBNN', '.BBBBBWWBB..', '..BB....BB..', '..BW....BW..'] },
  gallina: { nombre: 'Gallina', vel: 24, frases: ['¡Cloc cloc!', 'Puse un huevo 🥚', '¡Cloc! ¿Y mis semillas?', 'Cloc… cloc…', '¡Cloooc!'],
    pal: { W: '#f6f6f2', w: '#d8d8d0', R: '#d8202a', Y: '#f0b030', K: '#222222' }, filas: [
    '.....RR.', '....WWWY', '....WKWY', '.ww.WWWR', 'wWWWWWW.', 'wWWWWWW.', '.wWWWW..', '..Y..Y..', '..Y..Y..'] },
  // --- Nether ---
  piglin: { nombre: 'Piglin', vel: 24, frases: ['¡Oro! ¿Me das oro? ✨', 'Hmph.', '¿Eso es oro?', 'Grrr… ¿y tu armadura de oro?', '*olfatea* huele a lingote'],
    pal: { P: '#e8a090', p: '#c97a6c', N: '#f0b8a8', K: '#2a1a14', G: '#f2c230', B: '#6b4a2a', L: '#3a2a1a' }, filas: [
    '.PPPPPPPP.', '.PpPPPPpP.', '.PKPPPPKP.', '.PPNNNNPP.', 'pPPNKKNPPp', '.PPPPPPPP.', '..GBBBBG..',
    '.PBBBBBBP.', '.PBBGGBBP.', '..BBBBBB..', '..LL..LL..', '..LL..LL..', '..KK..KK..'] },
  strider: { nombre: 'Strider', vel: 14, frases: ['Brrr… tengo frío', 'Me encanta nadar en lava 🔥', '*brrr brrr*', '¿Me ensillas?'],
    pal: { R: '#a8323a', r: '#7d2229', K: '#1a0a0a', W: '#e8d8c8' }, filas: [
    '.W..W..W..W.', '.RRRRRRRRRR.', 'RRrRRRRRRrRR', 'RRKKRRRRKKRR', 'RRRRRRRRRRRR', '.RrRRRRRRrR.', '..RR....RR..', '..RR....RR..', '..rr....rr..', '..rr....rr..'] },
  magma: { nombre: 'Cubo de magma', vel: 30, modo: 'salta', frases: ['*boing*', '¡Splat!', 'Estoy que ardo 🔥', '*boing boing*'],
    pal: { M: '#4a1408', O: '#ff8a00', Y: '#ffd040', K: '#1a0602' }, filas: [
    'MMOMMMMOMM', 'MOOOMMOOOM', 'MMMMMMMMMM', 'MYYMMMMYYM', 'MKYMMMMKYM', 'MMMMMMMMMM', 'MOOMMMMOOM', 'MMMOOOOMMM', 'MMMMMMMMMM'] },
  ghast: { nombre: 'Ghast', vel: 18, modo: 'flota', frases: ['*buaaa*', '¡Bola de fuego va! 🔥', '*llanto lejano*', 'Nadie me entiende… buaa'],
    pal: { W: '#f0f0f0', w: '#c8c8c8', K: '#3a3a3a', T: '#9ab4c8' }, filas: [
    'WWWWWWWWWWWW', 'WwWWWWWWWWwW', 'WKKWWWWWWKKW', 'WTKWWWWWWTKW', 'WTWWWWWWWTWW', 'WWWWKKKKWWWW', 'WWWWKKKKWWWW', 'WwWWWWWWWWwW',
    'WWWWWWWWWWWW', '.W.W.W.W.W.W', '.W.W...W.W..', '.W.....W....'] },
  // --- The End ---
  enderman: { nombre: 'Enderman', vel: 20, frases: ['No me mires a los ojos 👀', '*se lleva un bloque*', 'Hrrrm…', '¡Agua no, por favor!', '*vwoop*'],
    pal: { K: '#111111', k: '#262626', P: '#d77bff' }, filas: [
    '.KKKKKK.', '.KKKKKK.', '.PPKKPP.', '.KKKKKK.', '.KKKKKK.', '..kKKk..', '.KKKKKK.', 'KkKKKKkK', 'KkKKKKkK', 'K.KKKK.K',
    'K.KKKK.K', 'K.KKKK.K', 'K..KK..K', '...KK...', '..K..K..', '..K..K..', '..K..K..', '..K..K..', '..K..K..', '..K..K..'] },
  endermite: { nombre: 'Endermite', vel: 34, frases: ['*kss kss*', 'Soy chiquito pero molesto', '*kss*'],
    pal: { P: '#4a2a5a', p: '#7a5a8a' }, filas: ['..pPPPPp..', '.PPPPPPPP.', 'PpPPPPPPpP', '.P.P..P.P.'] },
  shulker: { nombre: 'Shulker', vel: 0, frases: ['*clac*', '¡Te hago flotar! 🫧', 'Me escondo en mi caja', '*se abre… y se cierra*'],
    pal: { S: '#9a6a9a', s: '#7a4f7a', H: '#e8e0a0', K: '#2a1a2a' }, filas: [
    'SSSSSSSSSS', 'SssssssssS', 'SSSSSSSSSS', '.HHHHHHHH.', '.HKHHHHKH.', '.HHHHHHHH.', 'SSSSSSSSSS', 'SssssssssS', 'SSSSSSSSSS', 'SSSSSSSSSS'] },
  // --- Enjambre, Panal y Overworld ---
  abeja: { nombre: 'Abeja', vel: 32, modo: 'flota', frases: ['¡Bzzz!', 'Polen para todos 🌼', '¿Ya escuchaste a Enjambre? 🎶', 'Bzzz… miel fresca 🍯', 'No me molestes la colmena'],
    pal: { Y: '#f2c230', K: '#2b2118', W: '#eef8ff', w: '#c8dcf0' }, filas: [
    '...WW.WW....', '...WwWwW....', '.YYKKYYKKYY.', 'YYYKKYYKKYKY', 'YKYKKYYKKYYY', '.YYKKYYKKYY.', '..K..K..K...'] },
  aldeano: { nombre: 'Aldeano', vel: 16, frases: ['Hrmm.', '¿Comerciamos? 💎', 'Hmm hmm.', '¡Esmeraldas! 💚', 'Hrrm… ¿y mi cama?'],
    pal: { S: '#c8946a', N: '#b07848', B: '#4a3020', G: '#2f8a3a', R: '#6b4a2a', r: '#57391f', K: '#2a1a10' }, filas: [
    '.SSSSSS.', '.SSSSSS.', '.BBBBBB.', '.SGSSGS.', '.SSNNSS.', '..SNNS..', '..SSSS..', '.RRRRRR.',
    'RRSSSSRR', 'RRSSSSRR', '.RRRRRR.', '.RrRRrR.', '.RRRRRR.', '.RRRRRR.', '..rr.rr.', '..KK.KK.'] },
  gato: { nombre: 'Gato', vel: 30, frases: ['¡Miau!', '*ronroneo*', 'Los creepers me tienen miedo 😼', 'Miau… ¿pescado? 🐟', '*se estira*'],
    pal: { O: '#e8a040', o: '#c07a20', W: '#f8f0e0', K: '#2a1a10', G: '#7ac043' }, filas: [
    '........O.O.', '........OOO.', '.O.....OGOGO', '..O....OOKOO', '..OOOOOOOOO.', '..OOoOoOoOO.', '...OO....OO.', '...WW....WW.'] },
  zorro: { nombre: 'Zorro', vel: 34, frases: ['*yip*', 'Me llevo esa baya 🍓', 'Zzz… *ronquido de zorro*', '*yip yip*'],
    pal: { O: '#e07a2a', W: '#f8f0e0', K: '#2a1a10' }, filas: [
    '.........O.O', '........OOOO', '.......OOKOO', 'WOO.OOOOOOWK', 'WWOOOOOOOWW.', '..OOOOOOOO..', '..KK....KK..', '..KK....KK..'] },
  lobo: { nombre: 'Lobo', vel: 30, frases: ['¡Guau!', '¿Me das un hueso? 🦴', 'Auuuu 🌙', '*mueve la cola*'],
    pal: { G: '#d8d4cc', g: '#a8a49c', K: '#2a2a2a', R: '#d8202a' }, filas: [
    '.........G.G', '.........GGG', 'G.......GGKG', '.G.GGGGGRGGK', '..GGGGGGRgg.', '..GgGGGGGG..', '..GG....GG..', '..gg....gg..'] },
  ajolote: { nombre: 'Ajolote', vel: 14, frases: ['*blub*', '¡Hola! 💗', 'Hago el muertito', '*blub blub*'],
    pal: { P: '#ff9ccf', p: '#e070a8', K: '#2a1a20', R: '#d84a8a' }, filas: [
    '........R.R.', '........RPR.', 'P.....PPPPPR', 'PPPPPPPPKPP.', '.pPPPPPPPPP.', '..p..p..p...'] },
};

// Sprites pequeños para las partículas
const SPRITES = {
  abeja: pixelArte(['..WW.WW.', '..WWWWW.', '.YKYKYK.', 'YYKYKYKK', '.YKYKYK.', '..K..K..'], { W: '#e8f4ff', Y: '#f2c230', K: '#2b2118' }),
  murcielago: pixelArte(['B........B', 'BB.BBBB.BB', '.BBBKKBBB.', '..BBBBBB..', '....BB....'], { B: '#3a3030', K: '#ffcc33' }),
  murcielago2: pixelArte(['..........', '...BBBB...', 'BBBBKKBBBB', 'B.BBBBBB.B', '....BB....'], { B: '#3a3030', K: '#ffcc33' }),
  corazon: pixelArte(['.RR.RR.', 'RRRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'], { R: '#ff4d7d' }),
};
const imagenes = {};
function imagen(k) {
  if (!imagenes[k]) { imagenes[k] = new Image(); imagenes[k].src = svgURL(SPRITES[k]); }
  return imagenes[k];
}

// ---------- texturas pixeladas (se dibujan una vez y se guardan) ----------
function azar(semilla) {
  return () => {
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const puntos = (cols, n) => (x, r, t) => { for (let i = 0; i < n; i++) { x.fillStyle = cols[i % cols.length]; x.fillRect(Math.floor(r() * t), Math.floor(r() * t), 1, 1); } };
const grietas = (col, n) => (x, r, t) => {
  x.fillStyle = col;
  for (let i = 0; i < n; i++) { let px = Math.floor(r() * t), py = Math.floor(r() * t); for (let k = 0; k < 3; k++) { x.fillRect(px % t, py % t, 1, 1); px++; py += r() < 0.5 ? 1 : 0; } }
};
const MINERALES = [['#2b2b2b', '#1a1a1a'], ['#d8af93', '#b98d70'], ['#fcee4b', '#e3c400'], ['#5ce1e6', '#2ab7bf'], ['#e0182b', '#a50f1e'], ['#3f6fd8', '#2a4fa8']];
const minerales = (n) => (x, r, t) => {
  for (let i = 0; i < n; i++) {
    const [a, b] = MINERALES[i % MINERALES.length], px = Math.floor(r() * (t - 3)), py = Math.floor(r() * (t - 3));
    [[0, 0, a], [1, 0, b], [1, 1, a], [2, 1, a], [0, 2, b], [2, 2, a]].forEach(([dx, dy, c]) => { if (r() < 0.8) { x.fillStyle = c; x.fillRect(px + dx, py + dy, 1, 1); } });
  }
};
const panal = (linea, brillo) => (x, r, t) => {
  // celdas como ladrillos desplazados (parecen hexágonos en pixel-art)
  for (let y = 0; y < t; y++) for (let i = 0; i < t; i++) {
    const banda = Math.floor(y / 4) % 2, borde = y % 4 === 0 || (i + banda * 4) % 8 === 0;
    if (borde) { x.fillStyle = linea; x.fillRect(i, y, 1, 1); } else if (y % 4 === 1 && (i + banda * 4) % 8 === 1) { x.fillStyle = brillo; x.fillRect(i, y, 2, 1); }
  }
};
const purpur = (x, r, t) => {
  for (let y = 0; y < t; y++) for (let i = 0; i < t; i++) if (y % 8 === 0 || i % 8 === 0) { x.fillStyle = '#7d4f80'; x.fillRect(i, y, 1, 1); } else if (y % 8 === 1 && i % 8 === 1) { x.fillStyle = '#d1a6d1'; x.fillRect(i, y, 2, 1); }
};

const TEX = {
  pasto: { tam: 16, base: [['#7cbd52', 40], ['#6aad44', 28], ['#8ccc5f', 20], ['#5e9b3b', 12]], extra: puntos(['#ffd84d', '#ff8fc7', '#ffffff'], 3) },
  prado: { tam: 16, base: [['#a6dd7a', 40], ['#98d26c', 30], ['#b3e68a', 20], ['#8cc95f', 10]], extra: puntos(['#ff8fc7', '#ffffff', '#ffd84d', '#b48cff'], 6) },
  netherrack: { tam: 16, base: [['#6b2424', 40], ['#7d2b2b', 25], ['#5a1d1d', 20], ['#8f3a33', 10], ['#4a1616', 5]], extra: grietas('#3d1010', 4) },
  netherOscuro: { tam: 16, base: [['#4a1616', 40], ['#5a1d1d', 30], ['#3d1010', 20], ['#6b2424', 10]], extra: grietas('#2a0808', 5) },
  vacio: { tam: 32, base: [['#1b1028', 86], ['#22143a', 12], ['#e0aaff', 1.2], ['#ffffff', 0.8]] },
  purpur: { tam: 16, base: [['#a77ba7', 50], ['#b084b0', 30], ['#9a6e9a', 20]], extra: purpur },
  colmena: { tam: 16, base: [['#1c160b', 60], ['#231b0d', 30], ['#2b210f', 10]], extra: panal('#4a3a10', '#7a5f18') },
  colmenaLuz: { tam: 16, base: [['#f2b51c', 60], ['#f5c03a', 30], ['#e8a812', 10]], extra: panal('#c98a0a', '#ffd84d') },
  piedra: { tam: 32, base: [['#7f7f7f', 35], ['#737373', 30], ['#8a8a8a', 20], ['#686868', 15]], extra: minerales(6) },
  pizarra: { tam: 16, base: [['#3f3f44', 40], ['#36363b', 30], ['#4a4a50', 20], ['#2c2c30', 10]], extra: grietas('#26262a', 5) },
  musgo: { tam: 16, base: [['#3c4a3c', 35], ['#2f3a2f', 30], ['#4a5a46', 20], ['#263026', 15]], extra: puntos(['#5a7a3a', '#6b8f45', '#4f6a33'], 9) },
  papel: { tam: 16, base: [['#fbf6ea', 50], ['#f6f0e0', 30], ['#fffaf0', 20]] },
  noche: { tam: 16, base: [['#1d1b22', 50], ['#22202a', 30], ['#19171e', 20]] },
};
const cacheTex = {};
function textura(id) {
  if (!id || !TEX[id]) return '';
  if (cacheTex[id]) return cacheTex[id];
  const def = TEX[id], t = def.tam, c = document.createElement('canvas');
  c.width = c.height = t;
  const x = c.getContext('2d'), r = azar(id.length * 97 + t);
  const total = def.base.reduce((s, b) => s + b[1], 0);
  for (let i = 0; i < t; i++) for (let j = 0; j < t; j++) {
    let v = r() * total;
    const b = def.base.find((b) => (v -= b[1]) < 0) || def.base[0];
    x.fillStyle = b[0];
    x.fillRect(i, j, 1, 1);
  }
  if (def.extra) def.extra(x, r, t);
  return (cacheTex[id] = c.toDataURL());
}

// ---------- los temas ----------
// franja: colores de la franja de arriba de la cabecera [sombra, c1, c2, c3]
const AMBIENTES = {
  panal: { nombre: 'Panal', icono: '🍯', descripcion: 'El de siempre: miel y lunares',
    colores: { acento: '#f7d34a', marron: '#5a3825', fondo: '#fff1a8', papel: '#fbf4dc', texto: '#3b2416' },
    textura: '', muestra: 'colmenaLuz', particulas: [{ tipo: 'enjambre', n: 5 }], criaturas: ['abeja', 'gato', 'aldeano'] },
  overworld: { nombre: 'Overworld', icono: '🌳', descripcion: 'Pasto, cielo azul, nubes y hojas',
    colores: { acento: '#8fd14f', marron: '#5b3a1e', fondo: '#8ccc5f', papel: '#f4f9e8', texto: '#2a1d0f' },
    textura: 'pasto', brillo: '#8fd14f66',
    particulas: [{ tipo: 'cae', n: 16, colores: ['#5e9b3b', '#7cbd52', '#a6dd7a', '#4a8a2a'], tam: [3, 6] }, { tipo: 'mariposas', n: 4 }],
    criaturas: ['gallina', 'oveja', 'cerdo', 'lobo', 'aldeano'] },
  nether: { nombre: 'Nether', icono: '🔥', descripcion: 'Netherrack, lava y brasas que suben',
    colores: { acento: '#ff8a2a', marron: '#240606', fondo: '#5a1d1d', papel: '#3b1414', texto: '#ffe6d5' },
    textura: 'netherrack', cabecera: 'netherOscuro', brillo: '#ff6a0099', franja: ['#4a0d0d', '#7a1616', '#8c1d1d', '#a32626'],
    particulas: [{ tipo: 'sube', n: 46, colores: ['#ff6a00', '#ffb300', '#ff3d00', '#ffe082'], tam: [2, 5], brillo: true }, { tipo: 'cae', n: 14, colores: ['#5b5b5b', '#7a7a7a', '#444444'], tam: [2, 3], vel: 0.6 }],
    criaturas: ['piglin', 'strider', 'magma', 'ghast'] },
  end: { nombre: 'The End', icono: '🌌', descripcion: 'Vacío, purpur y partículas ender',
    colores: { acento: '#d9b3ff', marron: '#120a1f', fondo: '#1b1028', papel: '#2a1b3d', texto: '#f3e9ff' },
    textura: 'vacio', cabecera: 'purpur', brillo: '#c77dff99', franja: ['#a8a36a', '#dbd99b', '#d0cd8e', '#e6e3a8'],
    particulas: [{ tipo: 'sube', n: 42, colores: ['#c77dff', '#9d4edd', '#e0aaff', '#7b2cbf'], tam: [2, 4], brillo: true, espiral: true, vel: 0.6 }],
    criaturas: ['enderman', 'endermite', 'shulker'] },
  enjambre: { nombre: 'Enjambre', icono: '🐝', descripcion: 'Concierto: colmena, luces y abejas',
    colores: { acento: '#ffd400', marron: '#000000', fondo: '#121212', papel: '#1e1a12', texto: '#fff6cc' },
    textura: 'colmena', cabecera: 'colmena', brillo: '#ffd40099', franja: ['#8a6a00', '#f2b51c', '#ffd84d', '#e8a812'],
    particulas: [{ tipo: 'enjambre', n: 14 }, { tipo: 'flota', n: 22, colores: ['#ffd400', '#fff3a0'], tam: [1, 3], brillo: true }],
    criaturas: ['abeja', 'abeja', 'aldeano', 'gato'] },
  minas: { nombre: 'Minas', icono: '⛏️', descripcion: 'Cueva de piedra, minerales y antorchas',
    colores: { acento: '#f2c94c', marron: '#141416', fondo: '#4a4a4a', papel: '#2c2c30', texto: '#ecebe6' },
    textura: 'piedra', cabecera: 'pizarra', brillo: '#f2c94c66', franja: ['#4a4a4a', '#6a6a6a', '#7f7f7f', '#8a8a8a'],
    particulas: [{ tipo: 'flota', n: 40, colores: ['#d9d4c7', '#bfb8a5', '#fff3c4'], tam: [1, 2], lento: true }],
    criaturas: ['arana', 'esqueleto', 'creeper', 'ajolote'] },
  hostiles: { nombre: 'Mobs hostiles', icono: '🧟', descripcion: 'Noche, niebla, murciélagos y creepers',
    colores: { acento: '#5ee04a', marron: '#0c1410', fondo: '#263026', papel: '#1a221c', texto: '#e3f5dc' },
    textura: 'musgo', brillo: '#5ee04a77', franja: ['#1c2a1a', '#2f4a2a', '#3a5a32', '#466a3a'],
    particulas: [{ tipo: 'murcielagos', n: 4 }, { tipo: 'flota', n: 14, colores: ['#5ee04a', '#9dff8a'], tam: [2, 3], brillo: true }],
    criaturas: ['creeper', 'zombie', 'esqueleto', 'arana', 'enderman'] },
  pasivos: { nombre: 'Mobs pasivos', icono: '🐑', descripcion: 'Pradera con ovejas, vacas y corazones',
    colores: { acento: '#ffb3c7', marron: '#6b4a2a', fondo: '#b3e68a', papel: '#fffdf5', texto: '#3a2a18' },
    textura: 'prado', brillo: '#ff8fb066',
    particulas: [{ tipo: 'sube', n: 10, forma: 'corazon', vel: 0.5 }, { tipo: 'mariposas', n: 6 }],
    criaturas: ['oveja', 'cerdo', 'vaca', 'gallina', 'lobo', 'gato'] },
  claro: { nombre: 'Claro', icono: '☀️', descripcion: 'Papel limpio y destellos suaves',
    colores: { acento: '#f7d34a', marron: '#5a3825', fondo: '#f6f0e0', papel: '#fffdf7', texto: '#2b1d12' },
    textura: 'papel', particulas: [{ tipo: 'flota', n: 22, colores: ['#f7d34a', '#ffe9a0'], tam: [2, 3], destello: true }], criaturas: ['aldeano', 'gato', 'gallina'] },
  oscuro: { nombre: 'Oscuro', icono: '🌙', descripcion: 'Noche tranquila con luciérnagas',
    colores: { acento: '#f7d34a', marron: '#0d0b10', fondo: '#1d1b22', papel: '#26232d', texto: '#f2ecdf' },
    textura: 'noche', brillo: '#f7d34a55', franja: ['#1d2a14', '#2f4a22', '#3a5a2a', '#466a32'],
    particulas: [{ tipo: 'flota', n: 30, colores: ['#d4ff6a', '#f7d34a'], tam: [2, 3], brillo: true }], criaturas: ['zorro', 'lobo', 'gato'] },
};

// ---------- partículas (un lienzo detrás del contenido) ----------
const Particulas = (() => {
  let cv, cx, grupos = [], raf = 0, ant = 0, W = 0, H = 0;
  const al = (a, b) => a + Math.random() * (b - a);
  const elegir = (L) => L[Math.floor(Math.random() * L.length)];

  function medir() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth;
    H = innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.imageSmoothingEnabled = false;
  }
  function lienzo() {
    if (cv) return;
    cv = document.createElement('canvas');
    cv.id = 'particulas';
    cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
    cx = cv.getContext('2d');
    medir();
    addEventListener('resize', medir);
  }

  function crear(d, inicial) {
    const p = { x: al(0, W), y: al(0, H), t: al(0, 100), fase: al(0, 6.28), s: d.tam ? al(d.tam[0], d.tam[1]) : 3, col: d.colores ? elegir(d.colores) : '#fff' };
    const v = d.vel || 1;
    if (d.tipo === 'cae') { if (!inicial) p.y = -10; p.vy = al(18, 45) * v; p.amp = al(10, 30); }
    if (d.tipo === 'sube') { if (!inicial) p.y = H + 10; p.vy = -al(20, 55) * v; p.amp = al(4, 18); p.max = al(4, 9); p.vida = inicial ? al(0, p.max) : 0; }
    if (d.tipo === 'flota') { const k = d.lento ? 4 : 10; p.vx = al(-k, k); p.vy = al(-k, k); }
    if (d.tipo === 'enjambre') { p.ox = al(-110, 110); p.oy = al(-60, 60); p.r = al(15, 55); p.vx = 0; }
    if (d.tipo === 'murcielagos') { const izq = inicial ? Math.random() < 0.5 : Math.random() < 0.5; if (!inicial) p.x = izq ? -30 : W + 30; p.y = al(30, H * 0.6); p.vx = (izq ? 1 : -1) * al(60, 110); }
    if (d.tipo === 'mariposas') { p.vx = al(-25, 25); p.vy = al(-15, 15); p.col = elegir(d.colores || ['#ff8fc7', '#ffe066', '#8fd3ff', '#ffffff', '#b48cff']); p.s = al(3, 5); }
    return p;
  }

  // mueve la partícula; devuelve true si ya terminó y hay que crear otra
  function mover(d, p, dt, ahora) {
    p.t += dt;
    if (d.tipo === 'cae') { p.y += p.vy * dt; p.x += Math.sin(p.t * 1.5 + p.fase) * p.amp * dt; return p.y > H + 10; }
    if (d.tipo === 'sube') {
      p.y += p.vy * dt;
      p.x += Math.sin(p.t * 1.7 + p.fase) * p.amp * dt + (d.espiral ? Math.cos(p.t * 2.2 + p.fase) * 28 * dt : 0);
      p.vida += dt;
      return p.vida > p.max || p.y < -10;
    }
    if (d.tipo === 'flota' || d.tipo === 'mariposas') {
      const k = d.tipo === 'mariposas' ? 40 : d.lento ? 6 : 14;
      p.vx = Math.max(-k, Math.min(k, p.vx + al(-k, k) * dt * 2));
      p.vy = Math.max(-k, Math.min(k, p.vy + al(-k, k) * dt * 2));
      p.x = (p.x + p.vx * dt + W) % W;
      p.y = (p.y + p.vy * dt + H) % H;
      return false;
    }
    if (d.tipo === 'enjambre') {
      // el enjambre entero da vueltas por la pantalla y cada abeja gira alrededor
      const cxS = W * (0.5 + 0.38 * Math.sin(ahora / 9000)), cyS = H * (0.45 + 0.28 * Math.sin(ahora / 6500 + 1));
      const tx = cxS + p.ox + Math.cos(p.t * 2.4 + p.fase) * p.r, ty = cyS + p.oy + Math.sin(p.t * 3.1 + p.fase) * p.r * 0.6;
      const nx = p.x + (tx - p.x) * Math.min(1, dt * 2.2);
      p.vx = nx - p.x;
      p.x = nx;
      p.y += (ty - p.y) * Math.min(1, dt * 2.2);
      return false;
    }
    if (d.tipo === 'murcielagos') { p.x += p.vx * dt; p.y += Math.sin(p.t * 3 + p.fase) * 30 * dt; return p.x < -40 || p.x > W + 40; }
    return false;
  }

  function dibujar(d, p) {
    if (d.tipo === 'enjambre' || d.tipo === 'murcielagos') {
      const img = d.tipo === 'enjambre' ? imagen('abeja') : imagen(Math.sin(p.t * 18) > 0 ? 'murcielago' : 'murcielago2');
      if (!img.complete) return;
      const w = d.tipo === 'enjambre' ? 16 : 30, h = d.tipo === 'enjambre' ? 12 : 15;
      const izq = (d.tipo === 'enjambre' ? p.vx : p.vx) < 0;
      cx.save();
      cx.translate(p.x, p.y + (d.tipo === 'enjambre' ? Math.sin(p.t * 20) * 1.5 : 0));
      if (izq) cx.scale(-1, 1);
      cx.drawImage(img, -w / 2, -h / 2, w, h);
      cx.restore();
      return;
    }
    if (d.forma === 'corazon') {
      const img = imagen('corazon');
      if (!img.complete) return;
      cx.globalAlpha = Math.max(0, 1 - p.vida / p.max);
      cx.drawImage(img, p.x, p.y, 14, 12);
      cx.globalAlpha = 1;
      return;
    }
    if (d.tipo === 'mariposas') {
      const a = Math.abs(Math.sin(p.t * 12)) * p.s + 1;
      cx.fillStyle = p.col;
      cx.fillRect(p.x - a, p.y, a, p.s);
      cx.fillRect(p.x + 1, p.y, a, p.s);
      cx.fillStyle = '#2b2118';
      cx.fillRect(p.x, p.y - 1, 1, p.s + 2);
      return;
    }
    let alfa = 1;
    if (d.tipo === 'sube') alfa = Math.max(0, 1 - p.vida / p.max);
    if (d.tipo === 'flota') alfa = d.destello ? Math.max(0, Math.sin(p.t * 2 + p.fase)) : 0.45 + 0.55 * Math.abs(Math.sin(p.t * 1.3 + p.fase));
    if (d.tipo === 'cae') alfa = 0.9;
    cx.fillStyle = p.col;
    if (d.brillo) { cx.globalAlpha = alfa * 0.22; cx.fillRect(p.x - p.s, p.y - p.s, p.s * 3, p.s * 3); }
    cx.globalAlpha = alfa;
    if (d.destello) { cx.fillRect(p.x - p.s, p.y, p.s * 3, 1); cx.fillRect(p.x, p.y - p.s, 1, p.s * 3); }
    else cx.fillRect(p.x, p.y, p.s, p.s);
    cx.globalAlpha = 1;
  }

  function paso(ahora) {
    const dt = Math.min(0.05, (ahora - ant) / 1000);
    ant = ahora;
    cx.clearRect(0, 0, W, H);
    for (const g of grupos) {
      for (let i = 0; i < g.L.length; i++) {
        if (mover(g.d, g.L[i], dt, ahora)) g.L[i] = crear(g.d, false);
        dibujar(g.d, g.L[i]);
      }
    }
    raf = requestAnimationFrame(paso);
  }

  function poner(defs) {
    lienzo();
    cancelAnimationFrame(raf);
    raf = 0;
    cx.clearRect(0, 0, W, H);
    grupos = [];
    if (!defs || !defs.length) return;
    const menos = W < 700 ? 0.5 : 1;
    grupos = defs.map((d) => ({ d, L: Array.from({ length: Math.max(1, Math.round(d.n * menos)) }, () => crear(d, true)) }));
    ant = performance.now();
    raf = requestAnimationFrame(paso);
  }
  return { poner };
})();

// ---------- criaturas que caminan por abajo ----------
const Criaturas = (() => {
  let capa, lista = [], raf = 0, ant = 0, charla = 0;

  function paso(ahora) {
    const dt = Math.min(0.05, (ahora - ant) / 1000);
    ant = ahora;
    for (const c of lista) {
      const m = MOBS[c.tipo];
      if (c.quieta > 0 || !c.vel) c.quieta -= dt;
      else {
        c.x += c.dir * c.vel * dt;
        if (c.x < -20) c.dir = 1;
        if (c.x > innerWidth - c.ancho + 20) c.dir = -1;
        // de vez en cuando se detienen o se dan la vuelta
        if (Math.random() < dt * 0.25) c.quieta = 1 + Math.random() * 3;
        else if (Math.random() < dt * 0.1) c.dir *= -1;
      }
      c.t += dt;
      // los que vuelan suben y bajan; el cubo de magma va brincando
      let y = 0;
      if (m.modo === 'flota') y = 46 + Math.sin(c.t * 2 + c.fase) * 12;
      if (m.modo === 'salta' && c.quieta <= 0) y = Math.abs(Math.sin(c.t * 4 + c.fase)) * 26;
      c.el.classList.toggle('camina', c.quieta <= 0 && !m.modo && c.vel > 0);
      c.el.style.transform = `translate(${c.x}px, ${-y}px)`;
      c.el.style.setProperty('--d', c.dir);
    }
    // cada tanto, alguno dice algo solo
    charla -= dt;
    if (charla <= 0 && lista.length) {
      charla = 9 + Math.random() * 10;
      decir(lista[Math.floor(Math.random() * lista.length)]);
    }
    raf = requestAnimationFrame(paso);
  }

  function decir(c) {
    const F = MOBS[c.tipo].frases;
    let f = F[Math.floor(Math.random() * F.length)];
    if (F.length > 1 && f === c.ultima) f = F[(F.indexOf(f) + 1) % F.length];
    c.ultima = f;
    c.el.querySelectorAll('.dice').forEach((x) => x.remove());
    const b = E('span', { className: 'dice' });
    b.textContent = f;
    // el globo no se sale de la pantalla
    if (c.x < 80) b.classList.add('der');
    if (c.x > innerWidth - 160) b.classList.add('izq');
    c.el.append(b);
    setTimeout(() => b.remove(), 2600);
  }

  function saludar(c) {
    decir(c);
    c.quieta = 2;
    c.el.classList.remove('salta', 'tele');
    void c.el.offsetWidth;
    if (c.tipo === 'creeper') {
      // el creeper se infla, explota en humo y aparece en otro lado
      c.el.classList.add('explota');
      setTimeout(() => { c.el.classList.remove('explota'); c.x = Math.random() * (innerWidth - 60); }, 1600);
    } else if (c.tipo === 'enderman') {
      // el enderman se teletransporta
      c.el.classList.add('tele');
      setTimeout(() => { c.x = Math.random() * (innerWidth - 60); }, 450);
      setTimeout(() => c.el.classList.remove('tele'), 900);
    } else c.el.classList.add('salta');
  }

  function poner(tipos) {
    if (!capa) {
      capa = E('div', { className: 'criaturas' });
      capa.setAttribute('aria-hidden', 'true');
      document.body.append(capa);
    }
    cancelAnimationFrame(raf);
    raf = 0;
    capa.innerHTML = '';
    lista = [];
    if (!tipos || !tipos.length) return;
    const n = innerWidth < 700 ? 2 : Math.min(5, tipos.length);
    // se reparten a lo ancho para que no salgan amontonados
    const orden = tipos.slice().sort(() => Math.random() - 0.5);
    charla = 4;
    for (let i = 0; i < n; i++) {
      const tipo = orden[i % orden.length], m = MOBS[tipo];
      const el = E('div', { className: 'criatura c-' + tipo, title: m.nombre }, pixelArte(m.filas, m.pal, 4));
      const tramo = (innerWidth - 80) / n;
      const c = { el, tipo, x: tramo * i + Math.random() * tramo * 0.8, dir: Math.random() < 0.5 ? 1 : -1, vel: m.vel * (0.7 + Math.random() * 0.6), quieta: Math.random() * 2, ancho: m.filas[0].length * 4, t: 0, fase: Math.random() * 6 };
      el.onclick = () => saludar(c);
      capa.append(el);
      lista.push(c);
    }
    ant = performance.now();
    raf = requestAnimationFrame(paso);
  }
  return { poner };
})();

// ---------- AuronPlay en la cabecera ----------
// Personaje en pixel-art (homenaje de fan) que dice frases en un globo:
// una cada 11 segundos y otra cada vez que lo tocan. Las frases se cambian
// desde el Modo Creador (⚙ junto al personaje).
const AURON = { pal: { H: '#2a1a10', S: '#e8b890', s: '#c89870', K: '#1a1a1a', B: '#4a3020', D: '#1c1c1c', W: '#f2f2f2', J: '#2a3a5a' }, filas: [
  '...HHHHHH...', '..HHHHHHHH..', '..HSSSSSSH..', '..SKSSSSKS..', '..SSSSSSSS..', '..SBSssSBS..', '..SBBBBBBS..', '...SBBBBS...', '..DDDDDDDD..',
  '.DDDDWWDDDD.', 'DDDDDWWDDDDD', 'DSDDDDDDDDSD', 'DSDDDDDDDDSD', '.S.DDDDDD.S.', '...JJJJJJ...', '...JJ..JJ...', '...JJ..JJ...', '...KK..KK...'] };
const SALUDO_CAMEO = '¿Pero qué pasa, chavales? Todo bien, todo correcto, y yo que me alegro.';
const FRASES_CAMEO = ['¡Muy buenas, Escuadrón Salchichón!', 'Pero bueno… ¿qué es esto?', '¡Esto es increíble, chavales!', '¿Alguien ha visto a Biyín?', 'Vamos a ver qué tenemos por aquí…'];

// El personaje se puede arrastrar a cualquier parte de la página.
// Si lo mueve la creadora (Modo Creador), su lugar se guarda para todos;
// si lo mueve un visitante, solo cambia en su pantalla.
// Sin lugar guardado, aparece abajo a la derecha de la cabecera.
const Cameo = (() => {
  let reloj = 0, primera = 0, clave = '', i = 0, saludoDicho = false, conf = {};
  const el = () => document.getElementById('cameo');

  function decir(txt) {
    const e = el(), globo = e && $('.cameo-dice', e);
    if (!globo) return;
    globo.textContent = txt;
    globo.hidden = false;
    e.classList.remove('habla');
    void e.offsetWidth;
    e.classList.add('habla');
    clearTimeout(decir.t);
    decir.t = setTimeout(() => { globo.hidden = true; e.classList.remove('habla'); }, Math.max(3800, txt.length * 75));
  }
  function hablar() {
    const F = conf.frases && conf.frases.length ? conf.frases : FRASES_CAMEO;
    decir(F[i++ % F.length]);
  }

  // coloca al personaje (en su lugar guardado o en la esquina de la cabecera)
  function colocar() {
    const e = el(), capa = document.getElementById('capa-cameo'), hero = document.querySelector('.hero');
    if (!e || e.hidden || !capa) return;
    const R = capa.getBoundingClientRect();
    let x, y;
    const porDefecto = conf.x == null || conf.y == null;
    hero.classList.toggle('con-cameo', porDefecto);
    if (porDefecto) {
      const h = hero.getBoundingClientRect();
      x = h.right - R.left - e.offsetWidth - Math.min(44, h.width * 0.03);
      y = h.bottom - R.top - e.offsetHeight;
    } else {
      x = conf.x / 100 * R.width;
      y = conf.y;
    }
    x = Math.max(0, Math.min(R.width - e.offsetWidth, x));
    e.style.left = x + 'px';
    e.style.top = Math.max(0, y) + 'px';
    // el globo se acomoda para no salirse de la pantalla
    e.classList.toggle('globo-der', x < 260);
    e.classList.toggle('globo-abajo', y < 120);
  }

  function arrastrable(e, esAdmin) {
    const b = $('.cameo-boton', e);
    // con el teclado (Tab + Enter) también habla; con mouse o dedo lo maneja pointerup
    b.onclick = (ev) => { if (ev.detail === 0) hablar(); };
    b.onpointerdown = (ev) => {
      ev.preventDefault();
      b.setPointerCapture(ev.pointerId);
      const capa = document.getElementById('capa-cameo').getBoundingClientRect();
      const x0 = ev.clientX, y0 = ev.clientY, l0 = e.offsetLeft, t0 = e.offsetTop;
      let movio = false;
      b.onpointermove = (m) => {
        if (!movio && Math.hypot(m.clientX - x0, m.clientY - y0) < 6) return;
        movio = true;
        e.classList.add('moviendo');
        const x = Math.max(0, Math.min(capa.width - e.offsetWidth, l0 + m.clientX - x0));
        const y = Math.max(0, t0 + m.clientY - y0);
        e.style.left = x + 'px';
        e.style.top = y + 'px';
      };
      b.onpointerup = b.onpointercancel = () => {
        b.onpointermove = b.onpointerup = b.onpointercancel = null;
        e.classList.remove('moviendo');
        if (!movio) return hablar(); // un toque sin mover = que hable
        conf.x = e.offsetLeft / capa.width * 100;
        conf.y = e.offsetTop;
        colocar();
        if (esAdmin && S.cameo) { S.cameo.x = conf.x; S.cameo.y = conf.y; guardarSitio(); msg('📍 Aquí se queda para todos'); }
        decir(['¡Ay, que me mareo!', '¿A dónde me llevas, chaval?', 'Aquí estoy bien, gracias.'][Math.floor(Math.random() * 3)]);
      };
    };
  }

  function poner(c0, esAdmin) {
    const e = el();
    if (!e) return;
    const c = Object.assign({ visible: true, nombre: 'AuronPlay', saludo: SALUDO_CAMEO, frases: [] }, c0);
    const k = JSON.stringify(c) + esAdmin;
    if (k === clave) { colocar(); return; }
    clave = k;
    conf = c;
    clearInterval(reloj);
    e.hidden = !c.visible;
    e.innerHTML = '';
    document.querySelector('.hero').classList.remove('con-cameo');
    if (!c.visible) return;
    e.innerHTML = `<span class="cameo-dice" role="status" hidden></span>
      <button type="button" class="cameo-boton" title="Tócalo para que hable · arrástralo para moverlo">${pixelArte(AURON.filas, AURON.pal, 5)}</button>
      <b class="cameo-nombre">${esc(c.nombre)}</b>`;
    $('.cameo-boton', e).setAttribute('aria-label', c.nombre + ': tócalo para que hable');
    arrastrable(e, esAdmin);
    if (esAdmin) {
      const g = E('button', { type: 'button', className: 'cameo-ajustes', title: 'Ajustes de ' + c.nombre, 'aria-label': 'Ajustes de ' + c.nombre }, '⚙');
      g.onclick = () => abrirPropiedades({ cameo: true });
      e.append(g);
    }
    colocar();
    // al entrar dice su frase mítica; después va diciendo las demás
    const F = c.frases && c.frases.length ? c.frases : FRASES_CAMEO;
    // (la página se dibuja dos veces al cargar: el saludo se programa una sola vez
    // y usa la frase guardada que haya en ese momento)
    if (!saludoDicho) {
      saludoDicho = true;
      i = 0;
      primera = setTimeout(() => { if (conf.visible !== false && conf.saludo) decir(conf.saludo); }, 1400);
    } else {
      i = Math.floor(Math.random() * F.length);
    }
    reloj = setInterval(hablar, 12000);
  }

  addEventListener('resize', () => colocar());
  addEventListener('load', () => colocar());
  return { poner, colocar, decir };
})();

// ---------- aplicar un ambiente ----------
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
let ambienteAplicado = '';

function aplicarAmbiente(t, forzar) {
  const id = AMBIENTES[t && t.ambiente] ? t.ambiente : 'panal';
  const a = AMBIENTES[id];
  const b = document.body;
  b.dataset.ambiente = id;
  // la textura del tema se ve si el fondo elegido en 🖌 Estilos es "Textura del tema"
  const patron = (S.global && S.global.patron) || 'tema';
  const tex = patron === 'tema' ? textura(a.textura) : '';
  b.style.setProperty('--textura', tex ? `url("${tex}")` : 'none');
  b.style.setProperty('--textura-tam', (a.textura && TEX[a.textura] ? TEX[a.textura].tam * 4 : 64) + 'px');
  const cab = textura(a.cabecera);
  b.style.setProperty('--textura-cab', cab ? `url("${cab}")` : 'none');
  b.style.setProperty('--textura-cab-tam', (a.cabecera ? TEX[a.cabecera].tam * 4 : 64) + 'px');
  b.style.setProperty('--brillo', a.brillo || 'transparent');
  const f = a.franja || ['#3b6e1f', '#4a8a2a', '#5d9e34', '#6fb23e'];
  ['--f0', '--f1', '--f2', '--f3'].forEach((v, i) => b.style.setProperty(v, f[i]));

  const efectos = ls('efectos') !== '0' && !sinMovimiento.matches;
  const part = efectos && (!t || t.particulas !== false);
  const cria = efectos && (!t || t.criaturas !== false);
  const clave = [id, part, cria].join('|');
  if (clave === ambienteAplicado && !forzar) return;
  ambienteAplicado = clave;
  Particulas.poner(part ? a.particulas : null);
  Criaturas.poner(cria ? a.criaturas : null);
  const bt = document.getElementById('efectos');
  if (bt) bt.setAttribute('aria-pressed', ls('efectos') !== '0');
}
sinMovimiento.addEventListener('change', () => aplicarAmbiente(S.tema, true));

// Cambio de tema con transición: el tema nuevo se abre en círculo desde el clic
function transicionTema(ev, fn) {
  if (!document.startViewTransition || sinMovimiento.matches) return fn();
  const r = document.documentElement.style;
  r.setProperty('--vt-x', (ev && ev.clientX != null ? ev.clientX : innerWidth / 2) + 'px');
  r.setProperty('--vt-y', (ev && ev.clientY != null ? ev.clientY : innerHeight / 2) + 'px');
  document.startViewTransition(fn);
}
