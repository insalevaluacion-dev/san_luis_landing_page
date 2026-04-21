
//ACORDEON DE BACHILLERATOS (WEB)

document.querySelectorAll('.accordion__item').forEach(item => {
  const inner = item.querySelector('.inner');
  inner.style.backgroundImage = `url('${item.dataset.bg}')`;
});