/* ============================================================
   VISTA EVENTOS
   (descarga de calendario, carrusel principal de eventos,
   filtro por mes, imágenes rotativas de tarjetas)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // ==================== DESCARGA + PESTAÑA NUEVA DEL CALENDARIO ====================
  const enlaceCalendario = document.querySelector("#descargar-calendario");

  if (enlaceCalendario) {
    enlaceCalendario.addEventListener("click", (evento) => {
      evento.preventDefault();
      const rutaPdf = enlaceCalendario.getAttribute("href");

      // 1) Abrir el PDF en una pestaña nueva
      window.open(rutaPdf, "_blank", "noopener");

      // 2) Forzar también la descarga del archivo
      const descarga = document.createElement("a");
      descarga.href = rutaPdf;
      descarga.download = "Calendario_INSAL_2026.pdf";
      document.body.appendChild(descarga);
      descarga.click();
      descarga.remove();
    });
  }

  // ==================== CARRUSEL PRINCIPAL ====================
  const contenido = document.querySelector(".carrusel-contenido");
  const diapositivas = document.querySelectorAll(".diapositiva");
  const puntos = document.querySelector(".puntos-carrusel");
  const botonAnterior = document.querySelector(".flecha-anterior");
  const botonSiguiente = document.querySelector(".flecha-siguiente");

  // Validación: si esta página no tiene el carrusel de eventos, no seguimos
  // (evita que un error aquí corte el resto del script en la vista general)
  if (contenido && diapositivas.length && puntos && botonAnterior && botonSiguiente) {
    let diapositivaActual = 0;
    let temporizadorCarrusel;
    let inicioToque = 0;

    diapositivas.forEach((_, indice) => {
      const punto = document.createElement("button");
      punto.type = "button";
      punto.setAttribute("aria-label", `Ver diapositiva ${indice + 1}`);
      punto.addEventListener("click", () => {
        mostrarDiapositiva(indice);
        reiniciarTemporizador();
      });
      puntos.appendChild(punto);
    });

    function mostrarDiapositiva(indice) {
      diapositivaActual = (indice + diapositivas.length) % diapositivas.length;
      contenido.style.transform = `translateX(-${diapositivaActual * 100}%)`;

      puntos.querySelectorAll("button").forEach((punto, indiceActual) => {
        punto.classList.toggle("activo", indiceActual === diapositivaActual);
      });
    }

    botonAnterior.addEventListener("click", () => {
      mostrarDiapositiva(diapositivaActual - 1);
      reiniciarTemporizador();
    });

    botonSiguiente.addEventListener("click", () => {
      mostrarDiapositiva(diapositivaActual + 1);
      reiniciarTemporizador();
    });

    contenido.parentElement.addEventListener("touchstart", (evento) => {
      inicioToque = evento.changedTouches[0].screenX;
    }, { passive: true });

    contenido.parentElement.addEventListener("touchend", (evento) => {
      const desplazamiento = evento.changedTouches[0].screenX - inicioToque;

      if (Math.abs(desplazamiento) < 50) {
        return;
      }

      mostrarDiapositiva(
        desplazamiento < 0 ? diapositivaActual + 1 : diapositivaActual - 1
      );
      reiniciarTemporizador();
    }, { passive: true });

    function reiniciarTemporizador() {
      clearInterval(temporizadorCarrusel);
      temporizadorCarrusel = setInterval(() => {
        mostrarDiapositiva(diapositivaActual + 1);
      }, 2000);
    }

    mostrarDiapositiva(0);
    reiniciarTemporizador();
  }

  // ==================== FILTRO DE CALENDARIZACION ====================
  const botonesMes = document.querySelectorAll(".filtro-mes");
  const contenidosMes = document.querySelectorAll(".contenido-mes");

  botonesMes.forEach((boton) => {
    boton.addEventListener("click", () => {
      const mesSeleccionado = boton.dataset.mes;

      botonesMes.forEach((botonMes) => {
        const esActivo = botonMes === boton;
        botonMes.classList.toggle("activo", esActivo);
        botonMes.setAttribute("aria-selected", esActivo);
      });

      contenidosMes.forEach((contenidoMes) => {
        contenidoMes.classList.toggle(
          "activo",
          contenidoMes.dataset.contenido === mesSeleccionado
        );
      });
    });
  });

  // ==================== IMAGENES DE LAS TARJETAS ====================
  document.querySelectorAll(".imagen-evento").forEach((contenedor) => {
    const imagenes = [...contenedor.querySelectorAll("img")];
    let imagenActual = 0;
    let temporizadorImagen;

    function cambiarImagen() {
      imagenes[imagenActual].classList.remove("imagen-activa");
      imagenActual = (imagenActual + 1) % imagenes.length;
      imagenes[imagenActual].classList.add("imagen-activa");
    }

    contenedor.addEventListener("mouseenter", () => {
      if (imagenes.length > 1) {
        temporizadorImagen = setInterval(cambiarImagen, 1200);
      }
    });

    contenedor.addEventListener("mouseleave", () => {
      clearInterval(temporizadorImagen);
      imagenes[imagenActual].classList.remove("imagen-activa");
      imagenActual = 0;
      imagenes[imagenActual].classList.add("imagen-activa");
    });
  });
});

/* ============================================================
   VISTA GENERAL
   (carrusel de portada con contador/flechas dobles,
   mosaico de fotos con modal "ver más")
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const carrusel = document.querySelector(".carrusel");

  if (!carrusel) {
    return;
  }

  const contenido = carrusel.querySelector(".carrusel-contenido");
  const imagenes = [...contenido.querySelectorAll("img")];
  const puntos = carrusel.querySelector(".puntos");
  const contador = carrusel.querySelector(".contador");
  const anterior = carrusel.querySelector(".flecha--anterior");
  const siguiente = carrusel.querySelector(".flecha--siguiente");
  let imagenActual = 0;
  let inicioToqueCarrusel = 0;

  function mostrarImagen(indice) {
    imagenActual = (indice + imagenes.length) % imagenes.length;
    imagenes.forEach((imagen, indiceImagen) => {
      imagen.classList.toggle("activo", indiceImagen === imagenActual);
    });
    contador.textContent = imagenActual + 1;

    puntos.querySelectorAll("button").forEach((punto, indicePunto) => {
      punto.classList.toggle("activo", indicePunto === imagenActual);
    });
  }

  imagenes.forEach((_, indice) => {
    const punto = document.createElement("button");
    punto.type = "button";
    punto.setAttribute("aria-label", `Ver imagen ${indice + 1}`);
    punto.addEventListener("click", () => mostrarImagen(indice));
    puntos.appendChild(punto);
  });

  anterior.addEventListener("click", () => mostrarImagen(imagenActual - 1));
  siguiente.addEventListener("click", () => mostrarImagen(imagenActual + 1));
  mostrarImagen(0);

  let intervaloCarrusel = setInterval(() => {
    mostrarImagen(imagenActual + 1);
  }, 2000);

  function reiniciarCarrusel() {
    clearInterval(intervaloCarrusel);
    intervaloCarrusel = setInterval(() => {
      mostrarImagen(imagenActual + 1);
    }, 2000);
  }

  anterior.addEventListener("click", reiniciarCarrusel);
  siguiente.addEventListener("click", reiniciarCarrusel);
  puntos.addEventListener("click", reiniciarCarrusel);
  carrusel.addEventListener("mouseenter", () => clearInterval(intervaloCarrusel));
  carrusel.addEventListener("mouseleave", reiniciarCarrusel);
  carrusel.addEventListener("touchstart", (evento) => {
    inicioToqueCarrusel = evento.changedTouches[0].clientX;
    clearInterval(intervaloCarrusel);
  }, { passive: true });

  carrusel.addEventListener("touchend", (evento) => {
    const desplazamiento = evento.changedTouches[0].clientX - inicioToqueCarrusel;

    if (Math.abs(desplazamiento) >= 50) {
      mostrarImagen(imagenActual + (desplazamiento < 0 ? 1 : -1));
    }

    reiniciarCarrusel();
  }, { passive: true });

  const mosaico = document.querySelector(".mosaico");
  const verMas = mosaico?.querySelector(".ver-mas");
  const fotosMosaico = mosaico ? [...mosaico.querySelectorAll("img")] : [];
  const modal = document.querySelector(".modal");

  if (!verMas || fotosMosaico.length <= 7 || !modal) {
    return;
  }

  const imagenModal = modal.querySelector(".modal-imagen");
  const contadorModal = modal.querySelector(".modal-contador");
  const cerrarModal = modal.querySelector(".modal-cerrar");
  const anteriorModal = modal.querySelector(".modal-flecha--anterior");
  const siguienteModal = modal.querySelector(".modal-flecha--siguiente");
  let fotoActual = 0;
  let modalAbiertoConHistorial = false;
  let inicioToque = 0;

  function mostrarFotoModal(indice) {
    fotoActual = (indice + fotosMosaico.length) % fotosMosaico.length;
    const foto = fotosMosaico[fotoActual];
    imagenModal.src = foto.src;
    imagenModal.alt = foto.alt;
    contadorModal.textContent = `${fotoActual + 1} / ${fotosMosaico.length}`;
  }

  function cerrarGaleria(desdeHistorial = false) {
    modal.hidden = true;
    document.body.style.overflow = "";
    modalAbiertoConHistorial = false;
    verMas.focus();

    if (!desdeHistorial && history.state?.modalGaleria) {
      history.back();
    }
  }

  verMas.addEventListener("click", () => {
    mostrarFotoModal(6);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    history.pushState({ modalGaleria: true }, "");
    modalAbiertoConHistorial = true;
    cerrarModal.focus();
  });

  cerrarModal.addEventListener("click", cerrarGaleria);
  anteriorModal.addEventListener("click", () => mostrarFotoModal(fotoActual - 1));
  siguienteModal.addEventListener("click", () => mostrarFotoModal(fotoActual + 1));

  modal.addEventListener("touchstart", (evento) => {
    inicioToque = evento.changedTouches[0].clientX;
  }, { passive: true });

  modal.addEventListener("touchend", (evento) => {
    const desplazamiento = evento.changedTouches[0].clientX - inicioToque;

    if (Math.abs(desplazamiento) < 50) {
      return;
    }

    mostrarFotoModal(fotoActual + (desplazamiento < 0 ? 1 : -1));
  }, { passive: true });

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      cerrarGaleria();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (modal.hidden) {
      return;
    }

    if (evento.key === "Escape") {
      cerrarGaleria();
    }

    if (evento.key === "ArrowLeft") {
      mostrarFotoModal(fotoActual - 1);
    }

    if (evento.key === "ArrowRight") {
      mostrarFotoModal(fotoActual + 1);
    }
  });

  window.addEventListener("popstate", () => {
    if (modal.hidden || !modalAbiertoConHistorial) {
      return;
    }

    cerrarGaleria(true);
  });
});