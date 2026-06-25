

// =========================
// CONFIGURACIÓN
// =========================
//carrusel pagina inicio con videos

const MEDIA_VERSION = "2"; // Cambia este número cuando actualices media.json

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


// carrusel pagina platos


document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // CONFIG
    // ============================================================

    const CONFIG = {
        basePath: "img/platos",
        mediaVersion: "2", // 👈 cambia esto cuando actualices JSON
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

    // carrusel pagina platos
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

//ampliar imagenes o videos

let lightboxItems = [];
let currentIndex = 0;

/* ============================================================
   INDEXACIÓN
============================================================ */

function updateLightboxItems() {

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

    /* =========================
       IMAGEN
    ========================= */

    if (item.type === "img") {

        img.src = item.src;
        img.style.display = "block";
    }

    /* =========================
       VIDEO
    ========================= */

    else if (item.type === "video") {

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
   CLICK GLOBAL
============================================================ */

document.addEventListener("click", e => {

    const media = e.target.closest(
        ".slide-item img, .slide-item video, " +
        ".plato-carousel .carousel-item img, " +
        ".plato-gallery .gallery-row img"
    );

    if (!media) return;

    // Actualiza por si los carruseles han cambiado
    updateLightboxItems();

    currentIndex = lightboxItems.findIndex(
        item => item.node === media
    );

    if (currentIndex === -1) return;

    openLightbox(currentIndex);
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

        if (!lightboxItems.length) return;

        currentIndex =
            (currentIndex + 1) % lightboxItems.length;

        openLightbox(currentIndex);
    };
}

if (prevBtn) {

    prevBtn.onclick = () => {

        if (!lightboxItems.length) return;

        currentIndex =
            (currentIndex - 1 + lightboxItems.length) %
            lightboxItems.length;

        openLightbox(currentIndex);
    };
}

if (closeBtn) {
    closeBtn.onclick = closeLightbox;
}

if (lightbox) {

    lightbox.onclick = e => {

        if (e.target.id === "lightbox") {
            closeLightbox();
        }
    };
}

/* ============================================================
   TECLADO
============================================================ */

document.addEventListener("keydown", e => {

    if (!lightbox ||
        lightbox.style.display !== "flex") {
        return;
    }

    if (e.key === "Escape") {
        closeLightbox();
    }

    if (e.key === "ArrowRight" &&
        lightboxItems.length) {

        currentIndex =
            (currentIndex + 1) % lightboxItems.length;

        openLightbox(currentIndex);
    }

    if (e.key === "ArrowLeft" &&
        lightboxItems.length) {

        currentIndex =
            (currentIndex - 1 + lightboxItems.length) %
            lightboxItems.length;

        openLightbox(currentIndex);
    }
});

/* ============================================================
   CLOSE
============================================================ */

function closeLightbox() {

    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    const video = document.getElementById("lightboxVideo");

    if (!lightbox) return;

    lightbox.style.display = "none";

    if (img) {
        img.removeAttribute("src");
    }

    if (video) {

        video.pause();

        video.removeAttribute("src");

        video.load();
    }
}


// cambio de idioma
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

// cambio de color
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



// anclas 

document.addEventListener("DOMContentLoaded", () => {

    /* ============================================
       ELEMENTOS
    ============================================ */

    const anchorsContainer = document.querySelector(".anchors");
    const anchorsRow = document.querySelector(".anchors-row");
    const header = document.querySelector("header");

    const anchorLinks = [
        ...document.querySelectorAll(".anchors a[href^='#']")
    ];

    if (!anchorLinks.length) return;

    const sections = [];
    const linksById = new Map();

    anchorLinks.forEach(link => {

        const id = link.getAttribute("href").slice(1);

        const section = document.getElementById(id);

        if (!section) {
            console.warn(`Sección no encontrada: #${id}`);
            return;
        }

        sections.push(section);
        linksById.set(id, link);

    });

    let activeId = null;

    /* ============================================
       ACTIVAR ANCLA
    ============================================ */

    function setActiveSection(id) {

        if (id === activeId) return;

        activeId = id;

        anchorLinks.forEach(link => {
            link.classList.remove("active-anchor");
        });

        const activeLink = linksById.get(id);

        if (!activeLink) return;

        activeLink.classList.add("active-anchor");

        if (anchorsContainer) {

            const containerRect =
                anchorsContainer.getBoundingClientRect();

            const linkRect =
                activeLink.getBoundingClientRect();

            const isOutside =
                linkRect.left < containerRect.left ||
                linkRect.right > containerRect.right;

            if (isOutside) {

                activeLink.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest"
                });

            }
        }
    }

    /* ============================================
       SCROLL SPY ULTRA PRECISO
    ============================================ */

    function updateActiveSection() {

        const headerHeight =
            header?.getBoundingClientRect().height || 0;

        const triggerLine =
            headerHeight + 120;

        let currentSection = sections[0];

        for (const section of sections) {

            const rect = section.getBoundingClientRect();

            if (rect.top <= triggerLine) {
                currentSection = section;
            } else {
                break;
            }

        }

        if (currentSection) {
            setActiveSection(currentSection.id);
        }
    }

    let ticking = false;

    function onScroll() {

        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {

            updateActiveSection();

            ticking = false;

        });

    }

    /* ============================================
       REVEAL ANIMATION
    ============================================ */

    const revealObserver = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }

        });

    }, {
        threshold: 0.08
    });

    sections.forEach(section => {
        revealObserver.observe(section);
    });

    /* ============================================
       POSICIÓN STICKY ANCHORS
    ============================================ */

    function updateAnchorsPosition() {

        if (!header || !anchorsRow) return;

        anchorsRow.style.top =
            `${Math.ceil(header.offsetHeight)}px`;

    }

    /* ============================================
       OBSERVADORES
    ============================================ */

    const resizeObserver = new ResizeObserver(() => {

        updateAnchorsPosition();
        updateActiveSection();

    });

    if (header) {
        resizeObserver.observe(header);
    }

    window.addEventListener(
        "scroll",
        onScroll,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        onScroll
    );

    /* ============================================
       INICIALIZACIÓN
    ============================================ */

    updateAnchorsPosition();

    requestAnimationFrame(() => {
        updateActiveSection();
    });

});

//sugerencias carta modal al entrar

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("suggestionsModal");
    const closeBtn = document.getElementById("closeModal");
    const closeBtnBottom = document.getElementById("closeModalBtn");

    function abrirModal() {

        modal.style.display = "flex";

        requestAnimationFrame(() => {
            modal.classList.add("show");
        });

        document.body.style.overflow = "hidden";
    }

    function cerrarModal() {

        modal.classList.remove("show");

        setTimeout(() => {

            modal.style.display = "";
            document.body.style.overflow = "";

        }, 550);

    }

    /* Mostrar automáticamente */
    abrirModal();

    /* Cerrar */
    closeBtn.addEventListener("click", cerrarModal);
    closeBtnBottom.addEventListener("click", cerrarModal);

    /* Click fuera */
    modal.addEventListener("click", (e) => {

        if (e.target === modal) {
            cerrarModal();
        }

    });

    /* ESC */
    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {
            cerrarModal();
        }

    });

});

document.addEventListener("DOMContentLoaded", () => {

    const secciones = {
        "bebida": "img/platos/bebida/",
        "bodega": "img/platos/bodega/",
        "panes": "img/platos/panes/",
        "tapas-frias": "img/platos/tapas-frias/",
        "tapas-calientes": "img/platos/tapas-calientes/",
        "montaditos": "img/platos/montaditos/",
        "carnes": "img/platos/carnes/",
        "chacinas": "img/platos/chacinas/",
        "peques": "img/platos/peques/",
        "pescados": "img/platos/pescados/",
        "postres": "img/platos/postres/"
    };

    const modal = document.getElementById("plato-modal");
    const modalImg = document.getElementById("modal-img");
    const btnPrev = document.getElementById("modal-prev");
    const btnNext = document.getElementById("modal-next");

    const btnTop = document.getElementById("btnTop");

    let images = [];
    let currentIndex = 0;


    /* =========================
       CARGA MENÚ
    ========================= */
    Object.entries(secciones).forEach(([id, ruta]) => {

        const contenedor = document.querySelector(`#${id} .menu-list`);
        if (!contenedor) return;

        fetch(ruta + "manifest.json")
            .then(r => r.json())
            .then(platos => {

                contenedor.innerHTML = "";

                platos.forEach(plato => {

                    const article = document.createElement("article");
                    article.className = "menu-item";

                    const imgs = plato.imgs || (plato.img ? [plato.img] : []);
                    const fullImgs = imgs.map(i => ruta + i);

                    // 🟢 SOLO SI HAY IMAGEN
                    if (fullImgs.length) {

                        const img = document.createElement("img");
                        img.className = "menu-item-img";
                        img.src = fullImgs[0];
                        img.alt = plato.nombre;
                        img.dataset.imgs = JSON.stringify(fullImgs);

                        article.appendChild(img);
                    }

                    const content = document.createElement("div");
                    content.className = "menu-item-content";

                    const h3 = document.createElement("h3");
                    h3.textContent = plato.nombre;

                    const p = document.createElement("p");
                    p.textContent = plato.descripcion || "";

                    content.appendChild(h3);
                    if (plato.descripcion) content.appendChild(p);

                    const alergenos = document.createElement("div");
                    alergenos.className = "alergenos";

                    (plato.alergenos || []).forEach(a => {
                        const span = document.createElement("span");
                        span.className = "icon " + a;
                        alergenos.appendChild(span);
                    });

                    content.appendChild(alergenos);

                    const precios = document.createElement("div");
                    precios.className = "menu-item-prices";

                    (plato.precios || []).forEach(pre => {
                        const span = document.createElement("span");
                        span.innerHTML = `${pre.cantidad} <small>${pre.tipo}</small>`;
                        precios.appendChild(span);
                    });

                    article.appendChild(content);
                    article.appendChild(precios);

                    contenedor.appendChild(article);
                });
            });
    });

    /* =========================
       CLICK GLOBAL
    ========================= */
    document.addEventListener("click", (e) => {

        const img = e.target.closest(".menu-item-img");
        if (!img) return;

        abrirModal(img);
    });

    /* =========================
       ABRIR MODAL
    ========================= */
    function abrirModal(img) {

        const article = img.closest(".menu-item");

        const titulo = article.querySelector("h3")?.textContent || "";
        const descripcion = article.querySelector("p")?.textContent || "";

        const precios = article.querySelectorAll(".menu-item-prices span");
        const alergenos = article.querySelectorAll(".alergenos span");

        try {
            images = JSON.parse(img.dataset.imgs || "[]");
        } catch {
            images = [img.src];
        }

        currentIndex = 0;
        render();

        document.getElementById("modal-title").textContent = titulo;
        document.getElementById("modal-desc").textContent = descripcion;

        const alerCont = document.getElementById("modal-alergenos");
        alerCont.innerHTML = "";

        alergenos.forEach((a, i) => {
            const span = document.createElement("span");
            span.className = a.className;
            span.style.transitionDelay = `${i * 60}ms`;
            alerCont.appendChild(span);
        });

        const preciosCont = document.getElementById("modal-precios");
        preciosCont.innerHTML = "";

        precios.forEach((pre, i) => {
            const span = document.createElement("span");
            span.innerHTML = pre.innerHTML;
            span.style.transitionDelay = `${i * 80}ms`;
            preciosCont.appendChild(span);
        });

        modal.style.display = "block";
        requestAnimationFrame(() => modal.classList.add("show"));

        document.body.style.overflow = "hidden";

        if (btnTop) {
            btnTop.classList.remove("show");
            btnTop.style.pointerEvents = "none";
        }
    }

    /* =========================
       RENDER
    ========================= */
    function render() {

        if (!images.length) return;

        modalImg.classList.remove("landscape", "portrait");

        modalImg.style.opacity = 0;

        modalImg.onload = () => {

            modalImg.style.opacity = 1;

            modalImg.classList.toggle(
                "portrait",
                modalImg.naturalHeight > modalImg.naturalWidth
            );

            modalImg.classList.toggle(
                "landscape",
                modalImg.naturalHeight <= modalImg.naturalWidth
            );
        };

        modalImg.src = images[currentIndex];
  

        btnPrev.style.display = images.length > 1 ? "flex" : "none";
        btnNext.style.display = images.length > 1 ? "flex" : "none";
    }


    /* =========================
       NAV
    ========================= */
    btnNext.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % images.length;
        render();
    });

    btnPrev.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        render();
    });

    /* =========================
       CERRAR
    ========================= */
    function cerrar() {

        modal.classList.remove("show");
        modal.classList.add("closing");

        document.body.style.overflow = "";

        setTimeout(() => {
            modal.classList.remove("closing");
            modal.style.display = "";
        }, 500);

        if (btnTop) {
            btnTop.style.pointerEvents = "";
        }
    }

    document.getElementById("modal-back")?.addEventListener("click", cerrar);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrar();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrar();
    });

});