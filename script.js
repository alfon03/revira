

// MENU RESPONSIVE
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});


// =========================
// CONFIGURACIÓN
// =========================

/* ============================================================
   CARRUSEL IMÁGENES + VIDEOS
============================================================ */

const mediaFolder = "img/carrusel/";
const maxFiles = 50;
const slidesContainer = document.getElementById("slides");

let media = [];
let loaded = 0;

// Extensiones permitidas
const imageExt = ["png", "jpeg", "webp"];
const videoExt = ["mp4", "MP4", "webm", "ogg", "mov", "m4v"];

// =========================
// CARGAR IMÁGENES Y VIDEOS
// =========================

for (let i = 1; i <= maxFiles; i++) {
    loadMedia(i);
}

function loadMedia(i) {
    // Probar imágenes
    imageExt.forEach(ext => {
        const img = new Image();
        img.src = `${mediaFolder}${i}.${ext}`;

        img.onload = () => {
            media.push({ type: "image", element: img });
            checkFinish();
        };

        img.onerror = () => checkFinish();
    });

    // Probar videos
    videoExt.forEach(ext => {
        const video = document.createElement("video");
        video.src = `${mediaFolder}${i}.${ext}`;
        video.muted = true;
        video.playsInline = true;

        video.onloadeddata = () => {
            media.push({ type: "video", element: video });
            checkFinish();
        };

        video.onerror = () => checkFinish();
    });
}

function checkFinish() {
    loaded++;

    if (loaded === maxFiles * (imageExt.length + videoExt.length)) {
        media = media.sort(() => Math.random() - 0.5); // mezclar
        buildCarousel();
    }
}

// =========================
// RESPONSIVE
// =========================

function getItemsPerSlide() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

// =========================
// CREAR CARRUSEL
// =========================

function buildCarousel() {
    slidesContainer.innerHTML = "";

    const itemsPerSlide = getItemsPerSlide();
    let i = 0;

    while (i < media.length) {
        const group = [];

        for (let j = 0; j < itemsPerSlide && i < media.length; j++) {
            group.push(media[i]);
            i++;
        }

        createSlide(group);
    }

    initCarousel();
}

window.addEventListener("resize", () => buildCarousel());

// =========================
// CREAR SLIDE
// =========================

function createSlide(group) {
    const slide = document.createElement("div");
    slide.classList.add("slide-group");

    group.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("slide-item");

        const clone = item.element.cloneNode(true);
        const isMobile = window.innerWidth <= 768;

        if (item.type === "video") {

            // PC → autoplay, móvil → NO autoplay
            clone.autoplay = !isMobile;
            clone.loop = !isMobile;
            clone.muted = true;
            clone.playsInline = true;

            clone.style.display = "block";
            clone.style.width = "100%";
            clone.style.height = "100%";
            clone.style.objectFit = "cover";

            // poster automatico
            const baseName = clone.src.split('.').slice(0, -1).join('.');
            clone.setAttribute("poster", baseName + ".jpg");
        }

        wrapper.appendChild(clone);
        slide.appendChild(wrapper);
    });

    slidesContainer.appendChild(slide);
}


// =========================
// CARRUSEL
// =========================

let index = 0;
let autoPlayInterval = null;

function initCarousel() {
    const totalSlides = slidesContainer.children.length;
    if (totalSlides === 0) return;

    if (autoPlayInterval) clearInterval(autoPlayInterval);

    function updateSlide() {
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    }

    document.getElementById("nextBtn").onclick = () => {
        index = (index + 1) % totalSlides;
        updateSlide();
    };

    document.getElementById("prevBtn").onclick = () => {
        index = (index - 1 + totalSlides) % totalSlides;
        updateSlide();
    };

    let intervalTime = 4500;
    if (window.innerWidth <= 768) intervalTime = 7000;
    else if (window.innerWidth <= 1024) intervalTime = 5500;

    autoPlayInterval = setInterval(() => {
        index = (index + 1) % totalSlides;
        updateSlide();
    }, intervalTime);
}


// BOTÓN IR ARRIBA
const btnTop = document.getElementById("btnTop");

window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        btnTop.classList.add("show");
    } else {
        btnTop.classList.remove("show");
    }
});

btnTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


document.addEventListener("DOMContentLoaded", () => {

    const maxImages = 50;

    // ============================================================
    // CARGA AUTOMÁTICA DE IMÁGENES
    // ============================================================

    function loadImages(container, folder, callback) {
        let images = [];
        let loaded = 0;

        for (let i = 1; i <= maxImages; i++) {
            const img = new Image();
            img.src = `img/platos/${folder}/${i}.png`;

            img.onload = () => {
                images.push(img);
                check();
            };

            img.onerror = () => check();
        }

        function check() {
            loaded++;
            if (loaded === maxImages) callback(images);
        }


    }

    // ============================================================
    // CARRUSEL (varias imágenes visibles)
    // ============================================================
    // ============================================================
    // CARRUSEL PREMIUM RESPONSIVE
    // ============================================================

    function buildCarousel(container, images) {

        // ========================================================
        // CREAR TRACK
        // ========================================================
        const track = document.createElement("div");
        track.classList.add("carousel-track");

        images.forEach(img => {

            const item = document.createElement("div");
            item.classList.add("carousel-item");

            const element = document.createElement("img");
            element.src = img.src;

            item.appendChild(element);
            track.appendChild(item);
        });

        container.innerHTML = "";
        container.appendChild(track);

        // ========================================================
        // DETECTAR MÓVIL
        // ========================================================
        function isMobile() {
            return window.innerWidth <= 768;
        }

        // ========================================================
        // CREAR FLECHAS
        // ========================================================
        let btnPrev = document.createElement("button");
        btnPrev.classList.add("plato-prev");
        btnPrev.innerHTML = `
        <span class="material-symbols-outlined">
            chevron_left
        </span>
    `;

        let btnNext = document.createElement("button");
        btnNext.classList.add("plato-next");
        btnNext.innerHTML = `
        <span class="material-symbols-outlined">
            chevron_right
        </span>
    `;

        container.appendChild(btnPrev);
        container.appendChild(btnNext);

        // ========================================================
        // VARIABLES
        // ========================================================
        let index = 0;
        const total = images.length;

        // ========================================================
        // OBTENER ITEM WIDTH
        // ========================================================
        function getItemData() {

            const item = track.querySelector(".carousel-item");

            if (!item) {
                return {
                    width: 0,
                    gap: 0
                };
            }

            const width = item.offsetWidth;
            const gap = parseInt(getComputedStyle(track).gap) || 0;

            return {
                width,
                gap
            };
        }

        // ========================================================
        // ITEMS VISIBLES
        // ========================================================
        function getVisibleItems() {

            const { width, gap } = getItemData();

            if (width === 0) return 1;

            return Math.round(container.offsetWidth / (width + gap));
        }

        // ========================================================
        // MAX INDEX CORRECTO
        // ========================================================
        function getMaxIndex() {

            // móvil = una imagen por slide
            if (isMobile()) {
                return total - 1;
            }

            // tablet / desktop
            const visible = getVisibleItems();

            return Math.max(0, total - visible);
        }

        // ========================================================
        // UPDATE
        // ========================================================
        function update(animated = true) {

            const { width, gap } = getItemData();

            const maxIndex = getMaxIndex();

            // evitar slides vacíos
            index = Math.max(0, Math.min(index, maxIndex));

            const move = index * (width + gap);

            track.style.transition = animated
                ? "transform 0.5s ease"
                : "none";

            track.style.transform = `translateX(-${move}px)`;
        }

        // ========================================================
        // AUTOPLAY
        // ========================================================
        let intervalTime = 3000;

        if (window.innerWidth <= 1024 && !isMobile()) {
            intervalTime = 4500;
        }

        if (container._interval) {
            clearInterval(container._interval);
        }

        function startAutoplay() {

            if (isMobile()) return;

            container._interval = setInterval(() => {

                const maxIndex = getMaxIndex();

                if (index < maxIndex) {
                    index++;
                } else {
                    index = 0;
                }

                update();

            }, intervalTime);
        }

        startAutoplay();

        // ========================================================
        // BOTONES
        // ========================================================
        btnPrev.addEventListener("click", () => {

            index--;

            update();
        });

        btnNext.addEventListener("click", () => {

            index++;

            update();
        });

        // ========================================================
        // SWIPE TÁCTIL
        // ========================================================
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        track.addEventListener("touchstart", (e) => {

            startX = e.touches[0].clientX;
            currentX = startX;

            isDragging = true;

            clearInterval(container._interval);
        });

        track.addEventListener("touchmove", (e) => {

            if (!isDragging) return;

            currentX = e.touches[0].clientX;

            const diff = currentX - startX;

            const { width, gap } = getItemData();

            const move = index * (width + gap);

            track.style.transition = "none";

            track.style.transform =
                `translateX(calc(-${move}px + ${diff}px))`;

        });

        track.addEventListener("touchend", () => {

            if (!isDragging) return;

            isDragging = false;

            const diff = currentX - startX;

            // sensibilidad swipe
            if (diff > 60) {
                index--;
            }
            else if (diff < -60) {
                index++;
            }

            update();

            if (!isMobile()) {

                setTimeout(() => {
                    startAutoplay();
                }, 800);
            }
        });

        // ========================================================
        // RESIZE
        // ========================================================
        let resizeTimeout;

        window.addEventListener("resize", () => {

            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {

                update(false);

            }, 100);
        });

        // ========================================================
        // INIT
        // ========================================================
        update(false);
    }

    // ============================================================
    // GALERÍA TIPO IPHONE (scroll horizontal)
    // ============================================================

    function buildGallery(container, images) {
        const row = document.createElement("div");
        row.classList.add("gallery-row");

        images.forEach(img => {
            const element = document.createElement("img");
            element.src = img.src;
            row.appendChild(element);
        });

        container.appendChild(row);
    }

    // ============================================================
    // DETECTAR TIPO DE COMPONENTE
    // ============================================================

    document.querySelectorAll("[data-folder]").forEach(container => {
        const folder = container.dataset.folder;

        loadImages(container, folder, images => {
            if (images.length === 0) return;

            if (container.classList.contains("plato-carousel")) {
                buildCarousel(container, images);
            }

            if (container.classList.contains("plato-gallery")) {
                buildGallery(container, images);
            }
        });
    });

});

/* ============================================================
   LIGHTBOX PREMIUM CON NAVEGACIÓN (IMG + VIDEO)
   - Carrusel principal (.slide-item img, video)
   - Carrusel platos (.plato-carousel .carousel-item img)
   - Fototeca (.plato-gallery .gallery-row img)
============================================================ */

let lightboxItems = [];
let currentIndex = 0;

// Actualizar lista de elementos (por si se reconstruyen carruseles)
function updateLightboxItems() {
    lightboxItems = Array.from(
        document.querySelectorAll(
            ".slide-item img, .slide-item video, " +
            ".plato-carousel .carousel-item img, " +
            ".plato-gallery .gallery-row img"
        )
    );
}
updateLightboxItems();

// ABRIR LIGHTBOX al hacer clic en cualquier imagen/video de esos carruseles
document.addEventListener("click", e => {
    const media = e.target.closest(
        ".slide-item img, .slide-item video, " +
        ".plato-carousel .carousel-item img, " +
        ".plato-gallery .gallery-row img"
    );
    if (!media) return;

    updateLightboxItems(); // refrescar lista por si algo cambió

    currentIndex = lightboxItems.indexOf(media);
    if (currentIndex === -1) return;

    openLightbox(currentIndex);
});

function openLightbox(index) {
    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    const video = document.getElementById("lightboxVideo");

    // Reset
    img.style.display = "none";
    video.style.display = "none";
    video.pause();

    const item = lightboxItems[index];

    if (item.tagName === "IMG") {
        img.src = item.src;
        img.style.display = "block";
    } else {
        video.src = item.src;
        video.muted = true;      // siempre silenciado
        video.style.display = "block";
        video.play();
    }

    lightbox.style.display = "flex";
}

// SIGUIENTE
document.getElementById("lightboxNext").onclick = () => {
    currentIndex = (currentIndex + 1) % lightboxItems.length;
    openLightbox(currentIndex);
};

// ANTERIOR
document.getElementById("lightboxPrev").onclick = () => {
    currentIndex = (currentIndex - 1 + lightboxItems.length) % lightboxItems.length;
    openLightbox(currentIndex);
};

// CERRAR
document.getElementById("lightboxClose").onclick = closeLightbox;

document.getElementById("lightbox").onclick = e => {
    if (e.target.id === "lightbox") closeLightbox();
};

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    const video = document.getElementById("lightboxVideo");

    lightbox.style.display = "none";
    video.pause();
}




async function loadLanguage(lang) {
    const response = await fetch(`lang/${lang}.json`);
    const translations = await response.json();

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    localStorage.setItem("lang", lang);
}

document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("lang") || "es";
    loadLanguage(savedLang);

    document.querySelectorAll("#language-switcher .flag").forEach(flag => {
        flag.addEventListener("click", () => {
            const lang = flag.dataset.lang;
            loadLanguage(lang);
        });
    });
});

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// Cambiar icono según el modo
function updateThemeIcon() {
    if (document.body.classList.contains("light-mode")) {
        themeIcon.textContent = "dark_mode"; // ☀️
    } else {
        themeIcon.textContent = "light_mode"; // 🌙
    }
}

// Cambiar logo según el modo
function updateLogo() {
    const logo = document.querySelector(".home-logo");
    if (!logo) return;

    if (document.body.classList.contains("light-mode")) {
        logo.src = "img/logo3.png";   // Logo para modo claro
    } else {
        logo.src = "img/logo.png";    // Logo para modo oscuro
    }
}

// ===============================
// MODO POR DEFECTO: CLARO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.remove("light-mode");
    } else {
        document.body.classList.add("light-mode");
    }

    updateThemeIcon();
    updateLogo();
});

// ===============================
// BOTÓN DE CAMBIO DE TEMA
// ===============================
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }

    updateThemeIcon();
    updateLogo();
});
