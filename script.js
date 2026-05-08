

// MENU RESPONSIVE
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});


// =========================
// CONFIGURACIÓN
// =========================


const imageFolder = "img/carrusel/";
const maxImages = 50;
const slidesContainer = document.getElementById("slides");
let images = [];
let loaded = 0;

// =========================
// CARGAR IMÁGENES
// =========================

for (let i = 1; i <= maxImages; i++) {
    const img = new Image();
    img.src = `${imageFolder}${i}.png`;

    img.onload = () => {
        images.push(img);
        checkFinish();
    };

    img.onerror = () => {
        checkFinish();
    };
}

function getImagesPerSlide() {
    if (window.innerWidth <= 768) {
        return 1; // 📱 móvil → 1 imagen
    } else if (window.innerWidth <= 1024) {
        return 2; // tablet → 2 imágenes
    } else {
        return 3; // escritorio → 3 imágenes
    }
}

function checkFinish() {
    loaded++;
    if (loaded === maxImages) {
        shuffle(images);
        buildCarousel();
    }
}

// =========================
// MEZCLAR
// =========================

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// =========================
// CREAR SLIDES (FIJO)
// =========================
function buildCarousel() {
    slidesContainer.innerHTML = ""; // limpiar

    const imagesPerSlide = getImagesPerSlide();
    let i = 0;

    while (i < images.length) {
        const group = [];

        for (let j = 0; j < imagesPerSlide && i < images.length; j++) {
            group.push(images[i]);
            i++;
        }

        createSlide(group);
    }

    initCarousel();
}
window.addEventListener("resize", () => {
    buildCarousel();
});
// =========================
// CREAR SLIDE
// =========================

function createSlide(group) {
    const slide = document.createElement("div");
    slide.classList.add("slide-group");

    group.forEach(img => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("slide-item");

        const clone = img.cloneNode();
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

    // 🧹 limpiar intervalos anteriores
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }

    function updateSlide() {
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    }

    // Botones
    document.getElementById("nextBtn").onclick = () => {
        index = (index + 1) % totalSlides;
        updateSlide();
    };

    document.getElementById("prevBtn").onclick = () => {
        index = (index - 1 + totalSlides) % totalSlides;
        updateSlide();
    };

    // ============================
    // ⏱ VELOCIDAD SEGÚN PANTALLA
    // ============================
    let intervalTime = 4500; // escritorio

    if (window.innerWidth <= 768) {
        intervalTime = 7000; // móvil → más lento
    } else if (window.innerWidth <= 1024) {
        intervalTime = 5500; // tablet
    }

    // autoplay
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

    function buildCarousel(container, images) {

        // ============================
        // CREAR TRACK
        // ============================
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

        // ============================
        // DETECTAR MÓVIL
        // ============================
        const isMobile = window.innerWidth <= 768;

        // ============================
        // FLECHAS SOLO EN MÓVIL
        // ============================
        let btnPrev, btnNext;

        if (isMobile) {
            btnPrev = document.createElement("button");
            btnPrev.classList.add("plato-prev");
            btnPrev.innerHTML = `
        <span class="material-symbols-outlined">chevron_left</span>
    `;

            btnNext = document.createElement("button");
            btnNext.classList.add("plato-next");
            btnNext.innerHTML = `
        <span class="material-symbols-outlined">chevron_right</span>
    `;

            container.appendChild(btnPrev);
            container.appendChild(btnNext);
        }

        // Eventos de flechas
        if (isMobile) {
            btnPrev.addEventListener("click", () => {
                index = Math.max(0, index - 1);
                update();
            });

            btnNext.addEventListener("click", () => {
                const perView = getImagesPerView();
                const maxIndex = total - perView;
                index = Math.min(maxIndex, index + 1);
                update();
            });
        }

        // ============================
        // VARIABLES
        // ============================
        let index = 0;
        const total = images.length;

        function getImagesPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function update() {
            const perView = getImagesPerView();
            const percentage = 100 / perView;
            track.style.transform = `translateX(-${index * percentage}%)`;
        }

        // ============================
        // AUTOPLAY SOLO EN ESCRITORIO
        // ============================
        let intervalTime = 3000;
        if (window.innerWidth <= 1024 && !isMobile) intervalTime = 4500;

        if (container._interval) clearInterval(container._interval);

        function startAutoplay() {
            if (isMobile) return; // móvil sin autoplay

            container._interval = setInterval(() => {
                const perView = getImagesPerView();
                const maxIndex = total - perView;

                if (index < maxIndex) index++;
                else index = 0;

                update();
            }, intervalTime);
        }

        startAutoplay();
        update();

        // ============================
        // FLECHAS (solo móvil)
        // ============================
        if (isMobile) {
            btnPrev.addEventListener("click", () => {
                index = Math.max(0, index - 1);
                update();
            });

            btnNext.addEventListener("click", () => {
                const perView = getImagesPerView();
                const maxIndex = total - perView;
                index = Math.min(maxIndex, index + 1);
                update();
            });
        }

        // ============================
        // SWIPE TÁCTIL
        // ============================
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

            track.style.transition = "none";
            track.style.transform = `translateX(calc(-${index * (100 / getImagesPerView())}% + ${diff}px))`;
        });

        track.addEventListener("touchend", () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = "transform 0.5s ease";

            const diff = currentX - startX;
            const perView = getImagesPerView();
            const maxIndex = total - perView;

            if (diff > 50) {
                index = Math.max(0, index - 1);
            } else if (diff < -50) {
                index = Math.min(maxIndex, index + 1);
            }

            update();

            if (!isMobile) {
                setTimeout(() => startAutoplay(), 600);
            }
        });

        // ============================
        // REAJUSTE EN RESIZE
        // ============================
        window.addEventListener("resize", () => {
            update();
        });
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


// LIGHTBOX (ampliar imagen)
document.addEventListener("click", e => {
    if (e.target.tagName === "IMG" && e.target.closest(".plato-carousel, .plato-gallery, .carousel, .slides")) {
        const lightbox = document.getElementById("lightbox");
        const lightboxImg = document.getElementById("lightboxImg");

        lightboxImg.src = e.target.src;
        lightbox.style.display = "flex";
    }
});

document.getElementById("lightboxClose").onclick = () => {
    document.getElementById("lightbox").style.display = "none";
};

document.getElementById("lightbox").onclick = e => {
    if (e.target.id === "lightbox") {
        e.target.style.display = "none";
    }
};





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


// Botón de cambio de tema
const themeToggle = document.getElementById("theme-toggle");

// Al cargar la página, aplicar el modo guardado
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }
});

// Al hacer clic en el botón, cambiar y guardar
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    // Guardar el estado
    if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
});
