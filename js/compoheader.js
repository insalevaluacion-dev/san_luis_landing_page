document.addEventListener("DOMContentLoaded", () => {
  fetch("/components/header.html")
    .then(response => response.text())
    .then(data => {
      const contenedor = document.getElementById("header-container");
      contenedor.innerHTML = data;
      contenedor.dispatchEvent(new CustomEvent("header:cargado"));
    })
    .catch(error => console.error("Error cargando header:", error));
});