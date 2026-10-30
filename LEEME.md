# letras para mi creador

Tu blog con publicaciones, libro Minecraft, música, el perrito, pizarra y calendario.
Funciona con un servidor Node (`server.js`) que guarda todo en **MongoDB Atlas**,
el código vive en **GitHub** y se publica en **Render**.
**Cómo publicar cambios, entrar al Modo Creador y agregar archivos: lee `COMO_PUBLICAR.md`.**

## Fotos, videos y canciones

Se guardan en **MongoDB Atlas** (GridFS). Las fotos se reducen solas a 1600 px.
En el Modo Creador, donde va un archivo: **⬆ Subir desde tu dispositivo**, pegar un enlace
(YouTube, una imagen de internet…) o elegir uno de los que ya tiene la página
(`public/archivos` y `public/img`).

## Modo creador

- Toca **Admin** (pie de página, casi transparente) o aprieta **Ctrl + Shift + E**, y entra con
  la contraseña `ADMIN_PASSWORD` del `.env` (y el correo `ADMIN_CORREO`, si lo pusiste).
  Para salir: 🚪 Salir o Ctrl + Shift + E.
- Para cambiar la contraseña: cámbiala en `.env` y en Render → Environment.

Con el modo creador activo aparece una barra arriba:

| Botón | Qué hace |
| --- | --- |
| ➕ Publicar | Elige una foto, video, canción o PDF de la página (o pega un enlace, por ejemplo de YouTube), escribe y publica. |
| ✚ Agregar | Pon en cualquier lugar de la página un texto, una imagen o GIF, un sticker (emojis y bloques de Minecraft, o el tuyo) o un botón con enlace. También vuelve a mostrar widgets ocultos. |
| 🧩 Widgets | Activa, desactiva y ordena los paneles de la derecha. Cada panel tiene su ⚙ con sus opciones (canciones, nombre, velocidad y frases del perrito, opciones de ánimo, título…). En el ⚙ del perrito están sus **accesorios en pixel-art**, uno por lugar y combinables: cabeza (corona, sombrero de copa, gorra, casco minero, casco de diamante, antenas de abeja, gorro de fiesta, audífonos, moño, flor), cara (lentes de sol, lentes redondos, chapitas), cuello (collar con placa, bufanda, corbatín, pañuelo) y espalda (capa, alas de abeja). |
| 🖌 Estilos | Toda la página: fuente de títulos y de texto, tamaño de letra y fondo (lunares, cuadritos, liso o tu imagen). Cada sección y widget: fondo, imagen de fondo, color de texto, borde, esquinas redondeadas, sombra, espacio y opacidad. Y un campo de **CSS personalizado** para cosas avanzadas. |
| 🎨 Temas | 10 temas con textura pixelada, cabecera animada, partículas y criaturas: **Panal**, **Overworld** (cielo, nubes, hojas, gallinas y ovejas), **Nether** (netherrack, lava, brasas), **The End** (purpur, estrellas, partículas ender), **Enjambre** (colmena, luces de concierto, enjambre de abejas), **Minas** (piedra con minerales, antorchas, arañas y esqueletos), **Mobs hostiles** (noche, luna, murciélagos, creepers, zombies…), **Mobs pasivos** (pradera, sol, corazones, ovejas, cerdos, vacas, gallinas), **Claro** y **Oscuro** (luciérnagas). Al cambiar de tema, el nuevo se abre en círculo desde donde hiciste clic. También: colores, modo oscuro, título, foto y GIF de la cabecera. |
| 👤 Perfil | Tu foto, nombre, “sobre mí” y tus redes sociales. |
| ↶ ↷ | Deshacer y rehacer (Ctrl+Z / Ctrl+Y), hasta 60 pasos. |
| ▦ Rejilla | Los elementos se acomodan solos en una rejilla, para que todo quede ordenado. |
| 👁 Vista previa | Ves la página como tus visitantes. “✏ Volver a editar” para seguir. |
| 💾 Guardar | Guarda al momento (igual se guarda solo; mira “Guardado ✓”). |
| 💻 📱 📲 | Ve y edita la página como en computadora, tablet o celular. **En celular, lo que muevas se guarda solo para celular** (en ⚙ puedes volver a “la misma que en computadora”). |
| 🗂 Copias | 📥 Descarga una copia de seguridad (archivo .json con todo) y 📤 recupérala cuando quieras. Versiones: se guarda una sola cada 10 minutos de trabajo, y puedes guardar una con nombre (“Diseño de Halloween”) y volver a ella. |
| ❓ Ayuda | Repite el recorrido guiado (sale solo la primera vez que entras). |

**Publicaciones con bloques**: en ➕ Publicar, abajo, agrega bloques de título, párrafo, imagen,
galería, video de YouTube, reseña (con estrellas), cita y lista. Ordénalos arrastrando el ⠿ o con ↑ ↓.
Con ⭐ guardas un bloque para reusarlo (aparece en “Agregar bloque”).

**Calendario**: toca un día, escribe qué pasó y, si quieres, agrégale una imagen.

**Mobs**: cada tema tiene los suyos y caminan por abajo de la pantalla. Cada uno tiene sus frases
(las dicen al tocarlos y, de vez en cuando, solos). El creeper explota 💥, el enderman se teletransporta,
el ghast y las abejas vuelan, el cubo de magma va brincando y el shulker se queda en su caja.

| Tema | Mobs |
| --- | --- |
| Panal | abeja, gato, aldeano |
| Overworld | gallina, oveja, cerdo, lobo, aldeano |
| Nether | piglin, strider, cubo de magma, ghast |
| The End | enderman, endermite, shulker |
| Enjambre | abejas, aldeano, gato |
| Minas | araña, esqueleto, creeper, ajolote |
| Mobs hostiles | creeper, zombie, esqueleto, araña, enderman |
| Mobs pasivos | oveja, cerdo, vaca, gallina, lobo, gato |
| Claro | aldeano, gato, gallina |
| Oscuro | zorro, lobo, gato |

Las frases de cada mob están en `public/js/temas.js` → `MOBS` (`frases: [...]`) por si quieres cambiarlas.

**AuronPlay**: al entrar a la página saluda con “¿Pero qué pasa, chavales? Todo bien, todo correcto,
y yo que me alegro.”; después dice una frase cada 12 segundos y otra cada vez que lo tocan.
- **Moverlo**: arrástralo a cualquier parte. Si lo mueves en el Modo Creador, se queda ahí para todos;
  si lo mueve un visitante, solo cambia en su pantalla.
- **Editar lo que dice**: en el Modo Creador toca su ⚙ (o 🧩 Widgets → Personaje invitado):
  “Frase al entrar”, “Sus otras frases” (una por línea), botones para oírlas, su nombre,
  esconderlo y “↺ Volver a la cabecera”. Si lo escondes, vuelve con ✚ Agregar → Personaje.
**✨ Efectos** (pie de página): cada visitante puede apagar partículas y criaturas. Si su dispositivo
tiene activado “reducir movimiento”, se apagan solas.

**Elementos libres** (lo que agregas con ✚):
- Clic para seleccionarlo y arrástralo a donde quieras. Aparecen **guías rosadas** cuando queda alineado con el centro o con otro elemento.
- El cuadrito de la esquina cambia el tamaño; el círculo de arriba lo gira.
- Menú pequeño: ⚙ propiedades · 📋 duplicar · ⬆ al frente · ⬇ atrás · 🔒 bloquear · 🗑 borrar.
- Doble clic en un texto o botón para escribir directo sobre él.
- En ⚙ cambias tamaño, giro, transparencia, fuente (incluye una pixelada tipo Minecraft), colores, alineación y una **animación**: flotar, rebotar, girar, brillar o aparecer al bajar.
- Teclado: flechas para mover (Shift = más rápido), Ctrl+D duplicar, Supr borrar, Esc soltar.

Deshacer funciona con el diseño de la página (elementos, widgets, temas, perfil, libro, música…).
Las publicaciones no entran en deshacer: se borran con su 🗑 y piden confirmación.

En cada publicación: ☆ la destaca (sale grande arriba), ✎ la edita, 🗑 la borra (con su archivo).
En las pestañas: **＋ Pestaña**, y en la pestaña activa ✎ para renombrar y ✕ para borrar.
El libro se edita abriéndolo (✎ Escribir, ＋ Página, 🖼 Imagen) y el álbum del perrito con 📷.

## Archivos

| Archivo | Qué es |
| --- | --- |
| `server.js` | El servidor: entrega la página, guarda todo en MongoDB Atlas y revisa la contraseña de la creadora (solo ella puede cambiar cosas) |
| `.env` · `.env.example` | Claves de Atlas y del Modo Creador (`.env` nunca se sube a GitHub; `.env.example` es la plantilla) |
| `render.yaml` | Configuración para publicar en Render |
| `listar-archivos.js` | Arma la lista de archivos que se pueden elegir (se ejecuta sola al arrancar) |
| `public/js/datos.js` | Habla con el servidor: guardar, leer, entrar y salir del Modo Creador, subir archivos |
| `public/archivos/` | Fotos, videos y canciones de la página |
| `public/index.html` | Estructura de la página |
| `public/css/estilo.css` | Diseño del blog |
| `public/css/modo-creador.css` | Herramientas de edición |
| `public/js/app.js` | Publicaciones, música, calendario, pizarra, temas, inicio de sesión |
| `public/js/modo-creador.js` | Editor visual: elementos libres, propiedades, widgets, estilos, deshacer, dispositivos, copias, recorrido |
| `public/js/bloques.js` | Bloques de las publicaciones |
| `public/js/temas.js` | Temas: texturas, partículas, criaturas (dibujos en pixel-art en `MOBS`) y colores (`AMBIENTES`) |
| `public/css/temas.css` | Cabeceras animadas, criaturas y transición de cada tema |
| `public/css/reproductor.css` | Reproductor estilo iPhone (portada grande, fondo de vidrio, “A continuación”) |
| `public/js/libro.js` | Libro estilo Minecraft |
| `public/js/mascota.js` | El perrito (dibujo pixel-art en `PERRO` y colores en `PAL`) |
| `public/img/stickers/` | Stickers de bloques de Minecraft en pixel-art |

