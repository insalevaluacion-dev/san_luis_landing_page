document.addEventListener('DOMContentLoaded', () => {

  // ── Detección táctil ─────────────────────────────────────────
  const esTactil = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (esTactil) document.body.classList.add('sin-hover');

  // ── Por cada acordeón en la página ───────────────────────────
  document.querySelectorAll('.acordion').forEach(acordion => {

    const elementos = acordion.querySelectorAll('.acordion__elemento');

    // Activar la primera tarjeta por defecto siempre
    // (en táctil para mostrar estado; en desktop no afecta porque
    //  el hover reemplaza la lógica de "activo")
    if (elementos.length > 0) {
      elementos[0].classList.add('activo');
    }

    elementos.forEach(elemento => {
      const interior = elemento.querySelector('.interior');
      const enlace   = elemento.querySelector('.acordion__enlace');
      const fondo    = elemento.dataset.bg;
      const href     = elemento.dataset.enlace;

      // Carga imagen de fondo
      if (fondo) {
        const img = new Image();
        img.onload  = () => { interior.style.backgroundImage = `url('${fondo}')`; };
        img.onerror = () => { console.warn(`Imagen no encontrada: ${fondo}`); };
        img.src = fondo;
      }

      // Configura el enlace
      if (href && href !== '#') {
        enlace.href = href;
      } else {
        enlace.setAttribute('href', '#');
        enlace.setAttribute('aria-disabled', 'true');
        enlace.addEventListener('click', e => e.preventDefault());
      }

      // ── Lógica táctil ────────────────────────────────────────
      if (esTactil) {
        elemento.addEventListener('click', e => {
          const yaActivo = elemento.classList.contains('activo');

          // Colapsar todos los del mismo acordeón
          elementos.forEach(el => el.classList.remove('activo'));

          if (!yaActivo) {
            // Primer tap → expandir, no navegar
            elemento.classList.add('activo');
            e.preventDefault();
          }
          // Si yaActivo y tiene enlace real → navega (no se previene)
          else if (!href || href === '#') {
            e.preventDefault();
          }
        });
      }
    });
  });

});