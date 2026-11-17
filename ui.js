/* Búsqueda, accesibilidad */
/* Mejoras de interacción sin frameworks: búsqueda, accesibilidad y estados. */
(() => {
  'use strict';
  const search = document.getElementById('menuSearch');
  if (search) {
    const clear = document.getElementById('menuSearchClear');
    const message = document.getElementById('menuSearchCount');
    const empty = document.getElementById('menuEmpty');
    const sections = [...document.querySelectorAll('[data-menu-category]')];
    const normalize = text => (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
    let dictionary = null;
    let raf = 0;

    function applyFilter() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const query = normalize(search.value);
        let found = 0;
        let loaded = 0;
        sections.forEach(section => {
          let matches = 0;
          const heading = normalize(section.querySelector('h2')?.textContent);
          section.querySelectorAll('.menu-item').forEach(item => {
            loaded++;
            const title = item.querySelector('h3')?.textContent || '';
            const desc = item.querySelector('.menu-item-content p')?.textContent || '';
            const matchesQuery = !query || normalize(`${title} ${desc} ${heading}`).includes(query);
            const matchesFavorite = !window.reviraFavoriteOnly || !!window.reviraFavorites?.has(item.dataset.favoriteId);
            const isMatch = matchesQuery && matchesFavorite;
            item.hidden = !isMatch;
            if (isMatch) { matches++; found++; }
          });
          section.hidden = (!!query || !!window.reviraFavoriteOnly) && matches === 0;
        });
        document.querySelectorAll('.carta-grid').forEach(grid => {
          grid.hidden = (!!query || !!window.reviraFavoriteOnly) && !grid.querySelector('.platos-section:not([hidden])');
        });
        document.body.classList.toggle('is-searching', !!query || !!window.reviraFavoriteOnly);
        clear.hidden = !query;
        empty.hidden = (!query && !window.reviraFavoriteOnly) || found !== 0 || loaded === 0 || (window.reviraFavoriteOnly && !window.reviraFavorites?.size && !query);
        const favoritesEmpty = document.getElementById('favoritesEmpty');
        if (favoritesEmpty) favoritesEmpty.hidden = !window.reviraFavoriteOnly || !!window.reviraFavorites?.size || !!query;
        const lang = document.documentElement.lang || 'es';
        const hint = dictionary?.ui_search_hint || 'Explora por categorías o busca por nombre.';
        const plural = dictionary?.ui_search_results || (lang === 'es' ? 'platos encontrados' : 'dishes found');
        const one = dictionary?.ui_search_one || (lang === 'es' ? 'plato encontrado' : 'dish found');
        message.textContent = (!query && !window.reviraFavoriteOnly) ? hint : `${found} ${found === 1 ? one : plural}`;
      });
    }
    search.addEventListener('input', applyFilter);
    document.addEventListener('revira:favoriteschange', applyFilter);
    clear.addEventListener('click', () => { search.value = ''; applyFilter(); search.focus(); });
    document.addEventListener('revira:languagechange', event => { dictionary = event.detail.translations; applyFilter(); });
    sections.forEach(section => {
      const list = section.querySelector('.menu-list');
      if (list) new MutationObserver(applyFilter).observe(list, {childList:true});
    });
    applyFilter();
  }

  const makeAccessible = () => {
    document.querySelectorAll('.menu-item-img, .plato-gallery img, .plato-carousel .carousel-item img, .experience-section .slide-item img').forEach(img => {
      if (img.dataset.keyboardReady) return;
      img.dataset.keyboardReady = '1';
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      if (!img.alt) img.alt = 'Ampliar fotografía de La Revirá';
      img.setAttribute('aria-label', `Ampliar imagen: ${img.alt}`);
      img.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); img.click(); }
      });
    });
  };
  document.addEventListener('DOMContentLoaded', () => {
    makeAccessible();
    const observer = new MutationObserver(makeAccessible);
    // Solo observar los contenedores donde se añaden imágenes dinámicamente.
    document.querySelectorAll('.menu-list, .plato-gallery, .plato-carousel, #slides').forEach(parent => {
      observer.observe(parent, {childList:true, subtree:true});
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const input = document.getElementById('menuSearch');
      if (input && document.activeElement === input && input.value) {
        input.value = ''; input.dispatchEvent(new Event('input'));
      }
    }
  });
})();


/* Favoritos y modales */
/* Segunda mejora: favoritos guardados localmente, microinteracciones y accesibilidad. */
(() => {
  'use strict';
  const STORAGE_KEY = 'revira-favorites-v1';
  const heartSvg = '<svg class="ui-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  const defaults = {
    ui_fav_add:'Guardar en favoritos',ui_fav_remove:'Quitar de favoritos',
    ui_fav_share_title:'Mis favoritos de La Revirá',ui_fav_copied:'¡Selección copiada!',
    ui_fav_none:'Selecciona algún plato primero'
  };
  let dictionary = defaults;
  const t = key => dictionary[key] || defaults[key] || key;
  let stored = [];
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(data)) stored = data.filter(item => typeof item === 'string' && item.length < 130);
  } catch (err) { /* La carta sigue siendo utilizable cuando no hay almacenamiento. */ }
  const favorites = new Set(stored);
  window.reviraFavorites = favorites;
  window.reviraFavoriteOnly = false;
  const getItems = () => [...document.querySelectorAll('.menu-list .menu-item')];
  const favFilter = document.getElementById('favoritesFilter');
  const favCount = document.getElementById('favoritesCount');
  const favShare = document.getElementById('favoritesShare');
  const favShowAll = document.getElementById('favoritesShowAll');
  const toast = document.getElementById('favoritesToast');
  let toastTimer;
  function announce(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites])); }
    catch (err) { /* Funciona durante la sesión aunque el navegador bloquee la persistencia. */ }
  }
  function sync() {
    if (favCount) favCount.textContent = String(favorites.size);
    if (favShare) favShare.disabled = favorites.size === 0;
    if (favFilter) favFilter.setAttribute('aria-pressed', String(window.reviraFavoriteOnly));
    document.querySelectorAll('.favorite-button').forEach(btn => {
      const item = btn.closest('.menu-item');
      const active = favorites.has(item?.dataset.favoriteId);
      btn.setAttribute('aria-pressed', String(active));
      item.classList.toggle('is-favorite', active);
      const name = item.querySelector('h3')?.textContent?.trim() || '';
      const label = `${t(active ? 'ui_fav_remove' : 'ui_fav_add')}: ${name}`;
      btn.setAttribute('aria-label', label);
      btn.title = label;
    });
    document.dispatchEvent(new Event('revira:favoriteschange'));
  }
  function decorate() {
    let added = false;
    getItems().forEach(item => {
      if (item.dataset.favoriteId) return;
      const name = item.querySelector('h3');
      const id = name?.dataset.i18n || `${item.closest('.platos-section')?.id || 'plato'}:${name?.textContent.trim()}`;
      if (!id) return;
      item.dataset.favoriteId = id;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'favorite-button';
      button.innerHTML = heartSvg;
      item.append(button);
      added = true;
    });
    if (added) sync();
  }
  if (favFilter) {
    favFilter.addEventListener('click', () => {
      window.reviraFavoriteOnly = !window.reviraFavoriteOnly;
      sync();
    });
    favShowAll?.addEventListener('click', () => { window.reviraFavoriteOnly = false; sync(); favFilter.focus(); });
    document.addEventListener('click', event => {
      const button = event.target.closest('.favorite-button');
      if (!button) return;
      event.stopPropagation();
      const id = button.closest('.menu-item')?.dataset.favoriteId;
      if (!id) return;
      favorites.has(id) ? favorites.delete(id) : favorites.add(id);
      persist(); sync();
      if (window.reviraFavoriteOnly && !favorites.has(id)) favFilter?.focus({preventScroll:true});
    });
    document.querySelectorAll('.menu-list').forEach(list => {
      const observer = new MutationObserver(decorate);
      observer.observe(list, {childList:true});
    });
    decorate();
    favShare?.addEventListener('click', async () => {
      const lines = getItems().filter(item => favorites.has(item.dataset.favoriteId)).map(item => {
        const name = item.querySelector('h3')?.textContent.trim() || '';
        const prices = [...item.querySelectorAll('.menu-item-prices > span')].map(span => span.textContent.trim()).join(' · ');
        return `• ${name}${prices ? ` — ${prices}` : ''}`;
      });
      if (!lines.length) { announce(t('ui_fav_none')); return; }
      const text = `${t('ui_fav_share_title')}\n\n${lines.join('\n')}`;
      if (navigator.share) {
        try { await navigator.share({title:t('ui_fav_share_title'),text}); return; }
        catch (error) { if (error.name === 'AbortError') return; }
      }
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text);
        announce(t('ui_fav_copied'));
      } catch (error) {
        // Fallback compatible con páginas estáticas sin acceso al portapapeles.
        const field = document.createElement('textarea');
        field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.append(field); field.select();
        try { document.execCommand('copy'); announce(t('ui_fav_copied')); }
        catch (err) { announce(t('ui_fav_none')); }
        field.remove();
      }
    });
  }
  document.addEventListener('revira:languagechange', event => {
    dictionary = {...defaults, ...(event.detail?.translations || {})};
    document.querySelectorAll('.signature-card').forEach(card => {
      const name = card.querySelector('h3')?.textContent?.trim() || '';
      card.setAttribute('aria-label', `${dictionary.ui_feature_action || 'Ver en la carta'}: ${name}`);
    });
    sync();
  });

  const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Mantener foco en el diálogo abierto y devolverlo al elemento que lo abrió.
  const lightbox = document.getElementById('lightbox');
  const suggestions = document.getElementById('suggestionsModal');
  const dishModal = document.getElementById('plato-modal');
  const modalList = [lightbox, suggestions, dishModal].filter(Boolean);
  let previousFocus = null;
  const isOpen = el => el?.getAttribute('aria-hidden') === 'false';
  document.addEventListener('click', event => {
    if (event.target.closest('.slide-item, .plato-gallery img, .plato-carousel img, .menu-item-img, #btnSuggestions')) previousFocus = document.activeElement;
  }, true);
  const controls = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input:not([disabled]),select:not([disabled])';
  modalList.forEach(modal => new MutationObserver(() => {
    if (isOpen(modal)) {
      const first = modal.querySelector(controls);
      if (first && !modal.contains(document.activeElement)) first.focus({preventScroll:true});
    } else if (previousFocus && document.contains(previousFocus)) {
      // No recuperar foco al cerrar un diálogo que está debajo de otro.
      if (!modalList.some(isOpen)) previousFocus.focus({preventScroll:true});
    }
  }).observe(modal,{attributes:true,attributeFilter:['aria-hidden']}));
  ['lightboxPrev','lightboxNext'].forEach(id => {
    const ctrl = document.getElementById(id);
    if (!ctrl) return;
    if (ctrl.tagName === 'BUTTON') return;
    ctrl.setAttribute('role','button');
    ctrl.addEventListener('keydown',event => {
      if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();ctrl.click();}
    });
  });
  document.addEventListener('keydown', event => {
    const activeModal = modalList.find(isOpen);
    if (!activeModal) return;
    if (event.key === 'Tab') {
      const focusable = [...activeModal.querySelectorAll(controls)].filter(el => el.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !activeModal.contains(document.activeElement))) {event.preventDefault();last.focus();}
      else if (!event.shiftKey && (document.activeElement === last || !activeModal.contains(document.activeElement))) {event.preventDefault();first.focus();}
    }
    if (activeModal === lightbox) {
      if (event.key === 'Escape') document.getElementById('lightboxClose')?.click();
      if (event.key === 'ArrowLeft') document.getElementById('lightboxPrev')?.click();
      if (event.key === 'ArrowRight') document.getElementById('lightboxNext')?.click();
    }
  });
})();


/* Medios y logo */
/** La Revirá — galería V9. Conserva intactas las fotos originales. */
(function () {
  'use strict';

  const LOGO = 'img/logo3.png';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let videoObserver = null;

  function unifyLogos() {
    document.querySelectorAll('.brand > img, .footer-brand > img, .home-logo').forEach(img => {
      if (img.getAttribute('src') !== LOGO) img.setAttribute('src', LOGO);
    });
  }

  function describePhotos() {
    document.querySelectorAll('.page-platos .platos-section').forEach(section => {
      const heading = section.querySelector('h2');
      const headingText = heading?.childNodes[0]?.textContent?.trim() || heading?.textContent.trim() || 'La Revirá';
      section.querySelectorAll('.media-frame img').forEach((img, index) => {
        img.alt = `${headingText} — fotografía ${index + 1}`;
      });
    });
  }

  function updatePortraitFrame(wrapper, img) {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const portrait = img.naturalHeight > img.naturalWidth * 1.16;
    wrapper.classList.toggle('is-portrait', portrait);
    if (portrait) {
      // Fondo difuminado creado con la misma fotografía, sin añadir otra etiqueta IMG.
      // Evita el aspecto de fotos estrechas sobre un gran espacio vacío.
      wrapper.style.setProperty('--frame-image', `url("${img.currentSrc || img.src}")`);
    } else {
      wrapper.style.removeProperty('--frame-image');
    }
  }

  function wrapImage(img) {
    if (!img || !img.parentElement || img.closest('.lightbox-media-wrapper')) return;
    let frame = img.parentElement;
    if (!frame.classList.contains('media-frame')) {
      frame = document.createElement('div');
      frame.className = 'media-frame';
      img.parentElement.insertBefore(frame, img);
      frame.appendChild(img);
    }
    if (!img.dataset.reviraFrameBound) {
      img.dataset.reviraFrameBound = 'true';
      img.addEventListener('load', () => updatePortraitFrame(frame, img));
    }
    if (img.complete) updatePortraitFrame(frame, img);
  }

  function decorateGallery(container) {
    if (!container) return;
    // Solo seleccionamos las fotos, no las posibles decoraciones de la tarjeta.
    container.querySelectorAll('.carousel-item > img, .gallery-row > img').forEach(wrapImage);
    describePhotos();
  }

  function labelCarouselButtons() {
    const lang = (document.documentElement.lang || 'es').slice(0,2);
    const labels = {
      es:['Fotografía anterior','Fotografía siguiente'],
      en:['Previous photograph','Next photograph'],
      fr:['Photo précédente','Photo suivante'],
      de:['Vorheriges Foto','Nächstes Foto']
    }[lang] || ['Fotografía anterior','Fotografía siguiente'];
    document.querySelectorAll('.plato-carousel .plato-prev').forEach(btn => btn.setAttribute('aria-label', labels[0]));
    document.querySelectorAll('.plato-carousel .plato-next').forEach(btn => btn.setAttribute('aria-label', labels[1]));
  }

  function setupVideoObserver() {
    if (videoObserver || !('IntersectionObserver' in window)) return;
    videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting && !reducedMotion.matches && !document.hidden) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, {threshold:0.55});
  }

  function decorateSlides() {
    setupVideoObserver();
    document.querySelectorAll('#slides > .slide-group > .slide-item').forEach(item => {
      const video = item.querySelector(':scope > video');
      if (!video || video.dataset.reviraObserved) return;
      video.controls = false;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.dataset.reviraObserved = 'true';
      videoObserver?.observe(video);
    });
  }

  function observeChildren(container, fn) {
    if (!container) return;
    // Solo hijos inmediatos: no observa las modificaciones de imágenes interiores.
    const observer = new MutationObserver(mutations => {
      if (mutations.some(m => m.addedNodes.length > 0)) fn(container);
    });
    observer.observe(container, {childList:true});
    fn(container);
  }

  function init() {
    unifyLogos();
    document.querySelectorAll('.plato-carousel, .plato-gallery').forEach(container => {
      observeChildren(container, decorateGallery);
    });
    observeChildren(document.getElementById('slides'), decorateSlides);
    labelCarouselButtons();
    document.addEventListener('revira:languagechange', () => {
      labelCarouselButtons();
      describePhotos();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) document.querySelectorAll('#slides video').forEach(video => video.pause());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();


/* Cabecera y fecha */
/** La Revirá V9 · detalles de interacción discretos y accesibles */
(() => {
  'use strict';
  const header = document.getElementById('siteHeader');
  function updateHeader() {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});

  // Mostrar el año actual si cambia, sin depender de una nueva publicación.
  const copyright = document.querySelector('.footer-bottom [data-i18n="footer_copy"]');
  if (copyright) {
    const updateYear = () => {
      const year = String(new Date().getFullYear());
      copyright.textContent = copyright.textContent.replace(/©\s*\d{4}/, `© ${year}`);
    };
    updateYear();
    document.addEventListener('revira:languagechange', updateYear);
  }
})();

