const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    const portadaAltura = document.querySelector(".video-container").offsetHeight;

    if (window.scrollY > portadaAltura * 0.8) {
        header.classList.add("scroleado");
    } else {
        header.classList.remove("scroleado");
    }
});

function toggleMenu() {
    document.getElementById("sideMenu").classList.toggle("active");
    document.getElementById("menuOverlay").classList.toggle("active");
}
