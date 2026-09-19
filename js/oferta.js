

(() => {
  'use strict';

  /* =========================================================
     1. DISPLACEMENT UTILS
     ========================================================= */

  const createSVG = (content, width, height) => `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}">
      ${content}
    </svg>
  `;

  const toDataURL = (svg) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  function getDisplacementMap({ width, height, radius, depth }) {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    const safeDepth = Math.max(
      0,
      Math.min(depth, Math.min(safeWidth, safeHeight) / 2)
    );

    const svg = createSVG(
      `
        <defs>
          <linearGradient id="gradY" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#0F0"/>
            <stop offset="100%" stop-color="#000"/>
          </linearGradient>

          <linearGradient id="gradX" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stop-color="#F00"/>
            <stop offset="100%" stop-color="#000"/>
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="#808080"/>

        <g filter="blur(2px)">
          <rect width="100%" height="100%" fill="#000080"/>
          <rect width="100%" height="100%" fill="url(#gradY)" />
          <rect width="100%" height="100%" fill="url(#gradX)" />

          <rect
            x="${safeDepth}"
            y="${safeDepth}"
            width="${Math.max(
              1,
              safeWidth - safeDepth * 2
            )}"
            height="${Math.max(
              1,
              safeHeight - safeDepth * 2
            )}"
            rx="${radius}"
            ry="${radius}"
            fill="#808080"
            filter="blur(${safeDepth}px)"
          />
        </g>
      `,
      safeWidth,
      safeHeight
    );

    return toDataURL(svg);
  }

  function getDisplacementFilter({
    width,
    height,
    radius,
    depth,
    strength = 100,
  }) {
    const map = getDisplacementMap({
      width,
      height,
      radius,
      depth,
    });

    const svg = createSVG(
      `
        <defs>
          <filter id="glass">
            <feImage href="${map}" result="map"/>

            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale="${strength}"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      `,
      Math.max(1, width),
      Math.max(1, height)
    );

    return `${toDataURL(svg)}#glass`;
  }

  window.DisplacementUtils = {
    getDisplacementMap,
    getDisplacementFilter,
  };

  /* =========================================================
     2. GLASS ELEMENT
     ========================================================= */

  class GlassElement extends HTMLElement {
    static svgSupport = CSS.supports(
      'backdrop-filter',
      'blur(10px)'
    );

    static lowPowerDevice =
      ('deviceMemory' in navigator &&
        navigator.deviceMemory <= 4) ||
      navigator.connection?.saveData === true ||
      window.matchMedia?.('(pointer: coarse)').matches === true;

    constructor() {
      super();

      this.attachShadow({ mode: 'open' });

      this._pointerDown = this._pointerDown.bind(this);
      this._pointerUp = this._pointerUp.bind(this);
    }

    static get observedAttributes() {
      return [
        'width',
        'height',
        'radius',
        'blur',
        'strength',
        'background-color',
      ];
    }

    connectedCallback() {
      this.render();
      this.setupEvents();
    }

    disconnectedCallback() {
      const box = this.shadowRoot?.querySelector('.glass');

      if (!box) return;

      box.removeEventListener(
        'pointerdown',
        this._pointerDown
      );

      box.removeEventListener(
        'pointerup',
        this._pointerUp
      );

      box.removeEventListener(
        'pointercancel',
        this._pointerUp
      );

      box.removeEventListener(
        'pointerleave',
        this._pointerUp
      );
    }

    attributeChangedCallback() {
      this.updateStyles();
    }

    get config() {
      return {
        width:
          Number(this.getAttribute('width')) || 250,

        height:
          Number(this.getAttribute('height')) || 150,

        radius:
          Number(this.getAttribute('radius')) || 30,

        blur:
          Number(this.getAttribute('blur')) || 10,

        strength:
          Number(this.getAttribute('strength')) || 80,

        background:
          this.getAttribute('background-color') ||
          'rgba(255,255,255,0.06)',
      };
    }

    _pointerDown() {
      const box =
        this.shadowRoot?.querySelector('.glass');

      if (box) {
        box.style.transform = 'scale(0.95)';
      }
    }

    _pointerUp() {
      const box =
        this.shadowRoot?.querySelector('.glass');

      if (box) {
        box.style.transform = 'scale(1)';
      }
    }

    setupEvents() {
      const box =
        this.shadowRoot.querySelector('.glass');

      if (!box) return;

      box.addEventListener(
        'pointerdown',
        this._pointerDown,
        { passive: true }
      );

      box.addEventListener(
        'pointerup',
        this._pointerUp,
        { passive: true }
      );

      box.addEventListener(
        'pointercancel',
        this._pointerUp,
        { passive: true }
      );

      box.addEventListener(
        'pointerleave',
        this._pointerUp,
        { passive: true }
      );
    }

    updateStyles() {
      const box =
        this.shadowRoot?.querySelector('.glass');

      if (!box) return;

      const {
        width,
        height,
        radius,
        blur,
        strength,
        background,
      } = this.config;

      let backdrop = `blur(${blur}px)`;

      /*
       * En dispositivos modestos usamos solamente blur.
       * El displacement SVG es más pesado.
       */
      const useDisplacement =
        GlassElement.svgSupport &&
        !GlassElement.lowPowerDevice &&
        window.DisplacementUtils;

      if (useDisplacement) {
        try {
          const filter =
            window.DisplacementUtils.getDisplacementFilter({
              width,
              height,
              radius,
              depth: 8,
              strength,
            });

          backdrop =
            `blur(${blur}px) url('${filter}')`;
        } catch {
          backdrop = `blur(${blur}px)`;
        }
      }

      Object.assign(box.style, {
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${radius}px`,
        background,
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop,
      });
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            pointer-events: auto;
          }

          .glass {
            position: relative;

            display: flex;
            align-items: center;
            justify-content: center;

            overflow: hidden;

            border: 1px solid rgba(255,255,255,0.25);

            background: rgba(255,255,255,0.18);

            box-shadow:
              0 8px 30px rgba(0,0,0,0.18),
              inset 0 1px 1px
              rgba(255,255,255,0.35);

            transition:
              transform .15s ease,
              backdrop-filter .3s ease,
              box-shadow .2s ease;

            will-change: transform;
          }

          .glass:hover {
            box-shadow:
              0 12px 35px rgba(0,0,0,0.22),
              inset 0 1px 1px
              rgba(255,255,255,0.45);
          }

          .content {
            width: 100%;
            height: 100%;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 0;

            pointer-events: none;
          }

          ::slotted(*) {
            pointer-events: none;
          }
        </style>

        <div class="glass">
          <div class="content">
            <slot></slot>
          </div>
        </div>
      `;

      this.updateStyles();
    }
  }

  if (!customElements.get('glass-element')) {
    customElements.define(
      'glass-element',
      GlassElement
    );
  }

  /* =========================================================
     3. MENÚ LATERAL
     ========================================================= */

  function toggleMenu() {
    const menu =
      document.getElementById('menuLateral');

    const overlay =
      document.getElementById('overlayMenu');

    if (!menu || !overlay) return;

    const abrir =
      !menu.classList.contains('active');

    menu.classList.toggle('active', abrir);
    overlay.classList.toggle('active', abrir);

    overlay.setAttribute(
      'aria-hidden',
      abrir ? 'false' : 'true'
    );
  }

  window.toggleMenu = toggleMenu;

  /* =========================================================
     4. ACORDEÓN OPTIMIZADO
     ========================================================= */

  function initAccordion() {
    const botones =
      document.querySelectorAll(
        '.acordeon-encabezado'
      );

    if (!botones.length) return;

    botones.forEach((boton) => {
      boton.addEventListener('click', () => {
        const item =
          boton.closest('.acordeon-item');

        if (!item) return;

        const panel =
          item.querySelector(
            '.acordeon-panel'
          );

        if (!panel) return;

        const abierto =
          item.classList.contains('is-open');

        /*
         * Cada .lista-acordeon funciona de forma
         * independiente.
         *
         * Solo cerramos el acordeón abierto dentro
         * de la misma lista.
         */
        if (!abierto) {
          const lista =
            item.closest('.lista-acordeon');

          const actual =
            lista?.querySelector(
              '.acordeon-item.is-open'
            );

          if (actual && actual !== item) {
            actual.classList.remove('is-open');

            const panelAnterior =
              actual.querySelector(
                '.acordeon-panel'
              );

            const botonAnterior =
              actual.querySelector(
                '.acordeon-encabezado'
              );

            if (panelAnterior) {
              panelAnterior.style.setProperty(
                '--panel-height',
                '0px'
              );

              /*
               * hidden se quita solamente después
               * de la transición mediante CSS/JS.
               */
              panelAnterior.hidden = false;
            }

            if (botonAnterior) {
              botonAnterior.setAttribute(
                'aria-expanded',
                'false'
              );
            }
          }

          item.classList.add('is-open');

          /*
           * El HTML trae hidden inicialmente.
           * Se elimina antes de medir la altura.
           */
          panel.hidden = false;

          /*
           * Una sola lectura de layout.
           */
          const alto =
            panel.scrollHeight;

          panel.style.setProperty(
            '--panel-height',
            `${alto}px`
          );

          boton.setAttribute(
            'aria-expanded',
            'true'
          );

          return;
        }

        /*
         * Cerrar el acordeón actual.
         */
        item.classList.remove('is-open');

        panel.style.setProperty(
          '--panel-height',
          '0px'
        );

        boton.setAttribute(
          'aria-expanded',
          'false'
        );
      });
    });
  }

  /* =========================================================
     5. CARRUSEL
     ========================================================= */

  function initCarousel() {
    const carruseles =
      document.querySelectorAll(
        '.carrusel'
      );

    const VELOCIDAD_PX_POR_SEG = 60;

    if (!carruseles.length) return;

    const modal =
      document.getElementById(
        'modalImagen'
      );

    const modalImg =
      modal?.querySelector(
        '.modal-imagen__imagen'
      );

    let carruselActivo = null;
    let botonQueAbrio = null;

    function ajustarVelocidad(carrusel) {
      const pista =
        carrusel.querySelector(
          '.carrusel__pista'
        );

      const primerGrupo =
        carrusel.querySelector(
          '.carrusel__grupo'
        );

      if (!pista || !primerGrupo) return;

      const anchoGrupo =
        primerGrupo.getBoundingClientRect()
          .width;

      if (anchoGrupo <= 0) return;

      pista.style.animationDuration =
        `${anchoGrupo / VELOCIDAD_PX_POR_SEG}s`;
    }

    function ajustarTodosLosCarruseles() {
      carruseles.forEach(
        ajustarVelocidad
      );
    }

    carruseles.forEach((carrusel) => {
      const pista =
        carrusel.querySelector(
          '.carrusel__pista'
        );

      if (!pista) return;

      const imagenes =
        pista.querySelectorAll('img');

      let pendientes = 0;

      imagenes.forEach((img) => {
        if (!img.complete) {
          pendientes++;
        }
      });

      if (pendientes === 0) {
        ajustarVelocidad(carrusel);
      } else {
        const marcarListo = () => {
          pendientes--;

          if (pendientes <= 0) {
            ajustarVelocidad(
              carrusel
            );
          }
        };

        imagenes.forEach((img) => {
          if (!img.complete) {
            img.addEventListener(
              'load',
              marcarListo,
              { once: true }
            );

            img.addEventListener(
              'error',
              marcarListo,
              { once: true }
            );
          }
        });
      }

      carrusel.addEventListener(
        'touchstart',
        () => {
          carrusel.classList.add(
            'pausado'
          );
        },
        { passive: true }
      );

      carrusel.addEventListener(
        'touchend',
        () => {
          if (
            !modal?.classList.contains(
              'activo'
            )
          ) {
            carrusel.classList.remove(
              'pausado'
            );
          }
        },
        { passive: true }
      );

      carrusel.addEventListener(
        'touchcancel',
        () => {
          if (
            !modal?.classList.contains(
              'activo'
            )
          ) {
            carrusel.classList.remove(
              'pausado'
            );
          }
        },
        { passive: true }
      );
    });

    /*
     * Un solo resize para todos los carruseles.
     */
    let resizeFrame = 0;

    window.addEventListener(
      'resize',
      () => {
        cancelAnimationFrame(
          resizeFrame
        );

        resizeFrame =
          requestAnimationFrame(() => {
            ajustarTodosLosCarruseles();
          });
      },
      { passive: true }
    );

    function abrirModal(boton) {
      if (!modal || !modalImg) {
        return;
      }

      const img =
        boton.querySelector('img');

      if (!img) return;

      carruselActivo =
        boton.closest('.carrusel');

      botonQueAbrio = boton;

      modalImg.src =
        img.currentSrc || img.src;

      modalImg.alt =
        img.alt ||
        'Imagen ampliada';

      modal.classList.add('activo');

      modal.setAttribute(
        'aria-hidden',
        'false'
      );

      document.body.style.overflow =
        'hidden';

      if (carruselActivo) {
        carruselActivo.classList.add(
          'pausado'
        );
      }

      modal
        .querySelector(
          '.modal-imagen__cerrar'
        )
        ?.focus();
    }

    function cerrarModal() {
      if (!modal || !modalImg) {
        return;
      }

      modal.classList.remove(
        'activo'
      );

      modal.setAttribute(
        'aria-hidden',
        'true'
      );

      document.body.style.overflow =
        '';

      modalImg.src = '';

      if (carruselActivo) {
        carruselActivo.classList.remove(
          'pausado'
        );
      }

      carruselActivo = null;

      if (botonQueAbrio) {
        botonQueAbrio.focus();
      }

      botonQueAbrio = null;
    }

    document
      .querySelectorAll(
        '.carrusel__boton'
      )
      .forEach((boton) => {
        boton.addEventListener(
          'click',
          () => {
            abrirModal(boton);
          }
        );
      });

    if (modal) {
      modal
        .querySelectorAll(
          '[data-cerrar-modal]'
        )
        .forEach((elemento) => {
          elemento.addEventListener(
            'click',
            cerrarModal
          );
        });

      document.addEventListener(
        'keydown',
        (e) => {
          if (
            e.key === 'Escape' &&
            modal.classList.contains(
              'activo'
            )
          ) {
            cerrarModal();
          }
        }
      );
    }
  }

  /* =========================================================
     6. INICIALIZACIÓN
     ========================================================= */

  function initApp() {
    initAccordion();
    initCarousel();
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initApp,
      { once: true }
    );
  } else {
    initApp();
  }
})();