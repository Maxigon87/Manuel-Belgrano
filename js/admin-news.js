// js/admin-news.js
// Lógica para la administración de noticias y eventos desde carga.html / docentes.html

import { db, storage, auth } from "./firebase.js";
import { cargarNoticias, cargarEventos } from "./news.js";
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    collection, 
    query, 
    orderBy, 
    getDocs, 
    getDoc,
    addDoc, 
    deleteDoc, 
    doc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    ref, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

let isAuthorized = false;

// Elementos del DOM - Noticias
let adminAuthModal;
let adminPasswordInput;
let btnSubmitAdminPass;
let adminAuthError;
let newsCreateForm;
let newsTitle;
let newsCategory;
let newsImage;
let imagePreviewContainer;
let imagePreview;
let btnRemovePreview;
let adminNewsProgress;
let adminNewsProgressBar;
let adminNewsStatus;
let adminNewsList;

// Elementos del DOM - Eventos
let eventCreateForm;
let eventTitle;
let eventDay;
let eventMonth;
let eventDetail;
let eventStatusSelect;
let adminEventsStatus;
let adminEventsList;

function inicializarAdminNews() {
    console.log("admin-news.js: Inicializando módulo administrativo...");

    // Referencias autenticación
    adminAuthModal = document.getElementById("adminAuthModal");
    adminPasswordInput = document.getElementById("adminPasswordInput");
    btnSubmitAdminPass = document.getElementById("btnSubmitAdminPass");
    adminAuthError = document.getElementById("adminAuthError");

    const adminAuthForm = document.getElementById("adminAuthForm");
    if (adminAuthForm) {
        adminAuthForm.addEventListener("submit", (e) => {
            e.preventDefault();
            procesarValidacionAdmin();
        });
    }

    if (btnSubmitAdminPass) {
        btnSubmitAdminPass.addEventListener("click", (e) => {
            e.preventDefault();
            procesarValidacionAdmin();
        });
    }

    // Referencias Noticias
    newsCreateForm = document.getElementById("newsCreateForm");
    newsTitle = document.getElementById("newsTitle");
    newsCategory = document.getElementById("newsCategory");
    newsImage = document.getElementById("newsImage");
    imagePreviewContainer = document.getElementById("imagePreviewContainer");
    imagePreview = document.getElementById("imagePreview");
    btnRemovePreview = document.getElementById("btnRemovePreview");
    adminNewsProgress = document.getElementById("adminNewsProgress");
    adminNewsProgressBar = document.getElementById("adminNewsProgressBar");
    adminNewsStatus = document.getElementById("adminNewsStatus");
    adminNewsList = document.getElementById("adminNewsList");

    if (newsCreateForm) {
        newsCreateForm.addEventListener("submit", procesarSubidaNoticia);
    }

    if (newsImage) {
        newsImage.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (imagePreview) imagePreview.src = e.target.result;
                    if (imagePreviewContainer) imagePreviewContainer.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnRemovePreview) {
        btnRemovePreview.addEventListener("click", () => {
            if (newsImage) newsImage.value = "";
            if (imagePreview) imagePreview.src = "";
            if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
        });
    }

    // Referencias Eventos
    eventCreateForm = document.getElementById("eventCreateForm");
    eventTitle = document.getElementById("eventTitle");
    eventDay = document.getElementById("eventDay");
    eventMonth = document.getElementById("eventMonth");
    eventDetail = document.getElementById("eventDetail");
    eventStatusSelect = document.getElementById("eventStatusSelect");
    adminEventsStatus = document.getElementById("adminEventsStatus");
    adminEventsList = document.getElementById("adminEventsList");

    if (eventCreateForm) {
        eventCreateForm.addEventListener("submit", procesarSubidaEvento);
    }

    // Configurar navegación entre vistas del panel admin (Íconos gigantes & pestañas)
    const btnSelectNewsHub = document.getElementById("btnSelectNewsHub");
    const btnSelectEventsHub = document.getElementById("btnSelectEventsHub");
    const btnBackFromNews = document.getElementById("btnBackFromNews");
    const btnBackFromEvents = document.getElementById("btnBackFromEvents");
    const tabNewsFromNews = document.getElementById("tabNewsFromNews");
    const tabEventsFromNews = document.getElementById("tabEventsFromNews");
    const tabNewsFromEvents = document.getElementById("tabNewsFromEvents");
    const tabEventsFromEvents = document.getElementById("tabEventsFromEvents");

    if (btnSelectNewsHub) btnSelectNewsHub.addEventListener("click", () => mostrarVistaAdmin("news"));
    if (btnSelectEventsHub) btnSelectEventsHub.addEventListener("click", () => mostrarVistaAdmin("events"));
    
    if (btnBackFromNews) btnBackFromNews.addEventListener("click", () => mostrarVistaAdmin("hub"));
    if (btnBackFromEvents) btnBackFromEvents.addEventListener("click", () => mostrarVistaAdmin("hub"));

    if (tabNewsFromNews) tabNewsFromNews.addEventListener("click", () => mostrarVistaAdmin("news"));
    if (tabEventsFromNews) tabEventsFromNews.addEventListener("click", () => mostrarVistaAdmin("events"));
    if (tabNewsFromEvents) tabNewsFromEvents.addEventListener("click", () => mostrarVistaAdmin("news"));
    if (tabEventsFromEvents) tabEventsFromEvents.addEventListener("click", () => mostrarVistaAdmin("events"));

    // Cargar listas iniciales en el panel
    cargarNoticiasAdmin();
    cargarEventosAdmin();
}

function mostrarVistaAdmin(vista) {
    const hub = document.getElementById("adminSelectionHub");
    const newsView = document.getElementById("adminNewsView");
    const eventsView = document.getElementById("adminEventsView");

    if (!hub || !newsView || !eventsView) return;

    if (vista === "news") {
        hub.style.display = "none";
        newsView.style.display = "block";
        eventsView.style.display = "none";
        window.scrollTo({ top: hub.offsetTop - 50, behavior: 'smooth' });
    } else if (vista === "events") {
        hub.style.display = "none";
        newsView.style.display = "none";
        eventsView.style.display = "block";
        window.scrollTo({ top: hub.offsetTop - 50, behavior: 'smooth' });
    } else {
        hub.style.display = "flex";
        newsView.style.display = "none";
        eventsView.style.display = "none";
        window.scrollTo({ top: hub.offsetTop - 50, behavior: 'smooth' });
    }
}
window.mostrarVistaAdmin = mostrarVistaAdmin;

// Validar clave en Firestore (colección 'accesos')
async function procesarValidacionAdmin() {
    if (!adminPasswordInput) adminPasswordInput = document.getElementById("adminPasswordInput");
    if (!adminAuthError) adminAuthError = document.getElementById("adminAuthError");
    if (!btnSubmitAdminPass) btnSubmitAdminPass = document.getElementById("btnSubmitAdminPass");

    if (!adminPasswordInput) {
        console.error("adminPasswordInput no encontrado en el DOM");
        return;
    }
    const password = adminPasswordInput.value.trim();
    
    if (password === "") {
        if (adminAuthError) adminAuthError.textContent = "Ingrese la contraseña.";
        return;
    }

    if (btnSubmitAdminPass) btnSubmitAdminPass.disabled = true;
    if (adminAuthError) {
        adminAuthError.textContent = "Verificando...";
        adminAuthError.style.color = "#FFD700";
    }

    try {
        const isAuth = await validarContraseñaAdmin(password);
        if (isAuth) {
            isAuthorized = true;
            if (adminAuthModal) adminAuthModal.style.display = "none";
            const panel = document.getElementById("adminDashboardPanel");
            if (panel) panel.style.display = "block";
            const authCard = document.getElementById("adminAuthCard");
            if (authCard) authCard.style.display = "none";

            mostrarVistaAdmin("hub");
            cargarNoticiasAdmin();
            cargarEventosAdmin();
        } else {
            if (adminAuthError) {
                adminAuthError.textContent = "Contraseña incorrecta.";
                adminAuthError.style.color = "red";
            }
        }
    } catch (err) {
        console.error("Error al validar admin:", err);
        if (adminAuthError) {
            adminAuthError.textContent = "Error al conectar con la base de datos.";
            adminAuthError.style.color = "red";
        }
    } finally {
        if (btnSubmitAdminPass) btnSubmitAdminPass.disabled = false;
    }
}
window.procesarValidacionAdmin = procesarValidacionAdmin;

async function validarContraseñaAdmin(password) {
    // 1. Intentar vía Firebase SDK (con inicio anónimo previo si es necesario)
    try {
        try {
            await autenticarAnonimamente();
        } catch (authErr) {
            console.warn("Autenticación anónima previa falló o no fue requerida:", authErr);
        }

        const docRef = doc(db, "accesos", password);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.rol === "admin") return true;
        }
    } catch (sdkErr) {
        console.warn("Consulta vía Firestore SDK falló, intentando con API REST:", sdkErr);
    }

    // 2. Respaldo directo vía API REST de Firestore
    try {
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/manuel-belgrano-web-1d164/databases/(default)/documents/accesos/${encodeURIComponent(password)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.fields && data.fields.rol) {
                const rolVal = data.fields.rol.stringValue;
                return rolVal === "admin";
            }
        }
    } catch (restErr) {
        console.error("Error también en API REST:", restErr);
    }

    return false;
}

async function autenticarAnonimamente() {
    if (auth.currentUser) return auth.currentUser;
    try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
    } catch (error) {
        console.error("Error en Autenticación Anónima:", error);
        throw new Error("No se pudo iniciar sesión de forma segura en Firebase.");
    }
}

// Subir imagen a Firebase Storage
function subirImagen(file) {
    return new Promise((resolve, reject) => {
        const uniqueName = `${Date.now()}_${file.name}`;
        const imagePath = `noticias/${uniqueName}`;
        const storageRef = ref(storage, imagePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        if (adminNewsProgress) adminNewsProgress.style.display = "block";

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (adminNewsProgressBar) {
                    adminNewsProgressBar.style.width = `${progress}%`;
                    adminNewsProgressBar.textContent = `${progress}%`;
                }
            },
            (error) => {
                console.error("Error al subir imagen:", error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({ downloadURL, imagePath });
                } catch (err) {
                    reject(err);
                }
            }
        );
    });
}

function fileToBase64Resized(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const max_size = 600;
                let width = image.width;
                let height = image.height;
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0, width, height);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
                resolve(dataUrl);
            };
            image.onerror = (err) => reject(err);
            image.src = readerEvent.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

// 1. Crear Noticia con límite estricto de 5 (borrando la más vieja si hay 5)
async function crearNoticia(titulo, categoria, descripcion, imageUrl, imagePath) {
    const noticiasCol = collection(db, "noticias");

    // Limpiar si ya hay 5 noticias
    await mantenerLimiteNoticias(5);

    // Agregar la nueva
    await addDoc(noticiasCol, {
        titulo,
        categoria,
        descripcion: descripcion || "",
        imageUrl,
        imagePath: imagePath || "",
        fecha: serverTimestamp()
    });
}

async function mantenerLimiteNoticias(maxPermitido = 5) {
    const noticiasCol = collection(db, "noticias");
    const q = query(noticiasCol, orderBy("fecha", "asc")); // Las más viejas primero
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size >= maxPermitido) {
        const aBorrarCount = querySnapshot.size - (maxPermitido - 1); // Dejar espacio para 1 nueva
        for (let i = 0; i < aBorrarCount; i++) {
            const docSnap = querySnapshot.docs[i];
            const data = docSnap.data();
            if (data.imagePath) {
                try {
                    await deleteObject(ref(storage, data.imagePath));
                } catch (e) {
                    console.warn("Storage delete skip/error:", e);
                }
            }
            await deleteDoc(docSnap.ref);
            console.log("Noticia antigua eliminada automáticamente (límite 5):", docSnap.id);
        }
    }
}

async function procesarSubidaNoticia(e) {
    e.preventDefault();
    if (!isAuthorized) {
        alert("Debe validar su contraseña de administrador primero.");
        return;
    }

    const file = newsImage ? newsImage.files[0] : null;
    const titulo = newsTitle ? newsTitle.value.trim() : "";
    const categoria = newsCategory ? newsCategory.value : "";
    const newsDescElem = document.getElementById("newsDescription");
    const descripcion = newsDescElem ? newsDescElem.value.trim() : "";

    if (!file || !titulo || !categoria) {
        mostrarStatusNews("Por favor complete todos los campos requeridos.", "danger");
        return;
    }

    const btnSubmit = document.getElementById("btnSubmitNews");
    if (btnSubmit) btnSubmit.disabled = true;

    try {
        mostrarStatusNews("Autenticando servicio...", "info");
        await autenticarAnonimamente();

        let downloadURL;
        let imagePath = "";

        try {
            mostrarStatusNews("Subiendo imagen a Firebase Storage...", "info");
            const uploadResult = await subirImagen(file);
            downloadURL = uploadResult.downloadURL;
            imagePath = uploadResult.imagePath;
        } catch (storageErr) {
            console.warn("Firebase Storage no disponible, usando Base64:", storageErr);
            mostrarStatusNews("Procesando imagen localmente...", "info");
            downloadURL = await fileToBase64Resized(file);
        }

        mostrarStatusNews("Publicando en el carrusel de novedades...", "info");
        await crearNoticia(titulo, categoria, descripcion, downloadURL, imagePath);

        mostrarStatusNews("¡Noticia publicada con éxito en el carrusel!", "success");
        
        // Reset form
        if (newsCreateForm) newsCreateForm.reset();
        if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
        if (adminNewsProgress) adminNewsProgress.style.display = "none";

        await cargarNoticiasAdmin();
        if (typeof cargarNoticias === "function") await cargarNoticias();

    } catch (error) {
        console.error("Error al publicar noticia:", error);
        mostrarStatusNews(`Error: ${error.message || "No se pudo guardar la noticia."}`, "danger");
    } finally {
        if (btnSubmit) btnSubmit.disabled = false;
    }
}

function mostrarStatusNews(msg, type) {
    if (!adminNewsStatus) return;
    adminNewsStatus.textContent = msg;
    adminNewsStatus.className = `alert alert-${type} text-center font-weight-bold mb-3`;
    adminNewsStatus.style.display = "block";
}

async function cargarNoticiasAdmin() {
    if (!adminNewsList) return;
    adminNewsList.innerHTML = `<p class="text-muted text-center font-italic my-3">Cargando publicaciones...</p>`;

    try {
        const q = query(collection(db, "noticias"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            adminNewsList.innerHTML = `<p class="text-muted text-center font-italic my-3">No hay noticias publicadas en el carrusel (Máx. 5).</p>`;
            return;
        }

        let html = "";
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            html += `
                <div class="list-group-item d-flex align-items-center justify-content-between p-3 mb-2 border rounded shadow-sm">
                    <div class="d-flex align-items-center" style="max-width: 80%;">
                        <img src="${data.imageUrl}" alt="${data.titulo}" class="rounded mr-3" style="width: 50px; height: 50px; object-fit: cover;" />
                        <div>
                            <h6 class="mb-0 font-weight-bold text-dark text-truncate" style="max-width: 320px;">${data.titulo}</h6>
                            <small class="text-primary font-weight-bold">${data.categoria || 'Novedad'}</small>
                        </div>
                    </div>
                    <button class="btn btn-outline-danger btn-sm rounded-circle btn-delete-news" data-id="${id}" data-imagepath="${data.imagePath || ''}" style="width: 34px; height: 34px; padding: 0;" title="Eliminar noticia">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        });

        adminNewsList.innerHTML = html;

        adminNewsList.querySelectorAll(".btn-delete-news").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const button = e.currentTarget;
                const docId = button.getAttribute("data-id");
                const imagePath = button.getAttribute("data-imagepath");

                if (confirm("¿Desea eliminar esta noticia del carrusel?")) {
                    button.disabled = true;
                    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
                    try {
                        await autenticarAnonimamente();
                        if (imagePath) {
                            try {
                                await deleteObject(ref(storage, imagePath));
                            } catch (e) {}
                        }
                        await deleteDoc(doc(db, "noticias", docId));
                        await cargarNoticiasAdmin();
                        if (typeof cargarNoticias === "function") await cargarNoticias();
                    } catch (err) {
                        console.error("Error al borrar noticia:", err);
                        alert("Error al borrar la noticia.");
                    }
                }
            });
        });

    } catch (err) {
        console.error("Error al cargar noticias en admin:", err);
        adminNewsList.innerHTML = `<p class="text-danger text-center my-3">Error al conectar con la base de datos.</p>`;
    }
}

// 2. Crear y Gestionar Próximos Eventos
async function procesarSubidaEvento(e) {
    e.preventDefault();
    if (!isAuthorized) {
        alert("Debe validar su contraseña de administrador primero.");
        return;
    }

    const titulo = eventTitle ? eventTitle.value.trim() : "";
    const dia = eventDay ? eventDay.value.trim() : "";
    const mes = eventMonth ? eventMonth.value.trim() : "";
    const detalle = eventDetail ? eventDetail.value.trim() : "";
    const eventCategoryElem = document.getElementById("eventCategory");
    const categoria = eventCategoryElem ? eventCategoryElem.value : "Todos los niveles";
    const estado = eventStatusSelect ? eventStatusSelect.value : "Próximo";

    if (!titulo || !dia || !mes) {
        mostrarStatusEvent("Por favor complete los campos obligatorios del evento.", "danger");
        return;
    }

    const btnSubmit = document.getElementById("btnSubmitEvent");
    if (btnSubmit) btnSubmit.disabled = true;

    try {
        mostrarStatusEvent("Guardando evento...", "info");
        await autenticarAnonimamente();

        await addDoc(collection(db, "eventos"), {
            titulo,
            dia,
            mes,
            detalle,
            categoria,
            estado,
            fecha: serverTimestamp()
        });

        mostrarStatusEvent("¡Evento agregado correctamente a la agenda!", "success");
        if (eventCreateForm) eventCreateForm.reset();

        await cargarEventosAdmin();
        if (typeof cargarEventos === "function") await cargarEventos();

    } catch (error) {
        console.error("Error al publicar evento:", error);
        mostrarStatusEvent(`Error: ${error.message || "No se pudo guardar el evento."}`, "danger");
    } finally {
        if (btnSubmit) btnSubmit.disabled = false;
    }
}

function mostrarStatusEvent(msg, type) {
    if (!adminEventsStatus) return;
    adminEventsStatus.textContent = msg;
    adminEventsStatus.className = `alert alert-${type} text-center font-weight-bold mb-3`;
    adminEventsStatus.style.display = "block";
}

async function cargarEventosAdmin() {
    if (!adminEventsList) return;
    adminEventsList.innerHTML = `<p class="text-muted text-center font-italic my-3">Cargando eventos...</p>`;

    try {
        try {
            await autenticarAnonimamente();
        } catch (e) {}

        const q = query(collection(db, "eventos"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            adminEventsList.innerHTML = `<p class="text-muted text-center font-italic my-3">No hay eventos en la agenda.</p>`;
            return;
        }

        let html = "";
        querySnapshot.forEach((docSnap) => {
            const ev = docSnap.data();
            const id = docSnap.id;
            html += `
                <div class="list-group-item d-flex align-items-center justify-content-between p-3 mb-2 border rounded shadow-sm">
                    <div class="d-flex align-items-center" style="max-width: 80%;">
                        <div class="badge badge-primary p-2 mr-3 text-uppercase font-weight-bold" style="min-width: 55px; text-align: center;">
                            <div style="font-size: 1.1rem; line-height: 1;">${ev.dia}</div>
                            <div style="font-size: 0.75rem;">${ev.mes}</div>
                        </div>
                        <div>
                            <h6 class="mb-0 font-weight-bold text-dark">${ev.titulo}</h6>
                            <small class="text-muted">${ev.detalle || ''} - <strong class="${ev.estado === 'Realizado' ? 'text-secondary' : 'text-success'}">${ev.estado || 'Próximo'}</strong></small>
                        </div>
                    </div>
                    <button class="btn btn-outline-danger btn-sm rounded-circle btn-delete-event" data-id="${id}" style="width: 34px; height: 34px; padding: 0;" title="Eliminar evento">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        });

        adminEventsList.innerHTML = html;

        adminEventsList.querySelectorAll(".btn-delete-event").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const button = e.currentTarget;
                const docId = button.getAttribute("data-id");

                if (confirm("¿Desea eliminar este evento de la agenda?")) {
                    button.disabled = true;
                    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
                    try {
                        await autenticarAnonimamente();
                        await deleteDoc(doc(db, "eventos", docId));
                        await cargarEventosAdmin();
                        if (typeof cargarEventos === "function") await cargarEventos();
                    } catch (err) {
                        console.error("Error al borrar evento:", err);
                        alert("Error al eliminar el evento.");
                    }
                }
            });
        });

    } catch (err) {
        console.error("Error al cargar eventos en admin:", err);
        adminEventsList.innerHTML = `<p class="text-danger text-center my-3">Error al conectar con la base de datos.</p>`;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarAdminNews);
} else {
    inicializarAdminNews();
}

export { inicializarAdminNews };
