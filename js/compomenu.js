(() => {
  'use strict';

  function cargarMenu() {
    const contenedor = document.getElementById('menu-container');
    if (!contenedor) return;

    fetch('/components/menu.html')
      .then((res) => res.text())
      .then((html) => {
        contenedor.innerHTML = html;

        // Rellenar el nombre de la carrera / sección según la página
        const carrera = document.body.dataset.carrera || '';
        const titulo = document.getElementById('menuCarreraTitulo');

        if (titulo) {
          titulo.textContent = carrera;
        }
      })
      .catch((err) => {
        console.error('No se pudo cargar el menú:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarMenu, { once: true });
  } else {
    cargarMenu();
  }
})();