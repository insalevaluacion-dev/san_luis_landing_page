const btnPortada = document.querySelector(".boton-portada");
const explorar = document.querySelector(".explorar");

if (btnPortada && explorar) {
    btnPortada.addEventListener("click", () => {
        explorar.scrollIntoView({ behavior: "smooth" });
    });
}


// HEADER SCROLL (con requestAnimationFrame para no disparar el cálculo en cada evento de scroll)
const header = document.querySelector('.header');
let scrollTicking = false;

function actualizarHeader() {
    const portada = document.querySelector('.portada');
    if (!portada) {
        scrollTicking = false;
        return;
    }

    const portadaAltura = portada.offsetHeight;

    if (window.scrollY > portadaAltura * 0.8) {
        header.classList.add('scroleado');
    } else {
        header.classList.remove('scroleado');
    }

    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        window.requestAnimationFrame(actualizarHeader);
        scrollTicking = true;
    }
});


// PARTE DE ACORDEON EN MOVIL (PANTALLA INICIAL)

const items = document.querySelectorAll(".accordion__item");

items.forEach(item => {
    const link = item.querySelector(".acordion-link");

    if (!link) return;

    link.addEventListener("click", function (e) {

        if (window.innerWidth <= 768) {

            if (!item.classList.contains("activo")) {
                e.preventDefault();

                items.forEach(i => {
                    i.classList.remove("activo");
                    const otroLink = i.querySelector(".acordion-link");
                    if (otroLink) otroLink.setAttribute("aria-expanded", "false");
                });

                item.classList.add("activo");
                link.setAttribute("aria-expanded", "true");
            }


        }
    });
});