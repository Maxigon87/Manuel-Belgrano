// js/news.js
// Lógica para cargar y renderizar noticias en la página principal

import { db } from "./firebase.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Función para cargar noticias de Firestore
async function cargarNoticias() {
    const carouselContainer = document.querySelector(".team-carousel");
    if (!carouselContainer) return; // Si no estamos en una página con carrusel, salir

    try {
        // Consultar las últimas 10 noticias ordenadas por fecha descendente
        const q = query(collection(db, "noticias"), orderBy("fecha", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        let html = "";
        
        if (querySnapshot.empty) {
            // Si no hay noticias, mostrar un mensaje premium
            html = `
                <div class="w-100 text-center py-5">
                    <h5 class="text-muted">No hay noticias recientes en este momento.</h5>
                </div>
            `;
            const carousel = $(".team-carousel");
            if (carousel.data("owl.carousel")) {
                carousel.owlCarousel("destroy");
            }
            carousel.html(html);
            return;
        }

        querySnapshot.forEach((doc) => {
            const noticia = doc.data();
            const fechaFormateada = noticia.fecha ? new Date(noticia.fecha.seconds * 1000).toLocaleDateString() : "";
            const fbLink = noticia.facebookLink || "#";

            html += `
                <div class="team-item text-center bg-white rounded overflow-hidden pt-4" style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <h5 class="mb-2 px-4 font-weight-bold" style="font-size: 1.15rem; min-height: 54px; display: flex; align-items: center; justify-content: center;">
                            ${noticia.titulo}
                        </h5>
                        <p class="mb-3 px-4 text-primary" style="font-size: 0.85rem; font-weight: 500;">
                            ${noticia.categoria}
                        </p>
                    </div>
                    <div class="team-img position-relative mt-auto">
                        <img
                            class="img-fluid"
                            src="${noticia.imageUrl}"
                            alt="${noticia.titulo}"
                            style="width: 100%; height: 200px; object-fit: cover;"
                        />
                        <div class="team-social">
                            <a class="btn btn-outline-light btn-square mx-1" href="${fbLink}" target="_blank">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        // Manipular Owl Carousel de forma segura
        const carousel = $(".team-carousel");
        
        // Destruir carrusel actual si ya está inicializado para evitar duplicados/errores de renderizado
        if (carousel.data("owl.carousel")) {
            carousel.owlCarousel("destroy");
            carousel.removeClass("owl-loaded");
            carousel.find(".owl-stage-outer").children().unwrap();
        }

        // Insertar nuevo contenido dinámico
        carousel.html(html);

        // Re-inicializar Owl Carousel con la misma configuración de diseño
        carousel.owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            margin: 30,
            dots: false,
            loop: querySnapshot.size > 1, // Habilitar loop solo si hay más de 1 noticia
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
                    items: Math.min(2, querySnapshot.size),
                },
                768: {
                    items: Math.min(3, querySnapshot.size),
                },
                992: {
                    items: Math.min(4, querySnapshot.size),
                },
            },
        });

    } catch (error) {
        console.error("Error al cargar noticias de Firebase:", error);
    }
}

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", cargarNoticias);
export { cargarNoticias };
