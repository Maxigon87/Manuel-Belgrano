(function ($) {
    "use strict";

    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $(".navbar .dropdown")
                    .off("mouseenter mouseleave")
                    .on("mouseenter", function () {
                        $(this).addClass("show");
                        $(this).find("> .dropdown-toggle").attr("aria-expanded", "true");
                        $(this).find("> .dropdown-menu").addClass("show");
                    })
                    .on("mouseleave", function () {
                        $(this).removeClass("show");
                        $(this).find("> .dropdown-toggle").attr("aria-expanded", "false");
                        $(this).find("> .dropdown-menu").removeClass("show");
                    });
            } else {
                $(".navbar .dropdown").off("mouseenter mouseleave");
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });

    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $(".back-to-top").fadeIn("slow");
        } else {
            $(".back-to-top").fadeOut("slow");
        }
    });
    $(".back-to-top").click(function () {
        $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
        return false;
    });

    // Date and time picker
    if (typeof $.fn.datetimepicker !== "undefined") {
        if ($("#date").length) {
            $("#date").datetimepicker({
                format: "L",
            });
        }
        if ($("#time").length) {
            $("#time").datetimepicker({
                format: "LT",
            });
        }
    }

    // Service carousel
    if ($.fn.owlCarousel && $(".service-carousel").length) {
        $(".service-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            margin: 30,
            dots: false,
            loop: true,
            nav: true,
            navText: [
                '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                '<i class="fa fa-angle-right" aria-hidden="true"></i>',
            ],
            responsive: {
                0: {
                    items: 1,
                },
                576: {
                    items: 1,
                },
                768: {
                    items: 2,
                },
                992: {
                    items: 3,
                },
            },
        });
    }

    // Team carousel
    if ($.fn.owlCarousel && $(".team-carousel").length) {
        $(".team-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            margin: 30,
            dots: false,
            loop: true,
            nav: true,
            navText: [
                '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                '<i class="fa fa-angle-right" aria-hidden="true"></i>',
            ],
            responsive: {
                0: {
                    items: 1,
                },
                576: {
                    items: 2,
                },
                768: {
                    items: 3,
                },
                992: {
                    items: 4,
                },
            },
        });
    }

    // Testimonials carousel
    if ($.fn.owlCarousel && $(".testimonial-carousel").length) {
        $(".testimonial-carousel").owlCarousel({
            center: true,
            autoplay: true,
            smartSpeed: 1000,
            margin: 30,
            dots: true,
            loop: true,
            responsive: {
                0: {
                    items: 1,
                },
                576: {
                    items: 1,
                },
                768: {
                    items: 2,
                },
                992: {
                    items: 3,
                },
            },
        });
    }
})(jQuery);

//Contraseña para ingresar a docentes
async function verificarClave() {
    const clave = prompt("Por favor, ingresa la contraseña para acceder:");

    if (clave === null || clave === "") {
        // Si el usuario hace clic en Cancelar o no ingresa nada
        alert("Acceso denegado. No se proporcionó la contraseña.");
        return; // Sale de la función sin hacer nada
    }

    const input = clave.trim();

    try {
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/manuel-belgrano-web-1d164/databases/(default)/documents/accesos/${input}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.fields) {
                const hasDocenteRole = data.fields.rol && data.fields.rol.stringValue === "docente";
                const isEnabled = data.fields.enabled && data.fields.enabled.booleanValue === true;
                const isExplicitlyDisabled = data.fields.enabled && data.fields.enabled.booleanValue === false;

                if (!isExplicitlyDisabled && (hasDocenteRole || isEnabled)) {
                    // Redirige si la clave es correcta y guarda el acceso localmente
                    sessionStorage.setItem("access_granted", "true");
                    window.location.href = "docentes.html";
                    return;
                }
            }
        }
        alert("Contraseña incorrecta. Intente nuevamente.");
    } catch (error) {
        console.error("Error al validar contraseña en la nube:", error);
        alert("Error al intentar conectar con la base de datos.");
    }
}

//Click globo emergente en drive
function mostrarGlobo() {
    const globo = document.getElementById("globo");
    if (globo) {
        globo.classList.toggle("show-tooltip");
    }
}

/* ==========================================================================
   SISTEMA DE MODO OSCURO / CLARO Y SUGERENCIA NOCTURNA (> 21:00)
   ========================================================================== */
function updateThemeToggleUI(isDark) {
    const buttons = document.querySelectorAll(".theme-toggle-btn");
    buttons.forEach(btn => {
        const icon = btn.querySelector(".theme-icon");
        if (icon) {
            icon.textContent = isDark ? "light_mode" : "dark_mode";
        }
        btn.setAttribute("title", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
        btn.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    });
}

function initThemeSystem() {
    // Por defecto siempre modo claro si no hay preferencia explícita guardada
    const savedTheme = localStorage.getItem("mb_theme_mode");
    const isDark = savedTheme === "dark";

    if (isDark) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
    updateThemeToggleUI(isDark);

    // Revisar horario nocturno (> 21:00 o antes de 06:00) para mostrar mensaje por primera vez en el día
    checkNightPrompt();
}

window.toggleThemeMode = function() {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const newMode = isCurrentlyDark ? "light" : "dark";

    if (newMode === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("mb_theme_mode", newMode);
    updateThemeToggleUI(newMode === "dark");

    // Cerrar sugerencia si estaba abierta
    closeNightPrompt();
};

function checkNightPrompt() {
    const now = new Date();
    const currentHour = now.getHours();
    const isNightTime = currentHour >= 21 || currentHour < 6;

    if (!isNightTime) return;

    // Verificar si ya se mostró hoy
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lastPromptDate = localStorage.getItem("mb_night_prompt_shown_date");

    if (lastPromptDate === todayStr) {
        return; // Ya fue mostrado hoy
    }

    // Esperar un momento a que la página cargue para que se vea amigable y elegante
    setTimeout(() => {
        showNightPromptBubble();
        localStorage.setItem("mb_night_prompt_shown_date", todayStr);
    }, 1200);
}

function showNightPromptBubble() {
    // Buscar el contenedor del toggle
    const toggleContainers = document.querySelectorAll(".theme-toggle-container");
    if (!toggleContainers.length) return;

    // Solo anexar al primer toggle visible
    const container = toggleContainers[0];
    if (container.querySelector(".night-theme-prompt")) return;

    const isDark = document.documentElement.classList.contains("dark");

    const promptEl = document.createElement("div");
    promptEl.className = "night-theme-prompt";
    promptEl.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="color: #38bdf8; font-size: 20px;">nightlight</span>
                <span style="font-weight: 700; font-size: 14px;">¡Buenas noches!</span>
            </div>
            <button onclick="closeNightPrompt()" style="background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; line-height: 1;" title="Cerrar">
                <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
            </button>
        </div>
        <p style="font-size: 13px; line-height: 1.4; margin: 0; opacity: 0.9;">
            Ya es de noche. Si preferís descansar la vista, desde este interruptor podés activar o desactivar el <strong>modo oscuro</strong> o <strong>claro</strong> cuando gustes.
        </p>
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;">
            <button onclick="window.toggleThemeMode()" style="padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 8px; background: #0284c7; color: #ffffff; border: none; cursor: pointer;">
                ${isDark ? 'Cambiar a modo claro' : 'Probar modo oscuro'}
            </button>
            <button onclick="closeNightPrompt()" style="padding: 6px 10px; font-size: 12px; font-weight: 500; border-radius: 8px; background: transparent; border: 1px solid rgba(148, 163, 184, 0.4); color: inherit; cursor: pointer;">
                Entendido
            </button>
        </div>
    `;

    container.appendChild(promptEl);
}

window.closeNightPrompt = function() {
    const prompts = document.querySelectorAll(".night-theme-prompt");
    prompts.forEach(p => p.remove());
};

// Inicializar inmediatamente y tras carga de DOM
initThemeSystem();
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeSystem);
} else {
    initThemeSystem();
}
document.addEventListener("spa:pageLoaded", initThemeSystem);


//fecha de index

const fecha = new Date();
const dia = String(fecha.getDate()).padStart(2, "0");
const mes = String(fecha.getMonth() + 1).padStart(2, "0");
const año = String(fecha.getFullYear()).slice(-2);
const fechaElement = document.getElementById("fecha");
if (fechaElement) {
    fechaElement.textContent = `${dia}/${mes}/${año}`;
}

//Cartel de envio de formulario
const form = document.getElementById("contactForm");
const messageDiv = document.getElementById("form-message");

//Clima 
const API_KEY = window.API_KEY || "";
const lat = -33.2955; // Latitud de San Luis, Argentina
const lon = -66.3370; // Longitud de San Luis, Argentina

const climaElement = document.getElementById("clima");
if (climaElement) {
    if (API_KEY) {
        const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&lang=es`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const temp = data.current.temp_c;
                const desc = data.current.condition.text;
                const icon = data.current.condition.icon;
                const nombreCiudad = data.location.name;
                climaElement.innerHTML = `${nombreCiudad}: ${temp}°C, ${desc} <img src="https:${icon}" alt="icono clima">`;
            })
            .catch(err => {
                console.error("Error al obtener el clima:", err);
                climaElement.textContent = "Clima no disponible";
            });
    } else {
        climaElement.textContent = "Clima no disponible";
    }
}

/* ==========================================================================
   ANIMACIONES AL HACER SCROLL Y CONTADORES ANIMADOS (INTERSECTION OBSERVER)
   ========================================================================== */
(function () {
    function initScrollAnimations() {
        // 1. Detección automática de secciones y bloques para aparición suave al hacer scroll
        const scrollElements = document.querySelectorAll(
            "main section, main > div, main > div > section, main .max-w-container-max > div, .scroll-reveal, [data-animate]"
        );

        if (scrollElements.length > 0) {
            scrollElements.forEach(function (el) {
                // Si el elemento contiene el banner o hero superior inmediato (primeros 500px), no ocultarlo
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.75) {
                    el.classList.add("scroll-reveal", "is-visible");
                } else {
                    el.classList.add("scroll-reveal");
                }
            });

            if (!("IntersectionObserver" in window)) {
                scrollElements.forEach(function (el) {
                    el.classList.add("is-visible");
                });
            } else {
                const observerOptions = {
                    root: null,
                    rootMargin: "0px 0px -50px 0px",
                    threshold: 0.15
                };

                const scrollObserver = new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            observer.unobserve(entry.target);
                        }
                    });
                }, observerOptions);

                scrollElements.forEach(function (el) {
                    if (!el.classList.contains("is-visible")) {
                        scrollObserver.observe(el);
                    }
                });
            }
        }

        // 2. Contador animado para las estadísticas (+140 Años, 200+ Docentes, 800+ Alumnos, 100%)
        const statNumbers = document.querySelectorAll(".stat-number");

        if (statNumbers.length > 0) {
            function animateCounter(el) {
                const targetVal = parseInt(el.getAttribute("data-target"), 10);
                if (isNaN(targetVal)) return;

                const prefix = el.getAttribute("data-prefix") || "";
                const suffix = el.getAttribute("data-suffix") || "";
                const duration = 1800; // 1.8 segundos
                const startTimestamp = performance.now();

                function step(now) {
                    const elapsed = now - startTimestamp;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Función de suavizado (easeOutQuart)
                    const easeProgress = 1 - Math.pow(1 - progress, 4);
                    const currentVal = Math.floor(easeProgress * targetVal);

                    el.textContent = `${prefix}${currentVal}${suffix}`;

                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.textContent = `${prefix}${targetVal}${suffix}`;
                    }
                }

                requestAnimationFrame(step);
            }

            if (!("IntersectionObserver" in window)) {
                statNumbers.forEach(function (el) {
                    const targetVal = el.getAttribute("data-target");
                    if (targetVal) {
                        const prefix = el.getAttribute("data-prefix") || "";
                        const suffix = el.getAttribute("data-suffix") || "";
                        el.textContent = `${prefix}${targetVal}${suffix}`;
                    }
                });
            } else {
                const statsObserver = new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            animateCounter(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.2
                });

                statNumbers.forEach(function (el) {
                    statsObserver.observe(el);
                });
            }
        }
        // 3. Parallax suave en la imagen del Hero (.hero-bg-img) al hacer scroll
        const heroBg = document.querySelector(".hero-bg-img");
        if (heroBg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            window.addEventListener("scroll", function () {
                const scrolled = window.scrollY;
                if (scrolled < 750) {
                    heroBg.style.transform = `translateY(${scrolled * 0.22}px)`;
                }
            }, { passive: true });
        }

        // Limpieza de estado de salida al retroceder/avanzar en el historial (bfcache)
        window.addEventListener("pageshow", function (event) {
            if (event.persisted) {
                document.body.classList.remove("page-exit");
            }
        });
    }

    /* ==========================================================================
       CONTROLADOR DEL PRELOADER / CARGADOR INSTITUCIONAL
       ========================================================================== */
    function initPreloader() {
        let preloader = document.getElementById("mb-preloader");
        if (!preloader) {
            preloader = document.createElement("div");
            preloader.id = "mb-preloader";
            preloader.innerHTML = `
                <div class="preloader-emblem">
                    <div class="preloader-ring"></div>
                    <img src="img/logo mb.png" alt="Cargando...">
                </div>
                <div class="preloader-text">Cargando...</div>
                <div class="preloader-bar-bg">
                    <div class="preloader-bar-fill"></div>
                </div>
            `;
            document.body.prepend(preloader);
        }

        function hidePreloader() {
            if (!preloader || preloader.classList.contains("preloader-hidden")) return;
            preloader.classList.add("preloader-hidden");
            setTimeout(() => {
                if (preloader.parentNode) preloader.remove();
            }, 550);
        }

        // Ocultar cuando la ventana cargue por completo (imágenes, fuentes, estilos)
        if (document.readyState === "complete") {
            setTimeout(hidePreloader, 350);
        } else {
            window.addEventListener("load", function () {
                setTimeout(hidePreloader, 350);
            });
            // Fallback de seguridad por si algún recurso externo tarda demasiado
            setTimeout(hidePreloader, 2500);
        }
    }

    initPreloader();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initScrollAnimations);
    } else {
        initScrollAnimations();
    }

    document.addEventListener("spa:pageLoaded", function () {
        initScrollAnimations();
    });
})();

/* ==========================================================================
   SISTEMA GLOBAL DE LIGHTBOX PARA GALERÍA Y TRABAJOS DE ALUMNOS
   ========================================================================== */
(function () {
    let globalLightbox = null;
    let lightboxImg = null;
    let lightboxCaption = null;

    function createGlobalLightbox() {
        if (document.getElementById("global-image-lightbox")) {
            globalLightbox = document.getElementById("global-image-lightbox");
            lightboxImg = document.getElementById("global-image-lightbox-img");
            lightboxCaption = document.getElementById("global-image-lightbox-caption");
            return;
        }

        globalLightbox = document.createElement("div");
        globalLightbox.id = "global-image-lightbox";
        globalLightbox.className = "global-image-lightbox";
        globalLightbox.setAttribute("aria-hidden", "true");
        globalLightbox.innerHTML = `
            <button type="button" class="global-image-lightbox__close" id="global-image-lightbox-close" aria-label="Cerrar imagen ampliada">
                &times;
            </button>
            <div class="global-image-lightbox__container">
                <img id="global-image-lightbox-img" class="global-image-lightbox__img" src="" alt="Imagen ampliada" />
                <div id="global-image-lightbox-caption" class="global-image-lightbox__caption"></div>
            </div>
        `;

        document.body.appendChild(globalLightbox);
        lightboxImg = document.getElementById("global-image-lightbox-img");
        lightboxCaption = document.getElementById("global-image-lightbox-caption");

        const closeBtn = document.getElementById("global-image-lightbox-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", closeGlobalLightbox);
        }

        globalLightbox.addEventListener("click", function (e) {
            if (e.target === globalLightbox || e.target.classList.contains("global-image-lightbox__container")) {
                closeGlobalLightbox();
            }
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && globalLightbox && globalLightbox.classList.contains("is-visible")) {
                closeGlobalLightbox();
            }
        });
    }

    function openGlobalLightbox(src, altText) {
        if (!globalLightbox) createGlobalLightbox();
        if (!src) return;

        lightboxImg.src = src;
        lightboxImg.alt = altText || "Imagen de producción escolar ampliada";
        lightboxCaption.textContent = altText || "";

        globalLightbox.classList.add("is-visible");
        document.body.classList.add("lightbox-open");
        globalLightbox.setAttribute("aria-hidden", "false");
    }

    function closeGlobalLightbox() {
        if (!globalLightbox) return;
        globalLightbox.classList.remove("is-visible");
        document.body.classList.remove("lightbox-open");
        globalLightbox.setAttribute("aria-hidden", "true");
        if (lightboxImg) lightboxImg.src = "";
    }

    window.openGlobalLightbox = openGlobalLightbox;
    window.closeGlobalLightbox = closeGlobalLightbox;

    function bindLightboxToImages() {
        createGlobalLightbox();

        // Detectar imágenes de producciones escolares en galerías, offcanvas y publicaciones
        const targetImages = document.querySelectorAll(
            ".galeria-imagenes img, " +
            ".alumnos-modales img, " +
            ".alumnos-grid .alumno-card img, " +
            "article img, " +
            "#gridGaleria img, " +
            ".galeria-item img"
        );

        targetImages.forEach(function (img) {
            if (img.classList.contains("has-lightbox-bound") || img.closest(".no-lightbox")) return;

            // Evitar que el clic en la miniatura de la tarjeta de alumno abra el lightbox antes que el offcanvas si no lo desea
            // Pero si el usuario hace clic dentro de la vista del alumno, o en galerías, sí abre.
            if (img.closest(".alumno-card")) {
                return; // Las tarjetas abren el panel del alumno
            }

            img.classList.add("has-lightbox-bound");
            img.style.cursor = "zoom-in";

            img.addEventListener("click", function (e) {
                e.stopPropagation();
                const src = img.currentSrc || img.src;
                const caption = img.alt || img.getAttribute("title") || "";
                openGlobalLightbox(src, caption);
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindLightboxToImages);
    } else {
        bindLightboxToImages();
    }

    document.addEventListener("spa:pageLoaded", bindLightboxToImages);
})();










