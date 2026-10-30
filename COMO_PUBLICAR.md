# Cómo publicar “letras para mi creador”

La página tiene dos partes:
- **Servidor** (`server.js`) → entrega la página y guarda todo. Se publica gratis en **Render**.
- **MongoDB Atlas** → la base de datos: lo que escribes en el Modo Creador, y tus fotos, videos y canciones.

El código vive en **GitHub**: cada vez que subes cambios, Render vuelve a publicar solo.

---

## 1. Preparar MongoDB Atlas (una sola vez)

1. Entra a cloud.mongodb.com → tu proyecto.
2. **Database** → revisa que el clúster no diga *Paused* (si lo dice: **Resume**).
3. **Network Access** → **Add IP Address**:
   - **Allow access from anywhere** (`0.0.0.0/0`). Render cambia de IP, por eso hace falta.
     La seguridad la da la contraseña del usuario de la base de datos.
4. **Database Access** → revisa que exista tu usuario y que tenga **Read and write to any database**.

## 2. Probar en tu computadora

1. Copia `.env.example` como `.env` y llena los datos (si ya tienes `.env`, sáltate esto).
2. En la carpeta `sitio`:
   ```
   npm install
   npm run local
   ```
3. Abre http://localhost:3100. Si dice “✔ Conectado a MongoDB Atlas”, todo está bien.
   Si dice “No se pudo conectar”, revisa el paso 1 (IP permitida, clúster sin pausar, contraseña).

## 3. Subir a GitHub (una sola vez)

1. Instala Git: https://git-scm.com/download/win (todo “Siguiente”). Cierra y abre la terminal.
2. Dile a Git quién eres:
   ```
   git config --global user.name "Tu nombre"
   git config --global user.email "tu-correo@gmail.com"
   ```
3. En github.com → **New repository** → nombre `letras-para-mi-creador` → **Private** →
   sin README → **Create repository**.
4. En la carpeta `sitio`:
   ```
   git init -b main
   git add .
   git status
   ```
   ⚠️ En la lista de `git status` **NO** debe aparecer `.env`. Si aparece, detente.
   ```
   git commit -m "Página con MongoDB Atlas"
   git remote add origin https://github.com/TU-USUARIO/letras-para-mi-creador.git
   git push -u origin main
   ```

## 4. Publicar en Render (una sola vez)

1. Entra a render.com con tu cuenta de GitHub.
2. **New** → **Blueprint** → elige el repositorio `letras-para-mi-creador`.
3. Render lee `render.yaml` y te pide las claves: cópialas de tu `.env`
   (`MONGODB_URI`, `MONGODB_PASSWORD`, `ADMIN_PASSWORD`, y `ADMIN_CORREO` si lo usas).
4. **Apply**. En 2–3 minutos tu página queda en **https://letras-para-mi-creador.onrender.com**
   (Render te muestra la dirección exacta).

En el plan gratis, si nadie entra en 15 minutos el servidor se duerme y la siguiente visita
tarda unos 30–50 segundos en abrir. Después va normal.

---

## Volver a publicar después de un cambio en el código

Lo que cambias en el Modo Creador se guarda solo en Atlas: no hace falta publicar.
Solo cuando cambias archivos de la carpeta `sitio`:
```
git add .
git commit -m "lo que cambié"
git push
```
Render lo publica solo en 2–3 minutos (míralo en Render → tu servicio → **Events**).

## Entrar al Modo Creador

Toca **Admin** (pie de página, casi transparente) o aprieta **Ctrl + Shift + E**, y escribe
la contraseña `ADMIN_PASSWORD` (y el correo, si pusiste `ADMIN_CORREO`).
Para cambiar la contraseña: cámbiala en `.env` **y** en Render → tu servicio → **Environment**.

## Traer lo que tenías en Firebase

1. Abre la página **vieja** (la de Firebase, `.web.app`) → Modo Creador → **🗂 Copias** →
   **📥 Descargar copia de seguridad**.
2. Abre la página **nueva** → Modo Creador → **🗂 Copias** → **📤 Recuperar desde una copia**
   (marca “también las publicaciones”).

Los archivos de Firebase (configuración, reglas, publicación automática) quedaron guardados
en la carpeta `respaldo-firebase`, junto a `sitio`, por si alguna vez los necesitas.

## Copia de seguridad

Modo Creador → **🗂 Copias** → **📥 Descargar copia de seguridad**. Guarda el `.json` en un
lugar seguro. Para recuperarla: **📤 Recuperar desde una copia**.

## Espacio

Atlas gratis tiene **512 MB** para todo (textos + fotos + canciones + videos).
Para videos largos es mejor subirlos a YouTube y pegar el enlace.
Mira cuánto usas en Atlas → **Database** → tu clúster → **Metrics / Storage**.
