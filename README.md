# Electro Mundo

Tienda estática de computadoras lista para **GitHub Pages**.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `eletromundo`).
2. Sube todos los archivos de esta carpeta a la rama `main`.
3. En el repositorio ve a **Settings → Pages**.
4. En **Source** elige **Deploy from a branch**.
5. Branch: `main` / carpeta: `/ (root)`.
6. Guarda. En uno o dos minutos el sitio quedará en:

`https://TU-USUARIO.github.io/eletromundo/`

Si el repositorio se llama `TU-USUARIO.github.io`, el sitio se publica en la raíz:

`https://TU-USUARIO.github.io/`

Las rutas del proyecto son relativas (`css/`, `js/`, `img/`), así que funciona tanto en la raíz como en un subdirectorio de Pages.

## Probar en local

Abre `index.html` en el navegador o sirve la carpeta:

```bash
# Python
python -m http.server 5500
```

Luego entra a `http://localhost:5500`.

## Supabase (proyecto `electro-mundo`)

1. En Supabase abre **SQL Editor → New query**, pega el contenido de `supabase/schema.sql` y presiona **Run**.
   Crea las tablas `productos`, `mensajes_contacto` y `pedidos`, activa RLS y carga los 12 productos.
2. En **Project Settings → API** copia el **Project URL** y la **anon public key**.
3. Pégalos en `js/supabase-config.js` (`SUPABASE_URL` y `SUPABASE_ANON_KEY`).
4. Abre el sitio: los productos vienen de la tabla `productos`, el formulario de contacto guarda en
   `mensajes_contacto` y "Finalizar compra" guarda en `pedidos`.

Si Supabase no está configurado, el sitio sigue funcionando con los productos locales de `js/app.js`.
