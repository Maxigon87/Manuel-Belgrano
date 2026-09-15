/* ==========================================================================
   ESCUELA N°3 MANUEL BELGRANO - ENRUTADOR DINÁMICO SPA (SINGLE PAGE APP)
   Mantiene el Header y Footer fijos, cambiando sólo la zona de contenido main.
   ========================================================================== */

(function () {
    "use strict";

    // Caché de páginas precargadas para navegación instantánea
    const pageCache = new Map();

    /**
     * Obtiene el elemento <main> de la página actual o del HTML analizado
     */
    function getMainContainer(doc = document) {
        return doc.querySelector("#main-content") || doc.querySelector("main");
    }

    /**
     * Actualiza el estado activo de los enlaces en el menú del Header
     */
    function updateActiveNavLinks(targetPath) {
        const navLinks = document.querySelectorAll("header nav a, header a[href]");
        const currentFile = targetPath.split("/").pop().split("#")[0] || "index.html";

        navLinks.forEach((link) => {
            const linkHref = link.getAttribute("href");
            if (!linkHref) return;

            const linkFile = linkHref.split("/").pop().split("#")[0];

            if (linkFile === currentFile || (currentFile === "" && linkFile === "index.html")) {
                link.classList.add("bg-surface-container-high", "font-semibold");
                link.classList.remove("text-on-surface-variant");
            } else if (linkHref.endsWith(".html")) {
                link.classList.remove("bg-surface-container-high", "font-semibold");
                link.classList.add("text-on-surface-variant");
            }
        });
    }

    /**
     * Re-inicializa plugins y widgets tras actualizar el contenido principal
     */
    function reinitPageScripts() {
        // Re-inicializar Owl Carousel si existe
        if (typeof $.fn !== "undefined" && typeof $.fn.owlCarousel !== "undefined") {
            if ($(".service-carousel").length) {
                $(".service-carousel").owlCarousel({
                    autoplay: true, smartSpeed: 1500, margin: 30, dots: false, loop: true, nav: true,
                    navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
                    responsive: { 0: { items: 1 }, 576: { items: 1 }, 768: { items: 2 }, 992: { items: 3 } }
                });
            }
            if ($(".team-carousel").length) {
                $(".team-carousel").owlCarousel({
                    autoplay: true, smartSpeed: 1500, margin: 30, dots: false, loop: true, nav: true,
                    navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
                    responsive: { 0: { items: 1 }, 576: { items: 2 }, 768: { items: 3 }, 992: { items: 4 } }
                });
            }
            if ($(".testimonial-carousel").length) {
                $(".testimonial-carousel").owlCarousel({
                    center: true, autoplay: true, smartSpeed: 1000, margin: 30, dots: true, loop: true,
                    responsive: { 0: { items: 1 }, 576: { items: 1 }, 768: { items: 2 }, 992: { items: 3 } }
                });
            }
        }

        // Re-inicializar fecha si existe el elemento #fecha
        const fechaElement = document.getElementById("fecha");
        if (fechaElement) {
            const fecha = new Date();
            const dia = String(fecha.getDate()).padStart(2, "0");
            const mes = String(fecha.getMonth() + 1).padStart(2, "0");
            const año = String(fecha.getFullYear()).slice(-2);
            fechaElement.textContent = `${dia}/${mes}/${año}`;
        }

        // Ejecutar evento personalizado para scripts externos
        document.dispatchEvent(new CustomEvent("spa:pageLoaded"));
    }

    /**
     * Carga y renderiza el contenido de una URL sin recargar la página completa
     */
    async function navigateTo(url, pushState = true) {
        const currentMain = getMainContainer(document);
        if (!currentMain) return;

        const urlObj = new URL(url, window.location.origin);
        const targetPath = urlObj.pathname.split("/").pop() || "index.html";
        const hash = urlObj.hash;

        // Si es sólo un ancla # dentro de la misma página
        if (urlObj.pathname === window.location.pathname && hash) {
            const targetEl = document.querySelector(hash);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
                return;
            }
        }

        try {
            // Efecto suave de salida (fade out en el área main)
            currentMain.style.transition = "opacity 0.15s ease, transform 0.15s ease";
            currentMain.style.opacity = "0.4";

            let htmlText = pageCache.get(urlObj.pathname);
            if (!htmlText) {
                const response = await fetch(urlObj.href);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                htmlText = await response.text();
                pageCache.set(urlObj.pathname, htmlText);
            }

            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, "text/html");
            const newMain = getMainContainer(newDoc);

            if (!newMain) {
                window.location.href = url;
                return;
            }

            // Actualizar contenido principal
            currentMain.innerHTML = newMain.innerHTML;

            // Actualizar título de la página
            if (newDoc.title) {
                document.title = newDoc.title;
            }

            // Actualizar URL e historial
            if (pushState) {
                history.pushState({ path: urlObj.href }, "", urlObj.href);
            }

            // Desplazar vista al tope o al hash
            if (hash) {
                const targetEl = document.querySelector(hash);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: "smooth" });
                } else {
                    window.scrollTo(0, 0);
                }
            } else {
                window.scrollTo(0, 0);
            }

            // Actualizar estado del menú
            updateActiveNavLinks(targetPath);

            // Re-inicializar JS y restablecer opacidad
            reinitPageScripts();
            currentMain.style.opacity = "1";

        } catch (err) {
            console.warn("Fallo en navegación SPA, redirigiendo convencionalmente:", err);
            window.location.href = url;
        }
    }

    /**
     * Interceptor global de clics en enlaces
     */
    document.addEventListener("click", function (e) {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (
            !href ||
            href.startsWith("javascript:") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            link.getAttribute("target") === "_blank" ||
            link.hasAttribute("onclick")
        ) {
            return;
        }

        // Si es un ancla interna dentro de la misma página (#seccion)
        if (href.startsWith("#")) {
            const targetEl = document.querySelector(href);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: "smooth" });
            }
            return;
        }

        // Comprobar si es un enlace interno del sitio (.html)
        const isInternal = link.hostname === window.location.hostname || !link.hostname;
        if (isInternal && (href.endsWith(".html") || href.includes(".html#"))) {
            e.preventDefault();
            navigateTo(link.href, true);
        }
    });

    /**
     * Manejador del botón Atrás/Adelante del navegador
     */
    window.addEventListener("popstate", function () {
        navigateTo(window.location.href, false);
    });

    // Guardar el estado inicial en history
    if (!history.state) {
        history.replaceState({ path: window.location.href }, "", window.location.href);
    }
})();
