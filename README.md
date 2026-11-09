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
