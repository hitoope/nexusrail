/* ═══════════════════════════════════════════════════════════════════════════
   NEXUS Rail — flechas para el carrusel de Core Services (Home)

   El widget n-carousel de Elementor se generó sin flechas, y sus bullets de
   paginación se pintan vacíos (contenedor de 0×0). Resultado: en escritorio
   no hay ninguna forma evidente de pasar de tarjeta, y solo se ven 3 de 6.

   Esto no toca el marcado de Elementor: localiza la instancia de Swiper ya
   inicializada y la conduce con su propia API.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var CSS = '' +
    '.nx-has-nav{position:relative}' +
    '.nx-carousel-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:5;' +
      'width:44px;height:44px;display:flex;align-items:center;justify-content:center;' +
      'padding:0;background:rgba(0,0,0,.55);color:#fff;border:1px solid rgba(255,255,255,.25);' +
      'border-radius:50%;cursor:pointer;transition:background .2s,border-color .2s}' +
    '.nx-carousel-nav:hover{background:#db0b17;border-color:#db0b17}' +
    '.nx-carousel-nav:focus-visible{outline:2px solid #ff3a45;outline-offset:3px}' +
    '.nx-carousel-nav--prev{left:-8px}' +
    '.nx-carousel-nav--next{right:-8px}' +
    /* En móvil se ve una sola tarjeta y deslizar es el gesto natural: estorbarían. */
    '@media(max-width:767px){.nx-carousel-nav{display:none}}';

  function estilos() {
    if (document.getElementById('nx-carousel-css')) return;
    var st = document.createElement('style');
    st.id = 'nx-carousel-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function boton(dir, etiqueta, d, S) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'nx-carousel-nav nx-carousel-nav--' + dir;
    b.setAttribute('aria-label', etiqueta);
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">' +
      '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';
    b.addEventListener('click', function () {
      // Quien toma el control manda: el autoplay se detiene y no vuelve.
      if (S.autoplay && S.autoplay.running) S.autoplay.stop();
      if (dir === 'prev') { S.slidePrev(); } else { S.slideNext(); }
    });
    return b;
  }

  function montar(w, S) {
    if (w.classList.contains('nx-has-nav')) return;
    estilos();
    w.appendChild(boton('prev', 'Previous services', 'M15 18l-6-6 6-6', S));
    w.appendChild(boton('next', 'Next services',     'M9 18l6-6-6-6',  S));
    w.classList.add('nx-has-nav');
  }

  /* Elementor inicializa Swiper por su cuenta y no avisa. En lugar de suponer
     que ya está listo, lo esperamos: ~5 s de margen y nos rendimos en silencio. */
  function esperar() {
    var intentos = 0;
    (function mirar() {
      var w = document.querySelector('.elementor-widget-n-carousel');
      if (w) {
        var cont = w.querySelector('.swiper');
        if (cont && cont.swiper) { montar(w, cont.swiper); return; }
      }
      if (++intentos < 50) setTimeout(mirar, 100);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', esperar);
  } else {
    esperar();
  }
})();
