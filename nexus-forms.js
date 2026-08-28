/* ═══════════════════════════════════════════════════════════════════════════
   NEXUS Rail — envío de formularios en sitio estático

   ▼▼▼  LO ÚNICO QUE TIENES QUE CAMBIAR ESTÁ AQUÍ DEBAJO  ▼▼▼

   1. Entra en https://formspree.io y crea una cuenta (gratis).
   2. Crea un formulario nuevo y pon como destinatario  info@nexusrail.ca
   3. Formspree te dará una dirección tipo  https://formspree.io/f/abcdwxyz
   4. Pega ESA dirección entre las comillas de abajo y guarda el fichero.

   Puedes usar el mismo endpoint para los dos formularios: en el correo verás
   de cuál viene por el campo "formulario".
   ═══════════════════════════════════════════════════════════════════════════ */

var NEXUS_FORM_ENDPOINT = "https://formspree.io/f/PEGA_AQUI_TU_CODIGO";

/* ═══════════════════ a partir de aquí no hace falta tocar nada ═══════════ */

(function () {
  'use strict';

  var SIN_CONFIGURAR = NEXUS_FORM_ENDPOINT.indexOf("PEGA_AQUI") !== -1;

  var TEXTO = {
    enviando: 'Sending…',
    ok: 'Thank you. Your message has been sent — we’ll get back to you shortly.',
    error: 'Sorry, your message could not be sent. Please email us directly at info@nexusrail.ca',
    sinConfig: 'Este formulario todavía no está conectado. Falta pegar el código de Formspree en nexus-forms.js.'
  };

  /* --- Mensaje de resultado, con el aspecto del sitio -------------------- */
  function pinta(form, tipo, texto) {
    var box = form.querySelector('[data-nexus-msg]');
    if (!box) {
      box = document.createElement('div');
      box.setAttribute('data-nexus-msg', '');
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      box.style.cssText =
        'margin-top:18px;padding:14px 18px;font-size:15px;line-height:1.5;' +
        'background:rgba(255,255,255,.06);border-left:3px solid #db0b17;' +
        'color:#fff;';
      form.appendChild(box);
    }
    var color = tipo === 'ok' ? '#3fb950' : (tipo === 'wait' ? '#c4c4c4' : '#db0b17');
    box.style.borderLeftColor = color;
    box.style.display = 'block';
    box.textContent = texto;
    return box;
  }

  function limpia(form) {
    var box = form.querySelector('[data-nexus-msg]');
    if (box) box.style.display = 'none';
  }

  /* --- Envío ------------------------------------------------------------- */
  function envia(form) {
    if (SIN_CONFIGURAR) {
      pinta(form, 'error', TEXTO.sinConfig);
      return;
    }

    var boton = form.querySelector('button[type="submit"], input[type="submit"]');
    var etiquetaOriginal = boton ? boton.innerHTML : null;

    if (boton) {
      boton.disabled = true;
      boton.style.opacity = '0.6';
      boton.style.cursor = 'wait';
    }
    pinta(form, 'wait', TEXTO.enviando);

    var datos = new FormData(form);
    // de qué página viene, para distinguirlos en el correo
    datos.append('formulario', document.title.split('–')[0].trim() || location.pathname);

    fetch(NEXUS_FORM_ENDPOINT, {
      method: 'POST',
      body: datos,
      headers: { Accept: 'application/json' }
    })
      .then(function (r) {
        if (r.ok) {
          form.reset();
          pinta(form, 'ok', TEXTO.ok);
        } else {
          return r.json().then(function (d) {
            var det = d && d.errors && d.errors.length
              ? d.errors.map(function (e) { return e.message; }).join('. ')
              : TEXTO.error;
            pinta(form, 'error', det);
          }).catch(function () { pinta(form, 'error', TEXTO.error); });
        }
      })
      .catch(function () { pinta(form, 'error', TEXTO.error); })
      .finally(function () {
        if (boton) {
          boton.disabled = false;
          boton.style.opacity = '';
          boton.style.cursor = '';
          if (etiquetaOriginal !== null) boton.innerHTML = etiquetaOriginal;
        }
      });
  }

  /* --- Interceptamos ANTES que el JS de Elementor -------------------------
     Elementor engancha su propio manejador al formulario y lo mandaría a
     admin-ajax.php, que en un sitio estático no existe. Escuchamos en fase
     de captura sobre el documento: eso corre antes que cualquier manejador
     puesto sobre el propio formulario, y stopImmediatePropagation lo corta.
     ---------------------------------------------------------------------- */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.hasAttribute || !form.hasAttribute('data-nexus-form')) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
      limpia(form);
      return;
    }
    envia(form);
  }, true);

  /* Elementor también puede lanzar el envío desde el click del botón */
  document.addEventListener('click', function (e) {
    var boton = e.target.closest && e.target.closest('button[type="submit"]');
    if (!boton) return;
    var form = boton.form || boton.closest('form');
    if (!form || !form.hasAttribute('data-nexus-form')) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
      limpia(form);
      return;
    }
    envia(form);
  }, true);
})();
