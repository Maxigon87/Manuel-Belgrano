// js/news.js
// Lógica para cargar y renderizar noticias y eventos en la página principal

import { db } from "./firebase.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Cargar Noticias (Carrusel max 5 noticias)
async function cargarNoticias() {
    const carouselContainer = document.querySelector(".news-carousel, .team-carousel");
    if (!carouselContainer) return;

    try {
        // Consultar máximo 5 noticias ordenadas por fecha descendente
        const q = query(collection(db, "noticias"), orderBy("fecha", "desc"), limit(5));
        const querySnapshot = await getDocs(q);

        const carousel = $(carouselContainer);
        
        if (querySnapshot.empty) {
            return; // Si no hay noticias en la BD, mantener layout por defecto
        }

        let html = "";
        querySnapshot.forEach((docSnap) => {
            const noticia = docSnap.data();
            const fechaFormateada = noticia.fecha ? new Date(noticia.fecha.seconds * 1000).toLocaleDateString() : "";

            html += `
                <article class="news-card h-100 mb-0">
                  <div class="news-img-wrapper">
                    <img src="${noticia.imageUrl}" alt="${noticia.titulo}" class="news-img">
                    <span class="news-category">${noticia.categoria || "Novedad"}</span>
                  </div>
                  <div class="news-content">
                    <div class="news-meta">
                      <i class="far fa-calendar-alt mr-1"></i> ${fechaFormateada || "Reciente"}
                    </div>
                    <h3 class="news-title">${noticia.titulo}</h3>
                    ${noticia.descripcion ? `<p class="news-excerpt mt-2 mb-0">${noticia.descripcion}</p>` : ''}
                  </div>
                </article>
            `;
        });

        // Destruir carrusel previo si existe para re-renderizar
        if (carousel.data("owl.carousel")) {
            carousel.owlCarousel("destroy");
            carousel.removeClass("owl-loaded");
            carousel.find(".owl-stage-outer").children().unwrap();
        }

        // Insertar contenido dinámico
        carousel.html(html);

        // Re-inicializar Owl Carousel
        carousel.owlCarousel({
            autoplay: true,
            smartSpeed: 1200,
            margin: 20,
            dots: true,
            loop: querySnapshot.size > 1,
            nav: true,
            navText: [
                '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                '<i class="fa fa-angle-right" aria-hidden="true"></i>',
            ],
            responsive: {
                0: { items: 1 },
                768: { items: Math.min(2, querySnapshot.size) },
            },
        });

    } catch (error) {
        console.error("Error al cargar noticias de Firebase:", error);
    }
}

// 2. Cargar Próximos Eventos (Lista de arriba hacia abajo, más reciente arriba)
async function cargarEventos() {
    const eventsContainer = document.getElementById("eventsList");
    if (!eventsContainer) return;

    try {
        const q = query(collection(db, "eventos"), orderBy("fecha", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            let html = "";
            querySnapshot.forEach((docSnap) => {
                const ev = docSnap.data();
                const esPasado = ev.estado === "Realizado";

                const infoAdicional = [ev.detalle, ev.categoria].filter(Boolean).join(" | ");

                html += `
                    <div class="agenda-item ${esPasado ? 'past-event' : ''}">
                      <div class="agenda-date">
                        <span class="day">${ev.dia || '01'}</span>
                        <span class="month">${(ev.mes || 'ENE').toUpperCase()}</span>
                      </div>
                      <div class="agenda-info">
                        <h4 class="event-title" title="${ev.titulo}">
                          ${ev.titulo} 
                          ${esPasado ? '<span class="badge-past">Realizado</span>' : ''}
                        </h4>
                        <p class="event-detail">
                          <i class="${esPasado ? 'fa fa-check-circle text-secondary' : 'far fa-clock text-primary'} mr-1"></i> 
                          ${infoAdicional || 'Todos los niveles'}
                        </p>
                      </div>
                    </div>
                `;
            });

            eventsContainer.innerHTML = html;
            return;
        }
    } catch (error) {
        console.warn("Firestore SDK eventos falló en portada, intentando REST API:", error);
    }

    // Fallback REST API para la portada
    try {
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/manuel-belgrano-web-1d164/databases/(default)/documents/eventos`);
        if (res.ok) {
            const data = await res.json();
            if (data.documents && data.documents.length > 0) {
                let html = "";
                data.documents.forEach(d => {
                    const fields = d.fields || {};
                    const titulo = fields.titulo ? fields.titulo.stringValue : '';
                    const dia = fields.dia ? fields.dia.stringValue : '01';
                    const mes = fields.mes ? fields.mes.stringValue : 'ENE';
                    const detalle = fields.detalle ? fields.detalle.stringValue : '';
                    const categoria = fields.categoria ? fields.categoria.stringValue : '';
                    const estado = fields.estado ? fields.estado.stringValue : 'Próximo';
                    const esPasado = estado === "Realizado";

                    const infoAdicional = [detalle, categoria].filter(Boolean).join(" | ");

                    html += `
                        <div class="agenda-item ${esPasado ? 'past-event' : ''}">
                          <div class="agenda-date">
                            <span class="day">${dia}</span>
                            <span class="month">${mes.toUpperCase()}</span>
                          </div>
                          <div class="agenda-info">
                            <h4 class="event-title" title="${titulo}">
                              ${titulo} 
                              ${esPasado ? '<span class="badge-past">Realizado</span>' : ''}
                            </h4>
                            <p class="event-detail">
                              <i class="${esPasado ? 'fa fa-check-circle text-secondary' : 'far fa-clock text-primary'} mr-1"></i> 
                              ${infoAdicional || 'Todos los niveles'}
                            </p>
                          </div>
                        </div>
                    `;
                });
                eventsContainer.innerHTML = html;
            }
        }
    } catch (restErr) {
        console.error("Error al cargar eventos en portada vía REST:", restErr);
    }
}

// Inicialización general
function initNewsAndEvents() {
    cargarNoticias();
    cargarEventos();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNewsAndEvents);
} else {
    initNewsAndEvents();
}

export { cargarNoticias, cargarEventos };
