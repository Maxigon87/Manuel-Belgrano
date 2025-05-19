(function ($) {
    "use strict";

    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $(".navbar .dropdown")
                    .on("mouseover", function () {
                        $(".dropdown-toggle", this).trigger("click");
                    })
                    .on("mouseout", function () {
                        $(".dropdown-toggle", this).trigger("click").blur();
                    });
            } else {
                $(".navbar .dropdown").off("mouseover").off("mouseout");
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
    $("#date").datetimepicker({
        format: "L",
    });
    $("#time").datetimepicker({
        format: "LT",
    });

    // Service carousel
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

    // Team carousel
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

    // Testimonials carousel
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
})(jQuery);

//Contraseña para ingresar a docentes
function verificarClave() {
    const clave = prompt("Por favor, ingresa la contraseña para acceder:");

    if (clave === null || clave === "") {
        // Si el usuario hace clic en Cancelar o no ingresa nada
        alert("Acceso denegado. No se proporcionó la contraseña.");
        return; // Sale de la función sin hacer nada
    }

    if (clave === "3escuelas2025") {
        // Redirige si la clave es correcta
        window.location.href = "docentes.html";
    } else {
        alert("Contraseña incorrecta. Intente nuevamente.");
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
document.getElementById("fecha").textContent = `${dia}/${mes}/${año}`;

//Cartel de envio de formulario
const form = document.getElementById("contactForm");
const messageDiv = document.getElementById("form-message");

//Clima 
const API_KEY = '8a06e798068047e3870154505252904';
const lat = -33.2955; // Latitud de San Luis, Argentina
const lon = -66.3370; // Longitud de San Luis, Argentina
const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&lang=es`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        const temp = data.current.temp_c; // Temperatura en °C
        const desc = data.current.condition.text; // Descripción del clima
        const icon = data.current.condition.icon; // Icono
        const nombreCiudad = data.location.name; // Nombre de la ciudad

        // Mostrar en el HTML
        document.getElementById('clima').innerHTML = `${nombreCiudad}: ${temp}°C, ${desc} <img src="https:${icon}" alt="icono clima">`;
    })
    .catch(err => {
        console.error('Error al obtener el clima:', err);
        document.getElementById('clima').textContent = 'Clima no disponible';
    });

//Login para entrar a Docentes: 


const CORRECT_PASSWORD = "3escuelas2025"; // ¡Cambia esto!

function checkPassword() {
    const input = document.getElementById("passwordInput").value;
    const errorMsg = document.getElementById("errorMsg");

    if (input === "") {
        errorMsg.textContent = "Ingrese una contraseña.";
    } else if (input === CORRECT_PASSWORD) {
        localStorage.setItem("access_granted", "true");
        window.location.href = "docentes.html"; // Asegurate que este path exista
    } else {
        errorMsg.textContent = "Contraseña incorrecta.";
    }
}

// Si ya se autenticó, no mostrar el modal
window.onload = function () {
    if (localStorage.getItem("access_granted") === "true") {
        document.getElementById("loginModal").style.display = "none";
    }
};
function abrirModal() {
    document.getElementById("loginModal").style.display = "flex";
}
  window.onclick = function (event) {
    const modal = document.getElementById("loginModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };





