document.addEventListener("DOMContentLoaded", () => {
  const enlaceMapa = document.querySelector(".enlace-mapa a");

  if (enlaceMapa && enlaceMapa.getAttribute("href") === "#") {
    enlaceMapa.addEventListener("click", (evento) => {
      evento.preventDefault();
    });
  }

  const facebook = document.querySelector(".fb-page");

  if (facebook) {
    const ajustarFacebook = () => {
      facebook.style.width = "100%";
      facebook.style.maxWidth = "100%";

      facebook.querySelectorAll(":scope > span, :scope > span > iframe").forEach((elemento) => {
        elemento.style.width = "100%";
        elemento.style.maxWidth = "100%";
        elemento.style.minWidth = "0";
        elemento.style.height = "100%";
        elemento.style.minHeight = "100%";
      });
    };

    const observadorFacebook = new MutationObserver(ajustarFacebook);
    observadorFacebook.observe(facebook, { childList: true, subtree: true });
    ajustarFacebook();
  }
}); 

