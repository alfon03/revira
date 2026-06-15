

// MENU RESPONSIVE
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});

// =========================
// CONFIGURACIÓN
// =========================

const MEDIA_VERSION = "1"; // Cambia este número cuando actualices media.json

/* ============================================================
   CARRUSEL OPTIMIZADO (SAFE MULTI-PAGE VERSION)
============================================================ */

const slidesContainer = document.getElementById("slides");

let media = [];
let index = 0;
let autoPlayInterval = null;

/* =========================
   PROTECCIÓN GLOBAL
========================= */

// Si no existe el carrusel en esta página, no hacemos nada
if (!slidesContainer) {
    console.warn("Carrusel no encontrado en esta página (#slides). Script desactivado.");
} else {
    loadMedia();
}

/* =========================
   CARGA DESDE JSON
========================= */

async function loadMedia() {
    try {
        const res = await fetch(
            `img/carrusel/media.json?v=${MEDIA_VERSION}`
        );

        media = await res.json();

        // Mezclar correctamente (Fisher-Yates)
        shuffle(media);

        buildCarousel();

    } catch (err) {
        console.error("Error cargando media.json:", err);
    }
}

/* =========================
   MEZCLAR ARRAY
========================= */

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}

/* =========================
   RESPONSIVE
========================= */

function getItemsPerSlide() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

/* SOLO SI EXISTE CARRUSEL */
if (slidesContainer) {

    let resizeTimeout;

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            buildCarousel();
        }, 250);

    });
}

/* =========================
   CREAR CARRUSEL
========================= */

function buildCarousel() {

    if (!slidesContainer) return;
    if (!media.length) return;

    slidesContainer.innerHTML = "";

    const itemsPerSlide = getItemsPerSlide();

    let i = 0;

    while (i < media.length) {

        const group = media.slice(
            i,
            i + itemsPerSlide
        );

        i += itemsPerSlide;

        createSlide(group);
    }

    initCarousel();
}

/* =========================
   CREAR SLIDE
========================= */

function createSlide(group) {

    if (!slidesContainer) return;

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
            el.decoding = "async";
        }

        if (item.type === "video") {

            el = document.createElement("video");

            const source =
                document.createElement("source");

            source.src = item.src;
            source.type = "video/mp4";

            el.appendChild(source);

            el.muted = true;
            el.playsInline = true;
            el.loop = true;
            el.preload = "metadata";

            const isMobile =
                window.innerWidth <= 768;

            if (!isMobile) {
                el.autoplay = true;
            }
        }

        if (!el) return;

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

    if (!slidesContainer) return;

    const totalSlides =
        slidesContainer.children.length;

    if (!totalSlides) return;

    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }

    function updateSlide() {

        slidesContainer.style.transform =
            `translateX(-${index * 100}%)`;
    }

    const nextBtn =
        document.getElementById("nextBtn");

    const prevBtn =
        document.getElementById("prevBtn");

    if (nextBtn) {

        nextBtn.onclick = () => {

            index =
                (index + 1) % totalSlides;

            updateSlide();
        };
    }

    if (prevBtn) {

        prevBtn.onclick = () => {

            index =
                (index - 1 + totalSlides) %
                totalSlides;

            updateSlide();
        };
    }

    let intervalTime = 4500;

    if (window.innerWidth <= 768) {
        intervalTime = 7000;
    } else if (window.innerWidth <= 1024) {
        intervalTime = 5500;
    }

    autoPlayInterval = setInterval(() => {

        index =
            (index + 1) % totalSlides;

        updateSlide();

    }, intervalTime);
}

/* =========================
   FIX iPHONE AUTOPLAY
========================= */

document.addEventListener("touchstart", () => {

    document.querySelectorAll("video")
        .forEach(v => {

            v.play()
                .catch(() => { });

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
    // CONFIG
    // ============================================================

    const CONFIG = {
        basePath: "img/platos",
        mediaVersion: "1", // 👈 cambia esto cuando actualices JSON
        carousel: {
            mobileBreakpoint: 768,
            autoplayDelay: 3500,
            swipeThreshold: 60,
            resizeDebounce: 120,
            transition: "transform .4s ease"
        }
    };

    // ============================================================
    // LOAD IMAGES (CACHE OPTIMIZADO)
    // ============================================================

    async function loadImages(folder, callback) {

        try {
            const res = await fetch(
                `${CONFIG.basePath}/${folder}/media.json?v=${CONFIG.mediaVersion}`,
                { cache: "force-cache" }
            );

            if (!res.ok) {
                console.warn(`No media.json en ${folder}`);
                callback([]);
                return;
            }

            const data = await res.json();

            const images = (data || [])
                .filter(item => item?.type === "image" && item?.src);

            callback(images);

        } catch (err) {
            console.error(`Error cargando media.json en ${folder}`, err);
            callback([]);
        }
    }

    // ============================================================
    // CARRUSEL
    // ============================================================

    function buildCarousel(container, images) {

        const cfg = CONFIG.carousel;

        const track = document.createElement("div");
        track.className = "carousel-track";

        const fragment = document.createDocumentFragment();

        images.forEach((img, i) => {

            const item = document.createElement("div");
            item.className = "carousel-item";

            const el = document.createElement("img");
            el.src = img.src;
            el.dataset.full = img.full;
            el.loading = "lazy";
            el.decoding = "async";

            // 🚀 solo primeras imágenes con prioridad alta
            if (i < 2) el.fetchPriority = "high";

            item.appendChild(el);
            fragment.appendChild(item);
        });

        track.appendChild(fragment);

        container.innerHTML = "";
        container.appendChild(track);

        let index = 0;
        let interval = null;
        let resizeTimer = null;

        const total = images.length;

        const isMobile = () =>
            window.innerWidth <= cfg.mobileBreakpoint;

        let itemWidth = 0;
        let gap = 0;

        function measure() {
            const item = track.firstElementChild;
            if (!item) return;

            const styles = getComputedStyle(track);

            itemWidth = item.offsetWidth;
            gap = parseInt(styles.gap || "0", 10);
        }

        function getVisible() {
            return Math.max(
                1,
                Math.floor(container.offsetWidth / (itemWidth + gap))
            );
        }

        function getMaxIndex() {
            return isMobile()
                ? total - 1
                : Math.max(0, total - getVisible());
        }

        function update(animated = true) {

            const max = getMaxIndex();
            index = Math.min(Math.max(index, 0), max);

            const move = index * (itemWidth + gap);

            track.style.transition = animated ? cfg.transition : "none";
            track.style.transform = `translate3d(-${move}px,0,0)`;
        }

        function startAuto() {

            if (isMobile()) return;

            clearInterval(interval);

            interval = setInterval(() => {

                const max = getMaxIndex();
                index = (index >= max) ? 0 : index + 1;

                update();

            }, cfg.autoplayDelay);
        }

        // init medidas UNA sola vez al inicio
        measure();
        update(false);
        startAuto();

        // BOTONES
        const btnPrev = document.createElement("button");
        const btnNext = document.createElement("button");

        btnPrev.className = "plato-prev";
        btnNext.className = "plato-next";

        btnPrev.textContent = "‹";
        btnNext.textContent = "›";

        container.appendChild(btnPrev);
        container.appendChild(btnNext);

        btnPrev.onclick = () => { index--; update(); };
        btnNext.onclick = () => { index++; update(); };

        // SWIPE
        let startX = 0;
        let dragging = false;

        track.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
            dragging = true;
            clearInterval(interval);
        }, { passive: true });

        track.addEventListener("touchmove", (e) => {

            if (!dragging) return;

            const diff = e.touches[0].clientX - startX;

            const move = index * (itemWidth + gap);

            track.style.transition = "none";
            track.style.transform =
                `translate3d(calc(-${move}px + ${diff}px),0,0)`;

        }, { passive: true });

        track.addEventListener("touchend", (e) => {

            dragging = false;

            const diff = e.changedTouches[0].clientX - startX;

            if (diff > cfg.swipeThreshold) index--;
            else if (diff < -cfg.swipeThreshold) index++;

            update();
            setTimeout(startAuto, 600);

        }, { passive: true });

        // RESIZE (OPTIMIZADO GLOBALMENTE)
        window.addEventListener("resize", () => {

            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(() => {
                measure();   // 👈 antes lo recalculabas demasiado
                update(false);
            }, cfg.resizeDebounce);

        });
    }

    // ============================================================
    // GALERÍA
    // ============================================================

    function buildGallery(container, images) {

        const row = document.createElement("div");
        row.className = "gallery-row";

        const fragment = document.createDocumentFragment();

        images.forEach((img, i) => {

            const el = document.createElement("img");
            el.src = img.src;
            el.loading = "lazy";
            el.decoding = "async";

            if (i < 2) el.fetchPriority = "high";

            fragment.appendChild(el);
        });

        row.appendChild(fragment);

        container.innerHTML = "";
        container.appendChild(row);
    }

    // ============================================================
    // INIT
    // ============================================================

    document.querySelectorAll("[data-folder]").forEach(container => {

        const folder = container.dataset.folder;

        loadImages(folder, images => {

            const counter =
                container.parentElement.querySelector(".section-count");

            if (counter) {
                counter.textContent = `(${images.length})`;
            }

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
   INDEXACIÓN (SOLO 1 VEZ)
============================================================ */

function initLightboxItems() {

    const nodes = document.querySelectorAll(
        ".slide-item img, .slide-item video, " +
        ".plato-carousel .carousel-item img, " +
        ".plato-gallery .gallery-row img"
    );

    lightboxItems = Array.from(nodes).map(el => ({
        src: el.currentSrc || el.src,
        type: el.tagName.toLowerCase(),
        node: el
    }));
}

/* Ejecutar una sola vez */
document.addEventListener("DOMContentLoaded", initLightboxItems);

/* ============================================================
   OPEN LIGHTBOX
============================================================ */

function openLightbox(index) {

    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    const video = document.getElementById("lightboxVideo");
    const counter = document.getElementById("lightboxCounter");

    if (!lightbox || !img || !video) return;

    const item = lightboxItems[index];
    if (!item) return;

    currentIndex = index;

    if (counter) {
        counter.textContent =
            `${index + 1} / ${lightboxItems.length}`;
    }

    img.style.display = "none";

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.style.display = "none";

    if (item.type === "img") {

        // 🔥 mejora: fuerza carga inmediata solo en lightbox
        img.src = item.full || item.src;
        img.loading = "eager";
        img.decoding = "async";
        img.style.display = "block";

    } else if (item.type === "video") {

        video.src = item.src;
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = "metadata";

        video.style.display = "block";

        video.play().catch(() => { });
    }

    lightbox.style.display = "flex";
}

/* ============================================================
   CLICK GLOBAL (MUCHO MÁS RÁPIDO)
============================================================ */

document.addEventListener("click", e => {

    const media = e.target.closest(
        ".slide-item img, .slide-item video, " +
        ".plato-carousel .carousel-item img, " +
        ".plato-gallery .gallery-row img"
    );

    if (!media) return;

    // ❌ ya no recalcula todo cada click

    const src = media.currentSrc || media.src;

    const index = lightboxItems.findIndex(i => i.src === src);

    if (index === -1) return;

    openLightbox(index);
});

/* ============================================================
   NAVEGACIÓN
============================================================ */

const nextBtn = document.getElementById("lightboxNext");
const prevBtn = document.getElementById("lightboxPrev");
const closeBtn = document.getElementById("lightboxClose");
const lightbox = document.getElementById("lightbox");

if (nextBtn) {
    nextBtn.onclick = () => {
        openLightbox((currentIndex + 1) % lightboxItems.length);
    };
}

if (prevBtn) {
    prevBtn.onclick = () => {
        openLightbox(
            (currentIndex - 1 + lightboxItems.length) %
            lightboxItems.length
        );
    };
}

if (closeBtn) {
    closeBtn.onclick = closeLightbox;
}

if (lightbox) {
    lightbox.onclick = e => {
        if (e.target.id === "lightbox") closeLightbox();
    };
}

/* ============================================================
   CLOSE
============================================================ */

function closeLightbox() {

    const lightbox = document.getElementById("lightbox");
    const video = document.getElementById("lightboxVideo");

    if (!lightbox) return;

    lightbox.style.display = "none";

    if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
    }
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


/* ============================================================
   ANCLA ACTIVA SEGÚN SCROLL
============================================================ */
const anchorLinks = document.querySelectorAll(".anchors a");

const sections = Array.from(anchorLinks)
    .map(link => {
        const href = link.getAttribute("href");

        if (!href || !href.startsWith("#")) return null;

        return document.querySelector(href);
    })
    .filter(Boolean);

let lastActiveLink = null;

/* ============================================================
   OBSERVER (SCROLL SPY OPTIMIZADO)
============================================================ */
if (sections.length && anchorLinks.length) {

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                const id = entry.target.id;

                const activeLink = Array.from(anchorLinks).find(link =>
                    link.getAttribute("href") === `#${id}`
                );

                if (!activeLink) return;

                // 🔥 Evita recalcular si ya es el mismo
                if (lastActiveLink === activeLink) return;

                // Quitar activos anteriores + activar actual
                anchorLinks.forEach(link =>
                    link.classList.toggle("active-anchor", link === activeLink)
                );

                lastActiveLink = activeLink;

                // 🔥 Auto-scroll suave centrado (UX tipo app)
                activeLink.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest"
                });

            });

        },
        {
            root: null,
            threshold: 0.4,
            rootMargin: "0px 0px -40% 0px"
        }
    );

    sections.forEach(section => observer.observe(section));
}

/* ============================================================
   APARICIÓN SUAVE DE SECCIONES
============================================================ */

const revealObserver = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }

        });

    },
    {
        threshold: 0.15
    }
);

sections.forEach(section => {
    revealObserver.observe(section);
});


function updateAnchorsPosition() {

    const header = document.querySelector("header");
    const anchors = document.querySelector(".anchors-row");

    if (!header || !anchors) return;

    anchors.style.top = `${header.offsetHeight}px`;
}

window.addEventListener("load", updateAnchorsPosition);
window.addEventListener("resize", updateAnchorsPosition);

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("suggestionsModal");
    const closeBtn = document.getElementById("closeModal");

    // mostrar modal al entrar
    modal.classList.remove("hidden");

    // cerrar
    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // cerrar al hacer click fuera
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });
});