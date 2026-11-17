

// =========================
// CONFIGURACIÓN
// =========================
//carrusel pagina inicio con videos

const MEDIA_VERSION = "10"; // Cambia este número cuando actualices media.json

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
    // No hay carrusel en esta página; el resto del sitio sigue funcionando.
} else {
    loadMedia();
}

/* =========================
   CARGA DESDE JSON
========================= */

async function loadMedia() {
    try {
        // Al abrir index.html directamente (file://), fetch de JSON puede fallar.
        // La copia generada en site-data.js permite usar la web también sin servidor.
        let allMedia = window.REVIRA_MEDIA?.carrusel;
        if (location.protocol !== 'file:') {
            try {
                const res = await fetch(`img/carrusel/media.json?v=${MEDIA_VERSION}`);
                if (!res.ok) throw new Error('Carrusel no disponible');
                allMedia = await res.json();
            } catch (e) {
                if (!allMedia) throw e;
            }
        }
        if (!Array.isArray(allMedia)) throw new Error('No hay contenidos para el carrusel');
        // Galería más ligera: menos recursos iniciales y una muestra de vídeos.
        const fotos = allMedia.filter(item => item.type === 'image').slice(0, 18);
        const videos = allMedia.filter(item => item.type === 'video').slice(0, 2);
        media = shuffle([...fotos, ...videos]);

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
    index = 0;

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
            el.alt = 'Momentos en La Revirá Cerveceros';
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
            el.preload = "none";
            el.poster = item.src.replace(/\.mp4$/i, '.webp');
            el.controls = true;

            const isMobile =
                window.innerWidth <= 768;

            if (!isMobile && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoPlayInterval = setInterval(() => {
        if (document.hidden || slidesContainer.matches(':hover') || slidesContainer.contains(document.activeElement)) return;
        index =
            (index + 1) % totalSlides;

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


// carrusel pagina platos


document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // CONFIG
    // ============================================================

    const CONFIG = {
        basePath: "img/platos",
        mediaVersion: "11", // 👈 cambia esto cuando actualices JSON
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
            let data = window.REVIRA_MEDIA?.platos?.[folder];
            if (location.protocol !== 'file:') {
                try {
                    const res = await fetch(
                        `${CONFIG.basePath}/${folder}/media.json?v=${CONFIG.mediaVersion}`,
                        { cache: "force-cache" }
                    );
                    if (!res.ok) throw new Error(`No media.json en ${folder}`);
                    data = await res.json();
                } catch (error) {
                    if (!data) throw error;
                }
            }
            if (!Array.isArray(data)) {
                callback([]);
                return;
            }

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
            el.alt = `Fotografía de ${container.parentElement?.querySelector("h2")?.textContent.trim() || "La Revirá"}, imagen ${i + 1}`;

            // 🚀 solo primeras imágenes con prioridad alta
            if (i < 2 && container.dataset.folder === "sugerencias") el.fetchPriority = "high";

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
        let btnPrev;
        let btnNext;

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
                Math.floor((container.offsetWidth + gap + 2) / (itemWidth + gap))
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
            if (btnPrev && btnNext) {
                btnPrev.disabled = index <= 0;
                btnNext.disabled = index >= max;
                btnPrev.hidden = max === 0;
                btnNext.hidden = max === 0;
            }
        }

        function startAuto() {
            // V9: no se mueve solo; el visitante controla la galería.
            // Mantener función para no alterar los manejadores de gestos.
            clearInterval(interval);
        }

        // init medidas UNA sola vez al inicio
        measure();
        update(false);
        startAuto();

        // BOTONES
        btnPrev = document.createElement("button");
        btnNext = document.createElement("button");
        btnPrev.type = "button";
        btnNext.type = "button";
        btnPrev.setAttribute('aria-label', 'Fotografía anterior');
        btnNext.setAttribute('aria-label', 'Fotografía siguiente');

        btnPrev.className = "plato-prev";
        btnNext.className = "plato-next";

        btnPrev.textContent = "‹";
        btnNext.textContent = "›";

        container.appendChild(btnPrev);
        container.appendChild(btnNext);
        update(false);

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
            el.alt = `Fotografía de ${container.parentElement?.querySelector("h2")?.textContent.trim() || "La Revirá"}, imagen ${i + 1}`;

            if (i < 2 && container.dataset.folder === "sugerencias") el.fetchPriority = "high";

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


// ============================================================
// GLOBAL FUNCTIONS (FIX SCOPE ERROR)
// ============================================================

// estado global encapsulado
let lightboxItems = [];
let currentIndex = 0;
let currentTitle = "";

let scale = 1;
let startDistance = 0;
let startX = 0;

// ============================================================
// SAFE DOM GETTER
// ============================================================

const $ = (id) => document.getElementById(id);

// refs
let lightbox, img, video, counter, titleBox;
let nextBtn, prevBtn, closeBtn, thumbsBox, shareBtn, lightboxImg;

// ============================================================
// INIT DOM
// ============================================================

function initDOM() {

    lightbox = $("lightbox");
    img = $("lightboxImg");
    video = $("lightboxVideo");
    counter = $("lightboxCounter");
    titleBox = $("lightboxTitle");

    nextBtn = $("lightboxNext");
    prevBtn = $("lightboxPrev");
    closeBtn = $("lightboxClose");
    thumbsBox = $("lightboxThumbs");
    shareBtn = $("lightboxShare");

    lightboxImg = $("lightboxImg");

    if (!lightbox) return false;
    return true;
}

// ============================================================
// INDEX MEDIA (EXPOSED)
// ============================================================

function updateLightboxItems(context, title = "") {

    currentTitle = title;

    let nodes;

    if (context) {
        nodes = context.querySelectorAll("img, video");
    } else {
        nodes = document.querySelectorAll(
            ".slide-item img, .slide-item video, " +
            ".plato-carousel .carousel-item img, " +
            ".plato-gallery .gallery-row img"
        );
    }

    lightboxItems = Array.from(nodes).map(el => ({
        src: el.currentSrc || el.src,
        type: el.tagName.toLowerCase(),
        node: el
    }));
}

// 👉 IMPORTANTE: HACER GLOBAL
window.updateLightboxItems = updateLightboxItems;

// ============================================================
// OPEN LIGHTBOX (GLOBAL SAFE)
// ============================================================

function openLightbox(index) {

    if (!initDOM()) return;
    const item = lightboxItems[index];
    if (!item) return;
    document.body.classList.add("lightbox-open");
    lightbox.setAttribute('aria-hidden', 'false');

    currentIndex = index;

    if (lightboxItems.length <= 1) {
        nextBtn.style.display = "none";
        prevBtn.style.display = "none";
    } else {
        nextBtn.style.display = "flex";
        prevBtn.style.display = "flex";
    }

    if (titleBox) titleBox.textContent = currentTitle;

    if (counter) {
        counter.textContent = `${index + 1} / ${lightboxItems.length}`;
    }

    img.style.display = "none";
    video.style.display = "none";

    img.style.opacity = 0;
    video.style.opacity = 0;

    scale = 1;
    img.style.transform = "scale(1)";

    if (item.type === "img") {
        img.src = item.src;
        img.alt = currentTitle ? `Fotografía ampliada: ${currentTitle}` : 'Fotografía ampliada de La Revirá';
        img.style.display = "block";
        setTimeout(() => img.style.opacity = 1, 50);
    } else {

        video.src = item.src;
        video.muted = true;
        video.setAttribute("muted", "");
        video.setAttribute("disableRemotePlayback", "");
        video.playsInline = true;
        video.autoplay = false;
        video.controls = true;
        video.loop = false;
        video.preload = "metadata";
        video.style.display = "block";

        setTimeout(() => video.style.opacity = 1, 50);
    }

    // thumbs
    if (thumbsBox) {
        thumbsBox.innerHTML = "";

        for (let i = 1; i <= 3; i++) {

            const idx = currentIndex + i;
            const nextItem = lightboxItems[idx];

            if (!nextItem) break;

            let t;

            // 👉 Si es imagen → miniatura normal
            if (nextItem.type === "img") {
                t = document.createElement("img");
                t.src = nextItem.src;
            }

            // 👉 Si es vídeo → miniatura con icono
            else {
                t = document.createElement("div");
                t.className = "lightbox-thumb video-thumb";
                t.innerHTML = '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m10 8 6 4-6 4Z"></path></svg>';
            }

            t.classList.add("lightbox-thumb");

            // 👉 Abrir la miniatura sin cerrar el lightbox
            t.onclick = (ev) => {
                ev.stopPropagation();
                openLightbox(idx);
            };

            thumbsBox.appendChild(t);
        }
    }




    lightbox.style.display = "flex";
    closeBtn?.focus();
}

// 👉 IMPORTANTE: GLOBAL
window.openLightbox = openLightbox;

// ============================================================
// CLICK OPEN
// ============================================================

document.addEventListener("click", e => {

    if (e.target.closest("#suggestionsModal")) return;

    const media = e.target.closest(
        ".slide-item img, .slide-item video, " +
        ".plato-carousel .carousel-item img, " +
        ".plato-gallery .gallery-row img"
    );

    if (!media) return;

    // 1. Buscar contexto en platos-section
    let context = media.closest(".platos-section");

    // 2. Si no está en platos-section, buscar en carta-grid
    if (!context) {
        context = media.closest(".carta-grid section");
    }

    // 3. Si viene del modal de sugerencias
    if (!context && media.closest("#suggestionsModal")) {
        context = media.closest("#suggestionsModal");
    }

    // 4. Obtener título según el tipo de contexto
    let sectionTitle = "";

    if (context) {

        // Prioridad: h2 → h1 → span[data-i18n] → suggestions-title
        sectionTitle =
            context.querySelector("h2")?.textContent.trim() ||
            context.querySelector("h1")?.textContent.trim() ||
            context.querySelector("[data-i18n]")?.textContent.trim() ||
            context.querySelector(".suggestions-title span[data-i18n]")?.textContent.trim() ||
            "";
    }

    // Pasar título al lightbox
    updateLightboxItems(context, sectionTitle);


    currentIndex = lightboxItems.findIndex(item => item.node === media);

    openLightbox(currentIndex);
});

// ============================================================
// NAVIGATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    function bindNavigation() {

        if (nextBtn) {
            nextBtn.onclick = () => {
                currentIndex = (currentIndex + 1) % lightboxItems.length;
                openLightbox(currentIndex);
            };
        }

        if (prevBtn) {
            prevBtn.onclick = () => {
                currentIndex = (currentIndex - 1 + lightboxItems.length) % lightboxItems.length;
                openLightbox(currentIndex);
            };
        }

        if (closeBtn) {
            closeBtn.onclick = closeLightbox;
        }

        if (lightbox) {
            lightbox.addEventListener("click", e => {

                const content = document.querySelector(".lightbox-content");

                // Si el clic NO está dentro del contenido → cerrar
                if (!content.contains(e.target)) {
                    closeLightbox();
                }
            });
        }

    }

    function closeLightbox() {

        document.body.classList.remove("lightbox-open");

        if (!initDOM()) return;

        lightbox.style.display = "none";
        lightbox.setAttribute('aria-hidden', 'true');

        if (img) img.removeAttribute("src");
        if (video) { video.pause(); video.removeAttribute("src"); }
    }

    // SWIPE
    function bindSwipe() {

        if (!lightbox) return;

        lightbox.addEventListener("touchstart", e => {
            startX = e.touches[0].clientX;
        });

        lightbox.addEventListener("touchend", e => {

            const diff = e.changedTouches[0].clientX - startX;

            if (diff > 50 && prevBtn) prevBtn.onclick();
            if (diff < -50 && nextBtn) nextBtn.onclick();
        });
    }

    // SHARE: nativo cuando esté disponible; si no, copiar enlace o descargar.
    // En file:// no compartimos rutas privadas del ordenador.
    function bindShare() {
        if (!shareBtn) return;

        const messages = {
            es: { copied:'Enlace de la imagen copiado', downloaded:'Imagen descargada para compartirla', failed:'No se pudo compartir; intenta descargar la imagen', shared:'Imagen lista para compartir', button:'Compartir imagen' },
            en: { copied:'Image link copied', downloaded:'Image downloaded for sharing', failed:'Could not share; try downloading the image', shared:'Image ready to share', button:'Share image' },
            fr: { copied:'Lien de l’image copié', downloaded:'Image téléchargée pour être partagée', failed:'Partage impossible ; essayez de télécharger l’image', shared:'Image prête à partager', button:'Partager l’image' },
            de: { copied:'Bildlink kopiert', downloaded:'Bild zum Teilen heruntergeladen', failed:'Teilen nicht möglich; Bild herunterladen', shared:'Bild bereit zum Teilen', button:'Bild teilen' }
        };
        const labels = () => messages[(document.documentElement.lang || 'es').slice(0,2)] || messages.es;
        let feedbackTimeout;

        function notify(message) {
            const container = document.querySelector('.lightbox-media-wrapper');
            if (!container) return;
            let status = container.querySelector('.lightbox-share-feedback');
            if (!status) {
                status = document.createElement('div');
                status.className = 'lightbox-share-feedback';
                status.setAttribute('role', 'status');
                status.setAttribute('aria-live', 'polite');
                container.appendChild(status);
            }
            clearTimeout(feedbackTimeout);
            status.textContent = message;
            status.hidden = false;
            feedbackTimeout = setTimeout(() => status.hidden = true, 3200);
        }

        function downloadCurrent(url, item) {
            try {
                const a = document.createElement('a');
                a.href = url;
                a.download = `La-Revira-${currentIndex + 1}.${item.type === 'video' ? 'mp4' : (url.split(/[?#]/)[0].split('.').pop() || 'webp')}`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                a.remove();
                notify(labels().downloaded);
                return true;
            } catch (e) {
                return false;
            }
        }

        async function copyLink(text) {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
            }
            // Copia compatible con navegadores sin Clipboard API.
            const field = document.createElement('textarea');
            field.value = text;
            field.readOnly = true;
            field.style.cssText = 'position:fixed;left:-10000px;top:0;opacity:0';
            document.body.appendChild(field);
            field.select();
            let copied = false;
            try { copied = document.execCommand('copy'); } catch (e) {}
            field.remove();
            return copied;
        }

        shareBtn.setAttribute('type','button');
        const updateShareLabel = () => {
            shareBtn.setAttribute('aria-label', labels().button);
            shareBtn.setAttribute('title', labels().button);
        };
        updateShareLabel();
        document.addEventListener('revira:languagechange', updateShareLabel);
        shareBtn.onclick = async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const item = lightboxItems[currentIndex];
            if (!item || !item.src) return;
            let url;
            try { url = new URL(item.src, document.baseURI).href; }
            catch (e) { url = item.src; }
            const localPage = location.protocol === 'file:';

            // Los enlaces file:// no sirven a destinatarios externos.
            if (localPage) {
                if (!downloadCurrent(url, item)) notify(labels().failed);
                return;
            }

            if (typeof navigator.share === 'function') {
                try {
                    await navigator.share({
                        title: currentTitle || 'La Revirá Cerveceros',
                        text: 'Una imagen de La Revirá Cerveceros',
                        url
                    });
                    notify(labels().shared);
                    return;
                } catch (e) {
                    if (e?.name === 'AbortError') return;
                    // Puede fallar por permisos o soporte limitado: intentar copiar.
                }
            }

            if (await copyLink(url)) {
                notify(labels().copied);
            } else if (!downloadCurrent(url, item)) {
                notify(labels().failed);
            }
        };
    }

    function init() {
        if (!initDOM()) return;

        bindNavigation();
        bindSwipe();
        bindShare();
    }

    init();
});

// Sistema de idiomas con caché y traducción segura (también para contenido dinámico)
const translationCache = new Map();
let currentLanguage = (() => { try { return localStorage.getItem('lang') || 'es'; } catch { return 'es'; } })();
async function loadLanguage(lang) {
    const supported = ['es', 'en', 'fr', 'de'];
    lang = supported.includes(lang) ? lang : 'es';
    currentLanguage = lang;
    try {
        if (!translationCache.has(lang)) {
            const fallback = window.REVIRA_LANGUAGES?.[lang];
            const promise = location.protocol === 'file:' && fallback
                ? Promise.resolve(fallback)
                : fetch(`lang/${lang}.json`).then(r => {
                    if (!r.ok) throw new Error('No se pudo cargar el idioma');
                    return r.json();
                  }).catch(err => { if (fallback) return fallback; throw err; });
            translationCache.set(lang, promise);
        }
        const translations = await translationCache.get(lang);
        if (currentLanguage !== lang) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const value = translations[el.dataset.i18n];
            if (typeof value !== 'string') return;
            // Conservar iconos, contadores y etiquetas anidadas; nunca inyectar HTML.
            if (el.children.length) {
                const directText = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
                if (directText) directText.textContent = value + ' ';
            } else {
                el.textContent = value;
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const value = translations[el.dataset.i18nPlaceholder];
            if (typeof value === 'string') el.placeholder = value;
        });
        document.documentElement.lang = lang;
        try { localStorage.setItem('lang', lang); } catch {}
        document.querySelectorAll('#language-switcher [data-lang]').forEach(btn => {
            btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
        });
        document.dispatchEvent(new CustomEvent('revira:languagechange', { detail: { lang, translations } }));
    } catch (error) {
        console.warn('No se ha podido cambiar el idioma:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadLanguage(currentLanguage);
    document.querySelectorAll('#language-switcher [data-lang]').forEach(btn => {
        btn.addEventListener('click', () => loadLanguage(btn.dataset.lang));
    });
});

// cambio de color
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// Cambiar icono según el modo
const moonIconPaths = `<path d="M20.985 12.486A9 9 0 1 1 11.514 3.015a7 7 0 0 0 9.47 9.47Z"></path>`;
const sunIconPaths = `<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>`;
function updateThemeIcon() {
    if (!themeIcon) return;
    const isLight = document.body.classList.contains('light-mode');
    // Asegurar que el dibujo SVG nunca se recorte en ningún navegador.
    themeIcon.setAttribute('viewBox', '0 0 24 24');
    themeIcon.innerHTML = isLight ? moonIconPaths : sunIconPaths;
    const lang = (document.documentElement.lang || 'es').slice(0, 2);
    const translations = {
        es: {dark: 'Activar modo oscuro', light: 'Activar modo claro'},
        en: {dark: 'Switch to dark mode', light: 'Switch to light mode'},
        fr: {dark: 'Activer le mode sombre', light: 'Activer le mode clair'},
        de: {dark: 'Dunkelmodus aktivieren', light: 'Hellmodus aktivieren'}
    };
    const labels = translations[lang] || translations.es;
    const label = isLight ? labels.dark : labels.light;
    themeToggle?.setAttribute('aria-label', label);
    themeToggle?.setAttribute('title', label);
}
// Cambiar el texto accesible cuando se elige otro idioma.
document.addEventListener('revira:languagechange', updateThemeIcon);

// Cambiar logo según el modo
function updateLogo() {
    const logo = document.querySelector(".home-logo");
    if (!logo) return;

    if (document.body.classList.contains("light-mode")) {
        logo.src = "img/logo3.png";   // Logo para modo claro
    } else {
        logo.src = "img/logo3.png";   // Logo unificado en ambos temas
    }
}

// ===============================
// MODO POR DEFECTO: CLARO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    let savedTheme = 'light';
    try { savedTheme = localStorage.getItem("theme") || 'light'; }
    catch (e) { /* Modo claro disponible incluso con almacenamiento bloqueado. */ }

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
themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    try {
        localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
    } catch (e) { /* Mantener cambio de tema durante esta visita. */ }

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
// ===============================
// SUGERENCIAS - MODAL AL ENTRAR
// ===============================

async function cargarSugerencias(abrir = false) {

    const modal = document.getElementById("suggestionsModal");
    if (!modal) return;

    if (modal.dataset.loaded === 'true') {
        if (abrir) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            requestAnimationFrame(() => modal.classList.add('show'));
            document.body.style.overflow = 'hidden';
            document.getElementById('closeModal')?.focus();
        }
        return;
    }
    const closeBtn = document.getElementById("closeModal");
    const closeBtnBottom = document.getElementById("closeModalBtn");
    const lista = modal.querySelector("ul");
    const paginacion = document.getElementById("suggestionsPagination");

    const ruta = "img/platos/sugerencias/";

    const sugerenciasLocal = window.REVIRA_MENU?.sugerencias;
    const sugerencias = location.protocol === 'file:' && Array.isArray(sugerenciasLocal)
        ? sugerenciasLocal
        : await fetch(ruta + "manifest.json").then(r => {
            if (!r.ok) throw new Error('No se pudo abrir el listado de sugerencias');
            return r.json();
          }).catch(error => {
            if (Array.isArray(sugerenciasLocal)) return sugerenciasLocal;
            throw error;
          });

    lista.innerHTML = "";

    sugerencias.forEach(item => {

        const li = document.createElement("li");

        const imgs = item.imgs || (item.img ? [item.img] : []);
        const fullImgs = imgs.length ? imgs.map(i => ruta + i) : [];

        if (fullImgs.length > 0) {
            const img = document.createElement("img");
            img.className = "menu-item-img";
            img.src = fullImgs[0];
            img.alt = item.nombre;
            img.dataset.imgs = JSON.stringify(fullImgs);
            li.appendChild(img);
        }

        const span = document.createElement("span");
        span.dataset.i18n = item.i18n_key;
        span.textContent = item.nombre;

        const h3 = document.createElement("h3");
        h3.style.display = "none";
        h3.dataset.i18n = item.i18n_key;
        h3.textContent = item.nombre;

        const p = document.createElement("p");
        p.style.display = "none";
        p.dataset.i18n = item.i18n_key + "_desc";
        p.textContent = item.descripcion || "";

        const alergenos = document.createElement("div");
        alergenos.className = "alergenos";
        alergenos.style.display = "none";

        (item.alergenos || []).forEach(a => {
            const spanA = document.createElement("span");
            spanA.className = "icon " + a;
            alergenos.appendChild(spanA);
        });

        const precios = document.createElement("div");
        precios.className = "menu-item-prices";
        precios.style.display = "none";

        (item.precios || []).forEach(pre => {
            const spanP = document.createElement("span");

            if (pre.tipo) {
                spanP.innerHTML = `${pre.cantidad} <small data-i18n="${pre.tipo}">${pre.tipo}</small>`;
            } else {
                spanP.textContent = pre.cantidad;
            }

            precios.appendChild(spanP);
        });

        li.appendChild(span);
        li.appendChild(h3);
        li.appendChild(p);
        li.appendChild(alergenos);
        li.appendChild(precios);

        lista.appendChild(li);
    });

    // Traducir textos
    await loadLanguage((() => { try { return localStorage.getItem("lang") || "es"; } catch { return "es"; } })());

    // ===============================
    // PAGINACIÓN + SWIPE
    // ===============================
    let paginaActual = 0;
    const porPagina = 4;

    function mostrarPagina(n) {
        paginaActual = n;

        const items = lista.querySelectorAll("li");
        const inicio = n * porPagina;
        const fin = inicio + porPagina;

        items.forEach((li, i) => {
            li.style.display = (i >= inicio && i < fin) ? "flex" : "none";
        });

        crearDots();
    }

    function crearDots() {
        const totalPaginas = Math.ceil(lista.children.length / porPagina);
        paginacion.innerHTML = "";

        for (let i = 0; i < totalPaginas; i++) {
            const dot = document.createElement("div");
            dot.className = "modal-dot" + (i === paginaActual ? " active" : "");
            dot.onclick = () => mostrarPagina(i);
            paginacion.appendChild(dot);
        }
    }

    mostrarPagina(0);

    let startX = 0;

    modal.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
    });

    modal.addEventListener("touchend", e => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        const totalPaginas = Math.ceil(lista.children.length / porPagina);

        if (diff > 50 && paginaActual > 0) {
            mostrarPagina(paginaActual - 1);
        }

        if (diff < -50 && paginaActual < totalPaginas - 1) {
            mostrarPagina(paginaActual + 1);
        }
    });

    // ===============================
    // ABRIR MODAL
    // ===============================
    modal.dataset.loaded = 'true';
    if (abrir) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => modal.classList.add('show'));
        document.body.style.overflow = 'hidden';
        document.getElementById('closeModal')?.focus();
    }

    // ===============================
    // CIERRE
    // ===============================
    function cerrarModal() {
        modal.classList.remove("show");
        modal.classList.add("closing");

        document.body.style.overflow = "";

        setTimeout(() => {
            modal.classList.remove("closing");
            modal.style.display = "none";
            modal.setAttribute('aria-hidden', 'true');
            document.getElementById('btnSuggestions')?.focus();
        }, 300);
    }

    if (closeBtn) {
        closeBtn.onclick = cerrarModal;
    }

    if (closeBtnBottom) {
        closeBtnBottom.onclick = cerrarModal;
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("show")) cerrarModal();
    });
}



function cerrarModal() {
    const modal = document.getElementById("suggestionsModal");
    modal.classList.remove("show");

    setTimeout(() => {
        modal.style.display = "";
        document.body.style.overflow = "";
    }, 550);
}


// script carga y modal pagina platos
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

    if (!modal || !modalImg || !btnPrev || !btnNext) return;

    /* =========================
       CARGA MENÚ
    ========================= */
    Object.entries(secciones).forEach(([id, ruta]) => {

        const contenedor = document.querySelector(`#${id} .menu-list`);
        if (!contenedor) return;

        const localMenu = window.REVIRA_MENU?.[id];
        const menuPromise = location.protocol === 'file:' && Array.isArray(localMenu)
            ? Promise.resolve(localMenu)
            : fetch(ruta + "manifest.json").then(r => {
                if (!r.ok) throw new Error(`No se encontró el menú de ${id}`);
                return r.json();
              }).catch(error => {
                if (Array.isArray(localMenu)) return localMenu;
                throw error;
              });

        menuPromise.then(platos => {

                contenedor.innerHTML = "";

                platos.forEach(plato => {

                    const article = document.createElement("article");
                    article.className = "menu-item";

                    const imgs = plato.imgs || (plato.img ? [plato.img] : []);
                    const fullImgs = imgs.map(i => ruta + i);

                    // Imagen
                    if (fullImgs.length) {
                        const img = document.createElement("img");
                        img.className = "menu-item-img";
                        img.src = fullImgs[0];
                        img.loading = "lazy";
                        img.decoding = "async";
                        img.width = 180;
                        img.height = 180;
                        img.alt = plato.nombre;
                        img.dataset.imgs = JSON.stringify(fullImgs);
                        article.appendChild(img);
                    }

                    // Contenido
                    const content = document.createElement("div");
                    content.className = "menu-item-content";

                    // Nombre con i18n
                    const h3 = document.createElement("h3");
                    h3.dataset.i18n = plato.i18n_key;
                    h3.textContent = plato.nombre;
                    content.appendChild(h3);

                    // Descripción con i18n
                    if (plato.descripcion) {
                        const p = document.createElement("p");
                        p.dataset.i18n = plato.i18n_key + "_desc";
                        p.textContent = plato.descripcion;
                        content.appendChild(p);
                    }

                    // Alérgenos con i18n
                    const alergenos = document.createElement("div");
                    alergenos.className = "alergenos";

                    (plato.alergenos || []).forEach(a => {
                        const span = document.createElement("span");
                        span.className = "icon " + a;
                        alergenos.appendChild(span);
                    });

                    content.appendChild(alergenos);

                    // Precios
                    const precios = document.createElement("div");
                    precios.className = "menu-item-prices";

                    (plato.precios || []).forEach(pre => {
                        const span = document.createElement("span");
                        span.textContent = pre.cantidad || '';
                        if (pre.tipo) {
                            const tipo = document.createElement('small');
                            tipo.dataset.i18n = pre.tipo;
                            tipo.textContent = pre.tipo;
                            span.appendChild(tipo);
                        }
                        precios.appendChild(span);
                    });

                    content.appendChild(precios);

                    article.appendChild(content);
                    contenedor.appendChild(article);
                });
                loadLanguage(currentLanguage);
            })
            .catch(error => console.warn(`Error al cargar ${id}:`, error));
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
    let lastSectionTitle = "";

    function abrirModal(img) {

        const article =
            img.closest(".menu-item") ||
            img.closest("#suggestionsModal li");

        const titulo = article.querySelector("h3")?.textContent || "";
        lastSectionTitle = titulo;

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
        modal.setAttribute('aria-hidden', 'false');
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
            modal.style.display = "none";
            modal.setAttribute('aria-hidden', 'true');
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
        if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false" && document.getElementById("lightbox")?.getAttribute("aria-hidden") !== "false") cerrar();
    });

    /* =========================
       LIGHTBOX DESDE EL MODAL
    ========================= */
    modalImg.addEventListener("click", () => {

        // Crear contenedor temporal SOLO con las imágenes del plato
        const temp = document.createElement("div");

        images.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            temp.appendChild(img);
        });

        const title = lastSectionTitle;

        updateLightboxItems(temp, title);

        const index = lightboxItems.findIndex(item => item.src === modalImg.src);
        openLightbox(index);
    });

    // Las sugerencias se muestran únicamente cuando las solicita el visitante.

});



const btnSuggestions = document.getElementById("btnSuggestions");
if (btnSuggestions) {
    btnSuggestions.addEventListener("click", () => {
        cargarSugerencias(true).catch(err => console.warn('Sugerencias:', err));
    });
}
