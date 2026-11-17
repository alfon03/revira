# La Revirá Cerveceros · Web simplificada y profesional

Web estática del restaurante, diseñada para funcionar en ordenador, móvil y tablet sin compilación ni frameworks.

## Lo que se ha simplificado

- **Una hoja CSS:** `site.css` sustituye a las siete hojas superpuestas de versiones anteriores.
- **Tres scripts con funciones claras:** `core.js` (carta, galerías, horarios, idiomas y visores), `ui.js` (búsqueda, favoritos, teclado y detalles), y `site-data.js` (respaldo de datos para abrir la web sin servidor).
- **Tres páginas:** `index.html` (inicio), `platos.html` (fotografías) y `carta.html` (carta y precios).
- **Un PDF:** `pdf/carta-la-revira.pdf`, usado para visualizar y descargar la carta.
- Se ha quitado el historial Git y se han eliminado estilos, scripts y PDFs duplicados, sin tocar las fotografías ni los vídeos originales.

## Cambios visuales

- Identidad verde bosque, crema y dorado con tipografía editorial y más espacio entre bloques.
- Portada con una sola fotografía, botones consistentes y apartados más sencillos.
- «Nuestros platos» con fotos en proporción 3:2 cuando corresponde, para respetar los textos integrados en las imágenes; fotos verticales completas sobre fondo difuminado.
- Carta más limpia, con búsqueda, categorías, favoritos y sugerencias.
- Header y navegación inferior móvil renovados; modo claro y oscuro.
- Mejor lectura de horarios, contacto y pie de página.

## Cómo abrir y publicar

1. Descomprime la carpeta `web` y abre `index.html` o usa Live Server en VS Code.
2. Para publicarla, sube **todo el contenido de `web/`** a la raíz del hosting, conservando las subcarpetas.
3. Comprueba en el dominio real el PDF, el mapa y la función de compartir (dependen del navegador y del contexto HTTPS).

## Cómo actualizar el contenido

- **Textos:** `lang/es.json`, `lang/en.json`, `lang/fr.json`, `lang/de.json`.
- **Carta, precios y fotos de cada plato:** `img/platos/<categoria>/manifest.json` y archivos `.webp` correspondientes.
- **Galería:** archivos `media.json` de `img/platos/<categoria>/` y `img/carrusel/media.json`.
- **Horarios:** modifica las claves `hours_*` de los archivos de idioma y los textos iniciales en `index.html`.
- Después de cambiar JSON, ejecuta `python actualizar-datos.py` desde cualquier directorio para regenerar `site-data.js`, usado como respaldo local.

Las reservas se solicitan por teléfono; el botón no confirma una reserva. Las fotos y vídeos son originales y **no han sido retocados**. Se ha respetado el horario comunicado: lunes cerrado; martes a sábado de 12:00 a cierre y de 20:30 a cierre; domingo de 12:00 a cierre, noche cerrado.
