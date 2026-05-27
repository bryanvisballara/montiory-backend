# Hostinger Deploy

Esta carpeta ya incluye los builds de produccion de ambos frontends apuntando al backend de Render:

- Storefront API: https://montiory-backend.onrender.com/api
- Admin API: https://montiory-backend.onrender.com/api

## Estructura

- raiz de `hostinger/`: subir este contenido al dominio principal en Hostinger, por ejemplo `public_html/`
- `admin/`: subir este contenido a `public_html/admin/` para usar `https://tudominio.com/admin/`
- `storefront/`: copia alternativa del storefront preparada para montarse explicitamente en `public_html/storefront/` si lo necesitas

## Archivos incluidos

- `index.html`
- `assets/`
- imagenes y fuentes necesarias
- `.htaccess` para que funcionen las rutas SPA al recargar o abrir URLs internas

## Recomendacion de publicacion

1. Dominio principal: sube la raiz de `hostinger/` directamente a `public_html/` para que la tienda cargue desde `/`.
2. Admin: subir el contenido de `admin/` a la carpeta `public_html/admin/` si usas `https://tudominio.com/admin/`
3. Backend: mantenerlo en Render
4. Si Hostinger cachea contenido viejo, limpiar cache del navegador y del hosting

## Notas

- No subas la carpeta `hostinger/` como subcarpeta dentro de `public_html/`; sube su contenido a la raiz.
- La raiz de `hostinger/` ya queda lista para dominio principal con el storefront servido desde `/`.
- Si tambien quieres montar una copia del storefront dentro de `/storefront/`, usa la carpeta `hostinger/storefront/`.
- Si montas el admin dentro de una subcarpeta y no en un subdominio, puede requerir ajustar `RewriteBase` y el `base` de Vite.
- El build del admin para Hostinger debe generarse con base `/admin/` para que JS, CSS e imagenes carguen desde esa subcarpeta.
