// js/news.js
// Lógica para cargar y renderizar noticias y eventos en la página principal

import { db } from "./firebase.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Modal flotante de noticias
function abrirModalNoticia(titulo, categoria, fecha, imagenUrl, descripcion) {
    const modal = document.getElementById("newsDetailModal");
    const imgEl = document.getElementById("modalNewsImg");
    const catEl = document.getElementById("modalNewsCategory");
    const dateEl = document.getElementById("modalNewsDateText");
    const titleEl = document.getElementById("modalNewsTitle");
    const descEl = document.getElementById("modalNewsDesc");

    if (!modal) return;

    if (imgEl) imgEl.src = imagenUrl || "";
    if (catEl) catEl.textContent = categoria || "Novedad";
    if (dateEl) dateEl.textContent = fecha || "Reciente";
    if (titleEl) titleEl.textContent = titulo || "";
    if (descEl) descEl.textContent = descripcion || "Sin descripción disponible.";

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function cerrarNewsModal() {
    const modal = document.getElementById("newsDetailModal");
    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
}
window.cerrarNewsModal = cerrarNewsModal;

function inicializarEventosModalNoticias() {
    const modal = document.getElementById("newsDetailModal");
    const btnClose = document.getElementById("btnCloseNewsModal");

    if (btnClose) {
        btnClose.addEventListener("click", cerrarNewsModal);
    }
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) cerrarNewsModal();
        });
    }

    // Vincular tarjetas estáticas iniciales si existen
    document.querySelectorAll(".news-card").forEach(card => {
        card.addEventListener("click", () => {
            const titulo = card.querySelector(".news-title") ? card.querySelector(".news-title").textContent : "";
            const categoria = card.querySelector(".news-category") ? card.querySelector(".news-category").textContent : "";
            const fecha = card.querySelector(".news-meta") ? card.querySelector(".news-meta").textContent.trim() : "";
            const imgUrl = card.querySelector(".news-img") ? card.querySelector(".news-img").src : "";
            const desc = card.querySelector(".news-excerpt") ? card.querySelector(".news-excerpt").textContent.trim() : "";
            abrirModalNoticia(titulo, categoria, fecha, imgUrl, desc);
        });
    });
}

// 1. Cargar Noticias (Carrusel max 5 noticias)
async function cargarNoticias() {
    const carouselContainer = document.querySelector(".news-carousel, .team-carousel");
    if (!carouselContainer) return;

    try {
        const q = query(collection(db, "noticias"), orderBy("fecha", "desc"), limit(5));
        const querySnapshot = await getDocs(q);

        const carousel = $(carouselContainer);
        
        if (querySnapshot.empty) {
            return;
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

        // Re-inicializar Owl Carousel (Lento para mejor lectura, sin flechas nav)
        carousel.owlCarousel({
            autoplay: true,
            autoplayTimeout: 9000, // 9 segundos por noticia para mejor lectura
            autoplayHoverPause: true, // Pausar si pasa el cursor sobre la noticia
            smartSpeed: 1000,
            margin: 20,
            dots: true,
            loop: querySnapshot.size > 1,
            nav: false, // SIN FLECHAS según solicitud del usuario (se mueve arrastrando con clic)
            responsive: {
                0: { items: 1 },
                768: { items: Math.min(2, querySnapshot.size) },
            },
        });

        // Vincular click a cada tarjeta de noticia dinámica para abrir modal
        carousel.find(".news-card").each(function () {
            const card = $(this);
            card.on("click", function () {
                const titulo = card.find(".news-title").text();
                const categoria = card.find(".news-category").text();
                const fecha = card.find(".news-meta").text().trim();
                const imgUrl = card.find(".news-img").attr("src");
                const desc = card.find(".news-excerpt").text().trim();
                abrirModalNoticia(titulo, categoria, fecha, imgUrl, desc);
            });
        });

    } catch (error) {
        console.error("Error al cargar noticias de Firebase:", error);
    }
}

// Lógica para evaluar si un evento es de HOY (borde dorado animado) o PASADO (gris)
function evaluarEstadoEvento(diaStr, mesStr, detalleStr, estadoStr, fechaTimestamp) {
    const ahora = new Date();
    const hoyDia = ahora.getDate();
    const hoyMes = ahora.getMonth();
    const hoyAño = ahora.getFullYear();

    const mesesMap = {
        "ENE": 0, "FEB": 1, "MAR": 2, "ABR": 3, "MAY": 4, "JUN": 5,
        "JUL": 6, "AGO": 7, "SEP": 8, "OCT": 9, "NOV": 10, "DIC": 11,
        "ENERO": 0, "FEBRERO": 1, "MARZO": 2, "ABRIL": 3, "MAYO": 4, "JUNIO": 5,
        "JULIO": 6, "AGOSTO": 7, "SEPTIEMBRE": 8, "OCTUBRE": 9, "NOVIEMBRE": 10, "DICIEMBRE": 11
    };

    let esPasado = estadoStr === "Realizado";
    let esHoy = false;

    let diaNum = parseInt(diaStr, 10);
    let mesClean = (mesStr || "").toString().trim().toUpperCase();
    let mesNum = mesesMap[mesClean];
    if (mesNum === undefined) {
        let parsed = parseInt(mesClean, 10);
        if (!isNaN(parsed)) mesNum = parsed - 1;
    }

    if (fechaTimestamp && fechaTimestamp.seconds) {
        const f = new Date(fechaTimestamp.seconds * 1000);
        if (f.getFullYear() === hoyAño && f.getMonth() === hoyMes && f.getDate() === hoyDia) {
            esHoy = true;
        } else if (f < ahora) {
            esPasado = true;
        }
    }

    if (!esHoy && !isNaN(diaNum) && mesNum !== undefined) {
        if (diaNum === hoyDia && mesNum === hoyMes) {
            esHoy = true;
        }
    }

    if (!esHoy && !esPasado && !isNaN(diaNum) && mesNum !== undefined) {
        let evDate = new Date(hoyAño, mesNum, diaNum, 23, 59, 59);

        if (detalleStr) {
            const timeMatch = detalleStr.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
                evDate.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0);
            }
        }

        if (ahora > evDate) {
            esPasado = true;
            esHoy = false;
        }
    }

    return { esHoy, esPasado };
}

// 2. Cargar Próximos Eventos (Lista de arriba hacia abajo)
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
                const { esHoy, esPasado } = evaluarEstadoEvento(ev.dia, ev.mes, ev.detalle, ev.estado, ev.fecha);

                const infoAdicional = [ev.detalle, ev.categoria].filter(Boolean).join(" | ");

                let itemClass = "agenda-item";
                let statusBadge = "";
                if (esHoy) {
                    itemClass += " today-event";
                    statusBadge = `<span class="badge-today"><i class="fas fa-star mr-1"></i>¡HOY!</span>`;
                } else if (esPasado) {
                    itemClass += " past-event";
                    statusBadge = `<span class="badge-past">Realizado</span>`;
                }

                html += `
                    <div class="${itemClass}">
                      <div class="agenda-date">
                        <span class="day">${ev.dia || '01'}</span>
                        <span class="month">${(ev.mes || 'ENE').toUpperCase()}</span>
                      </div>
                      <div class="agenda-info">
                        <h4 class="event-title" title="${ev.titulo}">
                          ${ev.titulo} ${statusBadge}
                        </h4>
                        <p class="event-detail">
                          <i class="${esPasado ? 'fa fa-check-circle text-secondary' : esHoy ? 'fa fa-star text-warning' : 'far fa-clock text-primary'} mr-1"></i> 
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
                    
                    const { esHoy, esPasado } = evaluarEstadoEvento(dia, mes, detalle, estado, null);

                    const infoAdicional = [detalle, categoria].filter(Boolean).join(" | ");

                    let itemClass = "agenda-item";
                    let statusBadge = "";
                    if (esHoy) {
                        itemClass += " today-event";
                        statusBadge = `<span class="badge-today"><i class="fas fa-star mr-1"></i>¡HOY!</span>`;
                    } else if (esPasado) {
                        itemClass += " past-event";
                        statusBadge = `<span class="badge-past">Realizado</span>`;
                    }

                    html += `
                        <div class="${itemClass}">
                          <div class="agenda-date">
                            <span class="day">${dia}</span>
                            <span class="month">${mes.toUpperCase()}</span>
                          </div>
                          <div class="agenda-info">
                            <h4 class="event-title" title="${titulo}">
                              ${titulo} ${statusBadge}
                            </h4>
                            <p class="event-detail">
                              <i class="${esPasado ? 'fa fa-check-circle text-secondary' : esHoy ? 'fa fa-star text-warning' : 'far fa-clock text-primary'} mr-1"></i> 
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
    inicializarEventosModalNoticias();
    cargarNoticias();
    cargarEventos();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNewsAndEvents);
} else {
    initNewsAndEvents();
}

export { cargarNoticias, cargarEventos };

