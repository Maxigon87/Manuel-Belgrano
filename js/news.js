// js/news.js
// Lógica para cargar y renderizar noticias en la página principal (Grid Minimalista)

import { db } from "./firebase.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Función para cargar noticias de Firestore en un Grid minimalista
async function cargarNoticias() {
    const newsGrid = document.querySelector(".news-grid");
    if (!newsGrid) return; // Si no hay contenedor de noticias, salir

    try {
        // Consultar las últimas 10 noticias ordenadas por fecha descendente
        const q = query(collection(db, "noticias"), orderBy("fecha", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        let html = "";
        
        if (querySnapshot.empty) {
            newsGrid.innerHTML = `
                <div class="w-100 text-center py-5">
                    <h5 class="text-muted font-italic">No hay noticias recientes en este momento.</h5>
                </div>
            `;
            return;
        }

        querySnapshot.forEach((doc) => {
            const noticia = doc.data();
            const fechaFormateada = noticia.fecha ? new Date(noticia.fecha.seconds * 1000).toLocaleDateString() : "";
            const fbLink = noticia.facebookLink || "#";

            html += `
                <article class="news-card">
                    <div class="news-img-wrapper">
                        <img
                            class="news-img"
                            src="${noticia.imageUrl}"
                            alt="${noticia.titulo}"
                            loading="lazy"
                        />
                    </div>
                    <div class="news-body">
                        <span class="news-category">${noticia.categoria || "Institucional"}</span>
                        <h3 class="news-title">${noticia.titulo}</h3>
                        <div class="news-meta">
                            <span class="news-date">${fechaFormateada}</span>
                            <a class="news-link" href="${fbLink}" target="_blank">
                                <i class="fab fa-facebook-f"></i> Leer más
                            </a>
                        </div>
                    </div>
                </article>
            `;
        });

        newsGrid.innerHTML = html;

    } catch (error) {
        console.error("Error al cargar noticias de Firebase:", error);
    }
}

// Ejecutar al cargar el DOM de forma segura
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarNoticias);
} else {
    cargarNoticias();
}
export { cargarNoticias };
