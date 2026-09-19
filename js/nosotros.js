document.addEventListener("DOMContentLoaded", () => {
    configurarHeader();
    configurarVideos();
    configurarGaleria();
    configurarRevelado(".mv-tarjeta, .valor-item", "visible", 0.2);
    configurarReglamento();
    configurarRevelado(".reglamento-anim", "en-vista", 0.15, "0px 0px -40px 0px");
    configurarTrayectoria();
    configurarCarruselHistoria();
});

/* ===== Utilidades ===== */

const prefiereMenosMovimiento = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const comportamientoScroll = () => (prefiereMenosMovimiento() ? "auto" : "smooth");

function esActivacion(event) {
    return event.key === "Enter" || event.key === " ";
}

function configurarRevelado(selector, clase, threshold, rootMargin = "0px") {
    const elementos = [...document.querySelectorAll(selector)];
    if (!elementos.length) return;

    if (!("IntersectionObserver" in window)) {
        elementos.forEach((elemento) => elemento.classList.add(clase));
        return;
    }

    const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add(clase);
            instance.unobserve(entry.target);
        });
    }, { threshold, rootMargin });

    elementos.forEach((elemento) => observer.observe(elemento));
}

/* ===== Header ===== */

function configurarHeader() {
    const headerContainer = document.getElementById("header-container");
    const flecha = document.querySelector(".flecha-abajo");
    const bienvenida =
        document.querySelector(".seccion-bienvenida") || document.getElementById("siguiente");
    if (!headerContainer || !bienvenida) return;

    let desplazando = false;
    const header = () => headerContainer.querySelector(".header");
    const alturaHeader = () => (header() ? header().offsetHeight : 0);
    const posicionBienvenida = () => bienvenida.getBoundingClientRect().top + window.scrollY;

    const actualizar = () => {
        const limite = posicionBienvenida() - alturaHeader();
        if (desplazando && window.scrollY < limite) {
            headerContainer.classList.add("visible");
            return;
        }
        desplazando = false;
        headerContainer.classList.toggle("visible", window.scrollY >= limite);
    };

    window.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar, { passive: true });
    window.addEventListener("load", actualizar);

    // compoheader.js inyecta .header despues; al aparecer se recalcula la altura
    if ("MutationObserver" in window) {
        new MutationObserver(actualizar).observe(headerContainer, { childList: true, subtree: true });
    }
    actualizar();

    flecha?.addEventListener("click", (event) => {
        event.preventDefault();
        desplazando = true;
        headerContainer.classList.add("visible");
        window.scrollTo({
            top: posicionBienvenida() - alturaHeader() + 20,
            behavior: comportamientoScroll()
        });
    });
}

/* ===== Videos ===== */

function configurarVideos() {
    const videos = [];

    const pausarOtros = (actual) => {
        videos.forEach((video) => {
            if (video !== actual && !video.paused) video.pause();
        });
    };

    document.querySelectorAll(".boton-reproducir, .tray-play").forEach((boton) => {
        const contenedor = boton.closest(".tarjeta-video, .tray-video");
        const video = contenedor?.querySelector("video");
        if (!video) return;
        videos.push(video);

        const actualizarBoton = () => {
            boton.classList.toggle("oculto", !video.paused);
            boton.setAttribute("aria-label", video.paused ? "Reproducir video" : "Pausar video");
        };

        const alternar = () => {
            if (video.paused) video.play().catch(actualizarBoton);
            else video.pause();
        };

        boton.addEventListener("click", alternar);
        // Con controles nativos el propio video ya alterna; evita el doble toggle
        video.addEventListener("click", () => {
            if (!video.controls) alternar();
        });

        video.addEventListener("play", () => {
            video.controls = true;
            pausarOtros(video);
            actualizarBoton();
        });
        video.addEventListener("pause", actualizarBoton);
        video.addEventListener("ended", actualizarBoton);
        actualizarBoton();
    });
}

/* ===== Lightbox compartido (galeria e historia) ===== */

function crearLightbox(items, modal, obtenerImagen) {
    const modalImg = modal.querySelector(".galeria-modal-img");
    const botonCerrar = modal.querySelector(".galeria-modal-cerrar");
    const botonAnterior = modal.querySelector(".galeria-modal-prev");
    const botonSiguiente = modal.querySelector(".galeria-modal-next");
    const actual = modal.querySelector(".galeria-modal-actual");
    const total = modal.querySelector(".galeria-modal-total");

    let indice = 0;
    let disparador = null;
    let inicioX = 0;
    let inicioY = 0;

    const estaAbierto = () => modal.classList.contains("abierto");

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    total.textContent = items.length;

    function mostrar() {
        const imagen = obtenerImagen(items[indice]);
        modalImg.src = imagen.currentSrc || imagen.src;
        modalImg.alt = imagen.alt;
        actual.textContent = indice + 1;
    }

    function abrir(nuevoIndice, origen) {
        disparador = origen || document.activeElement;
        indice = nuevoIndice;
        mostrar();
        modal.classList.add("abierto");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        botonCerrar.focus({ preventScroll: true });
    }

    function cerrar() {
        modal.classList.remove("abierto");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (disparador && typeof disparador.focus === "function") {
            disparador.focus({ preventScroll: true });
        }
        disparador = null;
    }

    function mover(direccion) {
        indice = (indice + direccion + items.length) % items.length;
        mostrar();
    }

    function atraparTab(event) {
        const enfocables = [...modal.querySelectorAll("button")].filter((boton) => !boton.disabled);
        if (!enfocables.length) return;
        const primero = enfocables[0];
        const ultimo = enfocables[enfocables.length - 1];
        const activo = document.activeElement;

        if (!modal.contains(activo)) {
            event.preventDefault();
            primero.focus();
        } else if (event.shiftKey && activo === primero) {
            event.preventDefault();
            ultimo.focus();
        } else if (!event.shiftKey && activo === ultimo) {
            event.preventDefault();
            primero.focus();
        }
    }

    items.forEach((item, itemIndex) => {
        if (!item.hasAttribute("tabindex")) item.tabIndex = 0;
        if (!item.hasAttribute("role")) item.setAttribute("role", "button");
        item.addEventListener("click", () => abrir(itemIndex, item));
        item.addEventListener("keydown", (event) => {
            if (!esActivacion(event)) return;
            event.preventDefault();
            abrir(itemIndex, item);
        });
    });

    botonCerrar.addEventListener("click", cerrar);
    botonAnterior.addEventListener("click", () => mover(-1));
    botonSiguiente.addEventListener("click", () => mover(1));
    modal.addEventListener("click", (event) => {
        if (event.target === modal) cerrar();
    });

    document.addEventListener("keydown", (event) => {
        if (!estaAbierto()) return;
        if (event.key === "Escape") cerrar();
        else if (event.key === "ArrowLeft") mover(-1);
        else if (event.key === "ArrowRight") mover(1);
        else if (event.key === "Tab") atraparTab(event);
    });

    // Swipe horizontal en pantallas tactiles
    modal.addEventListener("touchstart", (event) => {
        const toque = event.changedTouches[0];
        inicioX = toque.clientX;
        inicioY = toque.clientY;
    }, { passive: true });

    modal.addEventListener("touchend", (event) => {
        const toque = event.changedTouches[0];
        const dx = toque.clientX - inicioX;
        const dy = toque.clientY - inicioY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) mover(dx < 0 ? 1 : -1);
    }, { passive: true });

    return { abrir, cerrar, mover };
}

/* ===== Galeria ===== */

function configurarGaleria() {
    const items = [...document.querySelectorAll(".galeria-item")];
    const modal = document.getElementById("galeriaModal");
    if (!items.length || !modal) return;

    items.forEach((item, itemIndex) => {
        item.setAttribute("role", "button");
        item.tabIndex = 0;
        item.setAttribute("aria-label", `Ver foto ${itemIndex + 1} de ${items.length} en grande`);
        item.querySelector("img")?.addEventListener("error", (event) => {
            event.currentTarget.classList.add("galeria-img--error");
        });
    });

    crearLightbox(items, modal, (item) => item.querySelector("img"));
    configurarRevelado(".galeria-item", "visible", 0.1, "0px 0px -40px 0px");
}

/* ===== Reglamento (pestanas + fotos) ===== */

function configurarReglamento() {
    document.querySelectorAll(".reglamento-carrusel").forEach((carrusel) => {
        const tabs = [...carrusel.querySelectorAll(".reglamento-tab")];
        const fotos = [...carrusel.querySelectorAll(".reglamento-foto")];
        const anterior = carrusel.querySelector(".reglamento-flecha--prev");
        const siguiente = carrusel.querySelector(".reglamento-flecha--next");
        if (!fotos.length) return;

        const tabInicial = tabs.find((tab) => tab.classList.contains("activa")) || tabs[0];
        let grupo = tabInicial?.dataset.tab || fotos[0].dataset.grupo;
        let indice = 0;

        const fotosActivas = () => fotos.filter((foto) => foto.dataset.grupo === grupo);

        const mostrar = () => {
            const activas = fotosActivas();
            fotos.forEach((foto) => foto.classList.add("oculta"));
            activas[indice]?.classList.remove("oculta");
        };

        const marcarTab = (tabActiva) => {
            tabs.forEach((tab) => {
                const seleccionada = tab === tabActiva;
                tab.classList.toggle("activa", seleccionada);
                tab.setAttribute("aria-selected", seleccionada ? "true" : "false");
                tab.tabIndex = seleccionada ? 0 : -1;
            });
        };

        const activarTab = (tab, enfocar = false) => {
            marcarTab(tab);
            grupo = tab.dataset.tab;
            indice = 0;
            mostrar();
            if (enfocar) tab.focus();
        };

        const mover = (direccion) => {
            const activas = fotosActivas();
            if (!activas.length) return;
            indice = (indice + direccion + activas.length) % activas.length;
            mostrar();
        };

        tabs.forEach((tab, posicion) => {
            tab.addEventListener("click", () => activarTab(tab));
            tab.addEventListener("keydown", (event) => {
                let destino = null;
                if (event.key === "ArrowRight") destino = tabs[(posicion + 1) % tabs.length];
                else if (event.key === "ArrowLeft") destino = tabs[(posicion - 1 + tabs.length) % tabs.length];
                else if (event.key === "Home") destino = tabs[0];
                else if (event.key === "End") destino = tabs[tabs.length - 1];
                if (!destino) return;
                event.preventDefault();
                activarTab(destino, true);
            });
        });

        anterior?.addEventListener("click", () => mover(-1));
        siguiente?.addEventListener("click", () => mover(1));

        if (tabInicial) marcarTab(tabInicial);
        mostrar();
    });
}

/* ===== Trayectoria ===== */

function configurarTrayectoria() {
    configurarRevelado(".tray-anim", "en-vista", 0.15, "0px 0px -60px 0px");
}

function configurarCarruselHistoria() {
    const carrusel = document.getElementById("ctCarrusel");
    const modal = document.getElementById("ctModal");
    if (!carrusel || !modal) return;

    const items = [...carrusel.querySelectorAll(".ct-item")];
    crearLightbox(items, modal, (item) => item.querySelector(".ct-img"));

    const desplazar = (direccion) => {
        carrusel.scrollBy({ left: direccion * 320, behavior: comportamientoScroll() });
    };
    document.querySelector(".ct-flecha--prev")?.addEventListener("click", () => desplazar(-1));
    document.querySelector(".ct-flecha--next")?.addEventListener("click", () => desplazar(1));
}