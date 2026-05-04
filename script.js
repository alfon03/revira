

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
    const imagesPerSlide = 3;
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

function initCarousel() {
    const totalSlides = slidesContainer.children.length;

    if (totalSlides === 0) return;

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

    setInterval(() => {
        index = (index + 1) % totalSlides;
        updateSlide();
    }, 4500);
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

        container.appendChild(track);

        let index = 0;
        const total = images.length;

        function update() {
            track.style.transform = `translateX(-${index * 33.33}%)`;
        }

        // Auto-play
        setInterval(() => {
            index = (index + 1) % total;
            update();
        }, 3000);
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
    if (e.target.tagName === "IMG" && e.target.closest(".plato-carousel, .plato-gallery")) {
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
