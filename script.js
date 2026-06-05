

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
   CARRUSEL OPTIMIZADO (iPhone + Android + PC)
============================================================ */

const slidesContainer = document.getElementById("slides");

let media = [];
let index = 0;
let autoPlayInterval = null;

/* =========================
   CARGA DESDE JSON
========================= */

async function loadMedia() {
    try {
        const res = await fetch("img/carrusel/media.json", {
            cache: "force-cache"
        });

        media = await res.json();

        // mezclar
        media.sort(() => Math.random() - 0.5);

        buildCarousel();

    } catch (err) {
        console.error("Error cargando media.json:", err);
    }
}

loadMedia();

/* =========================
   RESPONSIVE
========================= */

function getItemsPerSlide() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

window.addEventListener("resize", () => buildCarousel());

/* =========================
   CREAR CARRUSEL
========================= */

function buildCarousel() {
    if (!media.length) return;

    slidesContainer.innerHTML = "";

    const itemsPerSlide = getItemsPerSlide();
    let i = 0;

    while (i < media.length) {
        const group = media.slice(i, i + itemsPerSlide);
        i += itemsPerSlide;

        createSlide(group);
    }

    initCarousel();
}

/* =========================
   CREAR SLIDE
========================= */

function createSlide(group) {
    const slide = document.createElement("div");
    slide.classList.add("slide-group");

    group.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("slide-item");

        let el;

        if (item.type === "image") {
            el = document.createElement("img");
            el.src = item.src;
            el.loading = "lazy";
        }

        if (item.type === "video") {
            el = document.createElement("video");

            const source = document.createElement("source");
            source.src = item.src;
            source.type = "video/mp4";

            el.appendChild(source);

            el.muted = true;
            el.playsInline = true;
            el.loop = true;
            el.preload = "metadata";

            const isMobile = window.innerWidth <= 768;
            if (!isMobile) el.autoplay = true;
        }

        el.style.width = "100%";
        el.style.height = "100%";
        el.style.objectFit = "cover";

        wrapper.appendChild(el);
        slide.appendChild(wrapper);
    });

    slidesContainer.appendChild(slide);
}

/* =========================
   CARRUSEL LOGIC
========================= */

function initCarousel() {
    const totalSlides = slidesContainer.children.length;
    if (!totalSlides) return;

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

/* =========================
   FIX IMPORTANTE iPHONE
   (autoplay real tras interacción)
========================= */

document.addEventListener("touchstart", () => {
    document.querySelectorAll("video").forEach(v => {
        v.play().catch(() => { });
    });
}, { once: true });

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

    // ============================================================
    // CARGA DE IMÁGENES (OPTIMIZADA)
    // ============================================================

    function loadImages(container, folder, callback) {

        const images = [];

        // 🔥 MEJORA: carga directa sin "maxImages" forzado
        // ahora solo intenta hasta que falle consecutivamente

        let i = 1;
        let failCount = 0;
        const maxFails = 3;

        function tryLoad() {
            const img = new Image();
            img.src = `img/platos/${folder}/${i}.png`;

            img.onload = () => {
                images.push({
                    src: img.src
                });

                i++;
                failCount = 0;
                tryLoad();
            };

            img.onerror = () => {
                i++;
                failCount++;

                if (failCount >= maxFails) {
                    callback(images);
                    return;
                }

                tryLoad();
            };
        }

        tryLoad();
    }

    // ============================================================
    // CARRUSEL OPTIMIZADO
    // ============================================================

    function buildCarousel(container, images) {

        const track = document.createElement("div");
        track.className = "carousel-track";

        const fragment = document.createDocumentFragment();

        for (let img of images) {
            const item = document.createElement("div");
            item.className = "carousel-item";

            const element = document.createElement("img");
            element.src = img.src;
            element.loading = "lazy";
            element.decoding = "async";

            item.appendChild(element);
            fragment.appendChild(item);
        }

        track.appendChild(fragment);

        container.innerHTML = "";
        container.appendChild(track);

        // ========================================================
        // ESTADO
        // ========================================================

        let index = 0;
        const total = images.length;

        const isMobile = () => window.innerWidth <= 768;

        // ========================================================
        // BOTONES
        // ========================================================

        const btnPrev = document.createElement("button");
        const btnNext = document.createElement("button");

        btnPrev.className = "plato-prev";
        btnNext.className = "plato-next";

        btnPrev.innerHTML = "‹";
        btnNext.innerHTML = "›";

        container.appendChild(btnPrev);
        container.appendChild(btnNext);

        // ========================================================
        // MEDIDAS (OPTIMIZADO - menos reflow)
        // ========================================================

        function getMetrics() {
            const item = track.querySelector(".carousel-item");

            if (!item) {
                return { width: 0, gap: 0 };
            }

            const styles = getComputedStyle(track);

            return {
                width: item.offsetWidth,
                gap: parseInt(styles.gap || "0", 10)
            };
        }

        function getVisible() {
            const { width, gap } = getMetrics();
            if (!width) return 1;

            return Math.max(1, Math.floor(container.offsetWidth / (width + gap)));
        }

        function getMaxIndex() {
            return isMobile()
                ? total - 1
                : Math.max(0, total - getVisible());
        }

        // ========================================================
        // UPDATE OPTIMIZADO
        // ========================================================

        function update(animated = true) {

            const { width, gap } = getMetrics();
            const max = getMaxIndex();

            index = Math.min(Math.max(index, 0), max);

            const move = index * (width + gap);

            track.style.transition = animated ? "transform .4s ease" : "none";
            track.style.transform = `translate3d(-${move}px,0,0)`;
        }

        // ========================================================
        // AUTOPLAY (mejorado)
        // ========================================================

        let interval = null;

        function startAuto() {

            if (isMobile()) return;

            clearInterval(interval);

            interval = setInterval(() => {

                const max = getMaxIndex();

                index = (index >= max) ? 0 : index + 1;

                update();

            }, 3500);
        }

        startAuto();

        // ========================================================
        // BOTONES
        // ========================================================

        btnPrev.onclick = () => {
            index--;
            update();
        };

        btnNext.onclick = () => {
            index++;
            update();
        };

        // ========================================================
        // SWIPE (iOS mejorado)
        // ========================================================

        let startX = 0;
        let isDragging = false;

        track.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            clearInterval(interval);
        }, { passive: true });

        track.addEventListener("touchmove", (e) => {
            if (!isDragging) return;

            const diff = e.touches[0].clientX - startX;

            const { width, gap } = getMetrics();
            const move = index * (width + gap);

            track.style.transition = "none";
            track.style.transform = `translate3d(calc(-${move}px + ${diff}px),0,0)`;

        }, { passive: true });

        track.addEventListener("touchend", (e) => {

            if (!isDragging) return;

            isDragging = false;

            const diff = e.changedTouches[0].clientX - startX;

            if (diff > 60) index--;
            else if (diff < -60) index++;

            update();

            setTimeout(startAuto, 600);

        }, { passive: true });

        // ========================================================
        // RESIZE OPTIMIZADO
        // ========================================================

        let resizeTimer;

        window.addEventListener("resize", () => {

            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(() => {
                update(false);
            }, 120);

        });

        // INIT
        update(false);
    }

    // ============================================================
    // GALERÍA OPTIMIZADA
    // ============================================================

    function buildGallery(container, images) {

        const row = document.createElement("div");
        row.className = "gallery-row";

        const fragment = document.createDocumentFragment();

        for (let img of images) {
            const el = document.createElement("img");
            el.src = img.src;
            el.loading = "lazy";
            el.decoding = "async";
            fragment.appendChild(el);
        }

        row.appendChild(fragment);

        container.innerHTML = "";
        container.appendChild(row);
    }

    // ============================================================
    // INIT GENERAL
    // ============================================================

    document.querySelectorAll("[data-folder]").forEach(container => {

        const folder = container.dataset.folder;

        loadImages(container, folder, images => {

            if (!images.length) return;

            if (container.classList.contains("plato-carousel")) {
                buildCarousel(container, images);
            }

            if (container.classList.contains("plato-gallery")) {
                buildGallery(container, images);
            }

        });

    });

});
let lightboxItems = [];
let currentIndex = 0;

/* ============================================================
   INDEXACIÓN MÁS ROBUSTA (NO DEPENDE DE REFERENCIAS DOM)
============================================================ */

function updateLightboxItems() {
    const nodes = document.querySelectorAll(
        ".slide-item img, .slide-item video, " +
        ".plato-carousel .carousel-item img, " +
        ".plato-gallery .gallery-row img"
    );

    lightboxItems = Array.from(nodes).map((el, i) => ({
        src: el.currentSrc || el.src,
        type: el.tagName.toLowerCase(), // img | video
        node: el
    }));
}

/* ============================================================
   OPEN LIGHTBOX
============================================================ */

function openLightbox(index) {

    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    const video = document.getElementById("lightboxVideo");

    const item = lightboxItems[index];
    if (!item) return;

    // reset seguro iOS
    img.style.display = "none";
    video.style.display = "none";
    video.pause();
    video.removeAttribute("src");
    video.load();

    if (item.type === "img") {

        img.src = item.src;
        img.style.display = "block";

    } else if (item.type === "video") {

        video.src = item.src;
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = "metadata";

        video.style.display = "block";

        // iOS fix: play seguro
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    }

    lightbox.style.display = "flex";
}

/* ============================================================
   CLICK GLOBAL (MEJORADO)
============================================================ */

document.addEventListener("click", e => {

    const media = e.target.closest(
        ".slide-item img, .slide-item video, " +
        ".plato-carousel .carousel-item img, " +
        ".plato-gallery .gallery-row img"
    );

    if (!media) return;

    updateLightboxItems();

    const src = media.currentSrc || media.src;

    currentIndex = lightboxItems.findIndex(i => i.src === src);

    if (currentIndex === -1) return;

    openLightbox(currentIndex);
});

/* ============================================================
   NAVEGACIÓN
============================================================ */

document.getElementById("lightboxNext").onclick = () => {
    currentIndex = (currentIndex + 1) % lightboxItems.length;
    openLightbox(currentIndex);
};

document.getElementById("lightboxPrev").onclick = () => {
    currentIndex = (currentIndex - 1 + lightboxItems.length) % lightboxItems.length;
    openLightbox(currentIndex);
};

/* ============================================================
   CERRAR
============================================================ */

document.getElementById("lightboxClose").onclick = closeLightbox;

document.getElementById("lightbox").onclick = e => {
    if (e.target.id === "lightbox") closeLightbox();
};

function closeLightbox() {

    const lightbox = document.getElementById("lightbox");
    const video = document.getElementById("lightboxVideo");

    lightbox.style.display = "none";

    // reset fuerte (iOS fix real)
    video.pause();
    video.removeAttribute("src");
    video.load();
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
