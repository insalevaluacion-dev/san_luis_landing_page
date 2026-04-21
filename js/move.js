const btnPortada = document.querySelector(".boton-portada");
const explorar = document.querySelector(".explorar");

if (btnPortada && explorar) {
    btnPortada.addEventListener("click", () => {
        explorar.scrollIntoView({ behavior: "smooth" });
    });
}


// HEADER SCROLL
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const portada = document.querySelector('.portada');

    if (!portada) return;

    const portadaAltura = portada.offsetHeight;

    if (window.scrollY > portadaAltura * 0.8) {
        header.classList.add('scroleado');
    } else {
        header.classList.remove('scroleado');
    }
});




// BACKGROUND DINÁMICO
document.querySelectorAll('.accordion__item[data-bg]').forEach(item => {
    item.style.backgroundImage = `url('${item.dataset.bg}')`;
});

// PARTE DE ACORDEON EN MOVIL (PANTALLA INICIAL)

const items = document.querySelectorAll(".accordion__item");

items.forEach(item => {
    const link = item.querySelector(".acordion-link");

    if (!link) return;

    link.addEventListener("click", function(e) {

        if (window.innerWidth <= 768) {

            if (!item.classList.contains("activo")) {
                e.preventDefault();

                items.forEach(i => i.classList.remove("activo"));

                item.classList.add("activo");
            }

          
        }
    });
});