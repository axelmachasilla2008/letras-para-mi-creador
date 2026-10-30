// ============================================================
// letras para mi creador — bloques.js
// Publicaciones armadas con bloques (estilo WordPress): título, párrafo,
// imagen, galería, video de YouTube, reseña, cita y lista.
// Se reordenan arrastrando (⠿) y se pueden guardar como bloques reutilizables.
// Usa las utilidades de app.js (E, esc, ok, zona, ytId, S…).
// ============================================================

const TIPOS_BLOQUE = {
  titulo: ['🔠', 'Título'],
  parrafo: ['¶', 'Párrafo'],
  imagen: ['🖼', 'Imagen'],
  galeria: ['🗂', 'Galería'],
  youtube: ['▶', 'Video de YouTube'],
  resena: ['📖', 'Reseña'],
  cita: ['❝', 'Cita'],
  lista: ['☰', 'Lista'],
};

function bloqueNuevo(tipo) {
  return Object.assign({ tipo }, {
    titulo: { t: '' },
    parrafo: { t: '' },
    imagen: { u: '', pie: '' },
    galeria: { fotos: [] },
    youtube: { u: '' },
    resena: { titulo: '', autor: '', estrellas: 5, t: '', portada: '' },
    cita: { t: '', autor: '' },
    lista: { items: [] },
  }[tipo]);
}

// ---------- cómo se ven los bloques en la publicación ----------
function htmlBloques(L) {
  return (Array.isArray(L) ? L : []).map((b) => {
    if (b.tipo === 'titulo' && b.t) return `<h3 class="b-titulo">${esc(b.t)}</h3>`;
    if (b.tipo === 'parrafo' && b.t) return `<p class="b-parrafo">${esc(b.t)}</p>`;
    if (b.tipo === 'imagen' && ok(b.u)) {
      return `<figure class="b-imagen"><img src="${esc(ok(b.u))}" alt="${esc(b.pie)}" loading="lazy">${b.pie ? `<figcaption>${esc(b.pie)}</figcaption>` : ''}</figure>`;
    }
    if (b.tipo === 'galeria') {
      const F = (b.fotos || []).filter((f) => ok(f.u));
      return F.length ? `<div class="b-galeria">${F.map((f) => `<figure><img src="${esc(ok(f.u))}" alt="${esc(f.d)}" loading="lazy">${f.d ? `<figcaption>${esc(f.d)}</figcaption>` : ''}</figure>`).join('')}</div>` : '';
    }
    if (b.tipo === 'youtube') {
      const id = ytId(b.u);
      return id ? `<div class="b-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Video de YouTube" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>` : '';
    }
    if (b.tipo === 'resena' && (b.titulo || b.t)) {
      const n = Math.max(0, Math.min(5, +b.estrellas || 0));
      return `<div class="b-resena">${ok(b.portada) ? `<img src="${esc(ok(b.portada))}" alt="">` : '<span class="b-resena-ico" aria-hidden="true">📖</span>'}
        <div><b>${esc(b.titulo)}</b>${b.autor ? `<small>${esc(b.autor)}</small>` : ''}
        <span class="b-estrellas" aria-label="${n} de 5 estrellas">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>${b.t ? `<p>${esc(b.t)}</p>` : ''}</div></div>`;
    }
    if (b.tipo === 'cita' && b.t) return `<blockquote class="b-cita"><p>${esc(b.t)}</p>${b.autor ? `<cite>— ${esc(b.autor)}</cite>` : ''}</blockquote>`;
    if (b.tipo === 'lista' && b.items && b.items.length) return `<ul class="b-lista">${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    return '';
  }).join('');
}

// Texto e imagen para la tarjeta cuando la publicación solo tiene bloques
function textoDe(p) {
  if (p.texto) return p.texto;
  const b = (p.bloques || []).find((x) => (x.tipo === 'parrafo' || x.tipo === 'cita' || x.tipo === 'resena') && x.t);
  return b ? b.t : '';
}
function imagenDe(p) {
  for (const b of p.bloques || []) {
    if (b.tipo === 'imagen' && ok(b.u)) return ok(b.u);
    if (b.tipo === 'galeria' && b.fotos && b.fotos[0] && ok(b.fotos[0].u)) return ok(b.fotos[0].u);
    if (b.tipo === 'resena' && ok(b.portada)) return ok(b.portada);
  }
  return '';
}

// ---------- editor de bloques (dentro de la ventana de publicación) ----------
function editorBloques(caja, inicial, alCambiar) {
  let L = clonar(Array.isArray(inicial) ? inicial : []);
  let arrastrado = null;
  const lista = E('div', { className: 'b-edit-lista' });
  const barra = E('div', { className: 'b-agregar' });
  caja.append(lista, E('p', { className: 'ayuda' }, 'Agregar bloque:'), barra);
  const cambio = () => alCambiar && alCambiar();
  const boton = (txt, titulo, desactivado, fn) => E('button', { type: 'button', className: 'sec', title: titulo, 'aria-label': titulo, disabled: desactivado, onclick: fn }, txt);

  function pintarBarra() {
    barra.innerHTML = '';
    Object.entries(TIPOS_BLOQUE).forEach(([k, [i, n]]) => barra.append(boton(`${i} ${n}`, 'Agregar ' + n, false, () => { L.push(bloqueNuevo(k)); pintar(); cambio(); })));
    (S.bloquesGuardados || []).forEach((g, gi) => {
      const b = boton(`⭐ ${esc(g.nombre)}`, 'Bloque reutilizable', false, () => { L.push(clonar(g.bloque)); pintar(); cambio(); });
      b.classList.add('b-guardado');
      b.append(E('span', { className: 'b-quitar', title: 'Borrar este bloque reutilizable', onclick(e) {
        e.stopPropagation();
        if (!confirm(`¿Seguro que quieres borrar el bloque reutilizable “${g.nombre}”?`)) return;
        S.bloquesGuardados.splice(gi, 1);
        guardarSitio();
        pintarBarra();
      } }, '✕'));
      barra.append(b);
    });
  }

  function guardarReutilizable(b) {
    const nombre = prompt('Nombre para este bloque reutilizable:', TIPOS_BLOQUE[b.tipo][1]);
    if (!nombre || !nombre.trim()) return;
    S.bloquesGuardados = S.bloquesGuardados || [];
    S.bloquesGuardados.push({ nombre: nombre.trim().slice(0, 40), bloque: clonar(b) });
    guardarSitio();
    pintarBarra();
    msg('⭐ Guardado: lo encuentras abajo, en “Agregar bloque”');
  }

  function mover(i, d) {
    const j = i + d;
    [L[i], L[j]] = [L[j], L[i]];
    pintar();
    cambio();
  }

  function pintar() {
    lista.innerHTML = '';
    L.forEach((b, i) => {
      const f = E('div', { className: 'b-fila' });
      const asa = E('span', { className: 'b-asa', title: 'Arrastra para reordenar' }, '⠿');
      // solo se arrastra desde el asa, para poder escribir en los campos
      asa.onpointerdown = () => { f.draggable = true; };
      f.ondragstart = (e) => { arrastrado = i; f.classList.add('arrastrando'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); };
      f.ondragend = () => { f.draggable = false; f.classList.remove('arrastrando'); };
      f.ondragover = (e) => { if (arrastrado != null) { e.preventDefault(); f.classList.add('sobre'); } };
      f.ondragleave = () => f.classList.remove('sobre');
      f.ondrop = (e) => {
        e.preventDefault();
        f.classList.remove('sobre');
        if (arrastrado == null || arrastrado === i) return;
        const [x] = L.splice(arrastrado, 1);
        L.splice(i, 0, x);
        arrastrado = null;
        pintar();
        cambio();
      };
      const cab = E('div', { className: 'b-cab' });
      cab.append(asa, E('b', {}, TIPOS_BLOQUE[b.tipo] ? TIPOS_BLOQUE[b.tipo].join(' ') : b.tipo),
        boton('↑', 'Subir', i === 0, () => mover(i, -1)),
        boton('↓', 'Bajar', i === L.length - 1, () => mover(i, 1)),
        boton('⭐', 'Guardar como bloque reutilizable', false, () => guardarReutilizable(b)),
        boton('🗑', 'Quitar bloque', false, () => { L.splice(i, 1); pintar(); cambio(); }));
      f.append(cab, camposBloque(b, cambio));
      lista.append(f);
    });
    if (!L.length) lista.append(E('p', { className: 'ayuda' }, 'Opcional: arma tu publicación con bloques (títulos, fotos, videos, reseñas…). Se ven debajo del texto.'));
  }

  pintarBarra();
  pintar();
  return { valor: () => clonar(L) };
}

// Campos de cada tipo de bloque
function camposBloque(b, cambio) {
  const w = E('div', { className: 'b-campos' });
  const entrada = (etq, k, ph, area) => {
    const i = E(area ? 'textarea' : 'input', { value: b[k] || '', placeholder: ph || '' });
    if (area) i.rows = 4;
    i.oninput = () => { b[k] = i.value; cambio(); };
    const l = E('label', { className: 'campo' });
    l.append(E('span', {}, etq), i);
    return l;
  };
  const subida = (texto, url, alCambiar) => {
    const z = E('div', { className: 'zona chica' });
    zona(z, { texto, icono: '🖼', acepta: 'image/*', url: ok(url), mime: url ? 'image/' : '', alCambiar });
    return z;
  };

  if (b.tipo === 'titulo') w.append(entrada('Título', 't', 'Un subtítulo para tu publicación'));
  if (b.tipo === 'parrafo') w.append(entrada('Párrafo', 't', 'Escribe aquí…', true));
  if (b.tipo === 'imagen') w.append(subida('Imagen o GIF', b.u, (u) => { b.u = u; cambio(); }), entrada('Pie de foto', 'pie', 'Qué se ve en la foto'));
  if (b.tipo === 'youtube') {
    const l = entrada('Enlace de YouTube', 'u', 'https://www.youtube.com/watch?v=…');
    const aviso = E('small', {}, '');
    const revisar = () => { aviso.textContent = !b.u ? '' : ytId(b.u) ? '✔ Video encontrado' : '✖ No parece un enlace de YouTube'; };
    $('input', l).addEventListener('input', revisar);
    revisar();
    w.append(l, aviso);
  }
  if (b.tipo === 'cita') w.append(entrada('Cita', 't', 'Una frase que te guste…', true), entrada('De quién es', 'autor', 'Enjambre, un libro…'));
  if (b.tipo === 'lista') {
    const t = E('textarea', { rows: 4, value: (b.items || []).join('\n'), placeholder: 'Un elemento por línea' });
    t.oninput = () => { b.items = t.value.split('\n').map((x) => x.trim()).filter(Boolean); cambio(); };
    const l = E('label', { className: 'campo' });
    l.append(E('span', {}, 'Lista (uno por línea)'), t);
    w.append(l);
  }
  if (b.tipo === 'resena') {
    const est = E('select', {}, [5, 4, 3, 2, 1, 0].map((n) => `<option value="${n}">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</option>`).join(''));
    est.value = String(b.estrellas == null ? 5 : b.estrellas);
    est.onchange = () => { b.estrellas = +est.value; cambio(); };
    const le = E('label', { className: 'campo' });
    le.append(E('span', {}, 'Calificación'), est);
    const fila = E('div', { className: 'fila' });
    fila.append(entrada('Libro, canción o película', 'titulo', 'Título'), entrada('Autor', 'autor', 'Quién lo hizo'));
    w.append(fila, le, entrada('Tu reseña', 't', '¿Qué te pareció?', true), subida('Portada (opcional)', b.portada, (u) => { b.portada = u; cambio(); }));
  }
  if (b.tipo === 'galeria') {
    b.fotos = b.fotos || [];
    const g = E('div', { className: 'b-galeria-edit' });
    const pintarG = () => {
      g.innerHTML = '';
      b.fotos.forEach((f, i) => {
        const c = E('div', { className: 'b-foto' });
        c.append(E('img', { src: ok(f.u), alt: '' }));
        const d = E('input', { value: f.d || '', placeholder: 'Descripción' });
        d.oninput = () => { f.d = d.value; cambio(); };
        c.append(d, E('button', { type: 'button', className: 'x', title: 'Quitar foto', 'aria-label': 'Quitar foto', onclick() { b.fotos.splice(i, 1); pintarG(); cambio(); } }, '✕'));
        g.append(c);
      });
    };
    pintarG();
    // cada foto subida se agrega a la galería
    const z = E('div', { className: 'zona chica' });
    zona(z, { texto: 'Agregar foto a la galería', icono: '➕', acepta: 'image/*', alCambiar(u) { if (u) { b.fotos.push({ u, d: '' }); pintarG(); cambio(); setTimeout(() => $('.quitar', z) && $('.quitar', z).click(), 0); } } });
    // (al elegir una foto se suma a la galería y la zona queda lista para otra)
    w.append(g, z);
  }
  return w;
}
