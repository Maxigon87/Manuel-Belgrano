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
    globo.classList.toggle("show-tooltip");
}

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
        // 1. Configuración de Observer para animaciones de aparición con stagger
        const animatedElements = document.querySelectorAll("[data-animate]");

        if (animatedElements.length > 0) {
            if (!("IntersectionObserver" in window)) {
                // Fallback para navegadores sin IntersectionObserver
                animatedElements.forEach(function (el) {
                    el.classList.add("is-visible");
                });
            } else {
                const observerOptions = {
                    root: null,
                    rootMargin: "0px 0px -40px 0px",
                    threshold: 0.15
                };

                const scrollObserver = new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            const target = entry.target;
                            const delay = parseInt(target.getAttribute("data-delay") || "0", 10);

                            if (delay > 0) {
                                setTimeout(function () {
                                    target.classList.add("is-visible");
                                }, delay);
                            } else {
                                target.classList.add("is-visible");
                            }

                            observer.unobserve(target);
                        }
                    });
                }, observerOptions);

                animatedElements.forEach(function (el) {
                    scrollObserver.observe(el);
                });
            }
        }

        // 2. Contador animado para las estadísticas (+140 Años, 60+ Docentes, 800+ Alumnos)
        const statNumbers = document.querySelectorAll(".stat-number");

        if (statNumbers.length > 0) {
            function animateCounter(el) {
                const targetVal = parseInt(el.getAttribute("data-target"), 10);
                if (isNaN(targetVal)) return;

                const prefix = el.getAttribute("data-prefix") || "";
                const suffix = el.getAttribute("data-suffix") || "";
                const duration = 2000; // 2 segundos
                const startTimestamp = performance.now();

                function step(now) {
                    const elapsed = now - startTimestamp;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Función de suavizado (easeOutCubic)
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
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
                    threshold: 0.25
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

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initScrollAnimations);
    } else {
        initScrollAnimations();
    }
})();









