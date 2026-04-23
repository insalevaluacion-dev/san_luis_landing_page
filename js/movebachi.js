document.querySelectorAll('.acordion__elemento').forEach(elemento => {
  const interior = elemento.querySelector('.interior');
  const fondo = elemento.dataset.bg;

  const img = new Image();
  img.src = fondo;

  img.onload = () => {
    interior.style.backgroundImage = `url('${fondo}')`;
  };

  const enlace = elemento.querySelector('.acordion__enlace');
  const href = elemento.dataset.enlace;

  if (href && href !== '#') {
    enlace.href = href;
  } else {
    enlace.addEventListener('click', e => e.preventDefault());
  }
});


if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.body.classList.add('sin-hover');
} 
