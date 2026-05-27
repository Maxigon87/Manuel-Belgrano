// js/admin-news.js
// Lógica para la administración de noticias desde docentes.html

import { db, storage, auth } from "./firebase.js";
import { cargarNoticias } from "./news.js";
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

// Las contraseñas ya no se guardan en el código, se verifican en la nube usando la colección 'accesos' en Firestore

// Variables locales
let isAuthorized = false;

// Elementos del DOM
let btnSubirNoticia;
let adminAuthModal;
let adminPasswordInput;
let btnSubmitAdminPass;
let btnCancelAdminPass;
let adminAuthError;
let newsCreateModal;
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
let btnCancelNews;
let adminNewsList;

// Inicializar elementos y listeners al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    // Si no estamos en docentes.html con el botón de subir noticias, salir
    btnSubirNoticia = document.getElementById("btnSubirNoticia");
    if (!btnSubirNoticia) return;

    // Obtener referencias de elementos
    adminAuthModal = document.getElementById("adminAuthModal");
    adminPasswordInput = document.getElementById("adminPasswordInput");
    btnSubmitAdminPass = document.getElementById("btnSubmitAdminPass");
    btnCancelAdminPass = document.getElementById("btnCancelAdminPass");
    adminAuthError = document.getElementById("adminAuthError");

    newsCreateModal = document.getElementById("newsCreateModal");
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
    btnCancelNews = document.getElementById("btnCancelNews");
    adminNewsList = document.getElementById("adminNewsList");

    // Configurar listeners
    btnSubirNoticia.addEventListener("click", () => abrirModal(adminAuthModal));
    btnCancelAdminPass.addEventListener("click", () => cerrarModal(adminAuthModal));
    btnSubmitAdminPass.addEventListener("click", procesarValidacionAdmin);
    adminPasswordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") procesarValidacionAdmin();
    });

    // Crear noticia listeners
    btnCancelNews.addEventListener("click", () => cerrarModal(newsCreateModal));
    newsCreateForm.addEventListener("submit", procesarSubidaNoticia);

    // Previsualización de imagen
    newsImage.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreviewContainer.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });

    btnRemovePreview.addEventListener("click", () => {
        newsImage.value = "";
        imagePreview.src = "";
        imagePreviewContainer.style.display = "none";
    });
});

// Funciones de utilidad para modales
function abrirModal(modal) {
    modal.style.display = "flex";
    if (modal === adminAuthModal) {
        adminPasswordInput.value = "";
        adminPasswordInput.focus();
        adminAuthError.textContent = "";
    }
}

function cerrarModal(modal) {
    modal.style.display = "none";
    if (modal === newsCreateModal) {
        resetForm();
    }
}

function resetForm() {
    newsCreateForm.reset();
    imagePreview.src = "";
    imagePreviewContainer.style.display = "none";
    adminNewsProgress.style.display = "none";
    adminNewsProgressBar.style.width = "0%";
    adminNewsProgressBar.textContent = "0%";
    adminNewsStatus.style.display = "none";
    adminNewsStatus.textContent = "";
}

// 1. Validar contraseña admin en la nube
async function procesarValidacionAdmin() {
    const password = adminPasswordInput.value.trim();
    
    if (password === "") {
        adminAuthError.textContent = "Ingrese la contraseña.";
        adminAuthError.style.color = "red";
        return;
    }

    btnSubmitAdminPass.disabled = true;
    adminAuthError.textContent = "Verificando...";
    adminAuthError.style.color = "#FFD700";

    try {
        const isAuthorizedDb = await validarContraseñaAdmin(password);
        if (isAuthorizedDb) {
            isAuthorized = true;
            cerrarModal(adminAuthModal);
            abrirModal(newsCreateModal);
            cargarNoticiasAdmin(); // Cargar la lista para que puedan borrar
        } else {
            adminAuthError.textContent = "Contraseña incorrecta. Por favor, reintente.";
            adminAuthError.style.color = "red";
        }
    } catch (err) {
        console.error("Error al validar contraseña admin:", err);
        adminAuthError.textContent = "Error al conectar con la base de datos.";
        adminAuthError.style.color = "red";
    } finally {
        btnSubmitAdminPass.disabled = false;
    }
}

async function validarContraseñaAdmin(password) {
    try {
        const docRef = doc(db, "accesos", password);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() && docSnap.data().rol === "admin";
    } catch (err) {
        console.error("Error al buscar clave en Firestore:", err);
        throw err;
    }
}

// 2. Autenticación Anónima de Firebase
async function autenticarAnonimamente() {
    if (auth.currentUser) return auth.currentUser;
    try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
    } catch (error) {
        console.error("Error en Autenticación Anónima:", error);
        throw new Error("No se pudo iniciar sesión de forma segura.");
    }
}

// 3. Subir imagen a Firebase Storage con progreso
function subirImagen(file) {
    return new Promise((resolve, reject) => {
        const uniqueName = `${Date.now()}_${file.name}`;
        const imagePath = `noticias/${uniqueName}`;
        const storageRef = ref(storage, imagePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        adminNewsProgress.style.display = "block";

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                adminNewsProgressBar.style.width = `${progress}%`;
                adminNewsProgressBar.textContent = `${progress}%`;
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

// Función auxiliar para redimensionar y convertir imagen a Base64 (si no hay Storage configurado)
function fileToBase64Resized(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const max_size = 400; // tamaño máximo estético
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
                
                // Comprimir como JPEG al 70% de calidad
                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                resolve(dataUrl);
            };
            image.onerror = (err) => reject(err);
            image.src = readerEvent.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

// 4. Crear noticia en Firestore
async function crearNoticia(titulo, categoria, imageUrl, imagePath) {
    const noticiasCol = collection(db, "noticias");
    
    // Primero, hacemos espacio si hay más de 10 noticias
    await eliminarNoticiaAntigua();

    // Agregar nuevo documento
    await addDoc(noticiasCol, {
        titulo,
        categoria,
        imageUrl,
        imagePath,
        fecha: serverTimestamp()
    });
}

// 5. Eliminar noticia antigua automáticamente (límite de 10 noticias)
async function eliminarNoticiaAntigua() {
    const noticiasCol = collection(db, "noticias");
    const q = query(noticiasCol, orderBy("fecha", "asc")); // Trae las más viejas primero
    const querySnapshot = await getDocs(q);

    // Si ya hay 10 o más noticias, eliminamos las más antiguas para dejar espacio
    if (querySnapshot.size >= 10) {
        const numNoticiasABorrar = querySnapshot.size - 9; // Dejar exactamente 9 noticias libres para la nueva
        
        for (let i = 0; i < numNoticiasABorrar; i++) {
            const docSnapshot = querySnapshot.docs[i];
            const data = docSnapshot.data();
            
            // Borrar archivo de Storage
            if (data.imagePath) {
                try {
                    const imgRef = ref(storage, data.imagePath);
                    await deleteObject(imgRef);
                } catch (err) {
                    console.warn("No se pudo eliminar la imagen de Storage o ya no existe:", err);
                }
            }
            
            // Borrar registro de Firestore
            await deleteDoc(docSnapshot.ref);
            console.log("Noticia antigua eliminada automáticamente para mantener límite de 10:", docSnapshot.id);
        }
    }
}

// 6. Cargar y renderizar noticias para el panel de administración
async function cargarNoticiasAdmin() {
    if (!adminNewsList) return;
    adminNewsList.innerHTML = `<p class="text-muted text-center font-italic my-3">Cargando noticias...</p>`;

    try {
        const q = query(collection(db, "noticias"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);

        renderizarNoticiasAdmin(querySnapshot);
    } catch (error) {
        console.error("Error al cargar noticias de administración:", error);
        adminNewsList.innerHTML = `<p class="text-danger text-center my-3">Error al cargar noticias.</p>`;
    }
}

function renderizarNoticiasAdmin(querySnapshot) {
    if (querySnapshot.empty) {
        adminNewsList.innerHTML = `<p class="text-muted text-center font-italic my-3">No hay noticias creadas.</p>`;
        return;
    }

    let html = "";
    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        
        html += `
            <div class="list-group-item d-flex align-items-center justify-content-between p-3 mb-2 border rounded">
                <div class="d-flex align-items-center" style="max-width: 80%;">
                    <img src="${data.imageUrl}" alt="${data.titulo}" class="rounded mr-3" style="width: 50px; height: 50px; object-fit: cover;" />
                    <div>
                        <h6 class="mb-0 text-truncate font-weight-bold" style="max-width: 320px;">${data.titulo}</h6>
                        <small class="text-muted">${data.categoria}</small>
                    </div>
                </div>
                <button class="btn btn-outline-danger btn-sm rounded-circle btn-delete-news" data-id="${id}" data-imagepath="${data.imagePath || ''}" style="width: 32px; height: 32px; padding: 0;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    });

    adminNewsList.innerHTML = html;

    // Configurar listeners de eliminación
    const deleteButtons = adminNewsList.querySelectorAll(".btn-delete-news");
    deleteButtons.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const button = e.currentTarget;
            const docId = button.getAttribute("data-id");
            const imagePath = button.getAttribute("data-imagepath");
            
            if (confirm("¿Estás seguro de que quieres eliminar esta noticia?")) {
                button.disabled = true;
                button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
                
                try {
                    // Validar permisos
                    await autenticarAnonimamente();
                    
                    // Borrar de Storage si tiene ruta
                    if (imagePath) {
                        try {
                            const imgRef = ref(storage, imagePath);
                            await deleteObject(imgRef);
                        } catch (err) {
                            console.warn("Error al borrar imagen de Storage:", err);
                        }
                    }
                    
                    // Borrar de Firestore
                    await deleteDoc(doc(db, "noticias", docId));
                    
                    // Recargar lista
                    await cargarNoticiasAdmin();
                } catch (err) {
                    console.error("Error al borrar la noticia:", err);
                    alert("Error al intentar eliminar la noticia.");
                    button.disabled = false;
                    button.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                }
            }
        });
    });
}

// 7. Lógica principal para subir la noticia al enviar el formulario
async function procesarSubidaNoticia(e) {
    e.preventDefault();
    if (!isAuthorized) {
        alert("No autorizado.");
        return;
    }

    const file = newsImage.files[0];
    const titulo = newsTitle.value.trim();
    const categoria = newsCategory.value;

    if (!file || !titulo || !categoria) {
        mostrarStatus("Por favor complete todos los campos.", "danger");
        return;
    }

    const btnSubmit = document.getElementById("btnSubmitNews");
    btnSubmit.disabled = true;

    try {
        mostrarStatus("Iniciando sesión segura...", "info");
        await autenticarAnonimamente();

        let downloadURL;
        let imagePath = "";

        try {
            mostrarStatus("Subiendo imagen...", "info");
            const uploadResult = await subirImagen(file);
            downloadURL = uploadResult.downloadURL;
            imagePath = uploadResult.imagePath;
        } catch (storageError) {
            console.warn("Storage falló o no está configurado, usando Base64 local:", storageError);
            mostrarStatus("Firebase Storage no disponible. Guardando imagen en la base de datos...", "info");
            downloadURL = await fileToBase64Resized(file);
        }

        mostrarStatus("Creando noticia en el servidor...", "info");
        await crearNoticia(titulo, categoria, downloadURL, imagePath);

        mostrarStatus("¡Noticia subida con éxito!", "success");
        setTimeout(async () => {
            cerrarModal(newsCreateModal);
            // Recargar carrusel dinámico inmediatamente
            if (typeof cargarNoticias === "function") {
                await cargarNoticias();
            }
        }, 1500);

    } catch (error) {
        console.error("Error durante la subida de noticia:", error);
        mostrarStatus(`Error: ${error.message || "Ocurrió un error inesperado."}`, "danger");
        btnSubmit.disabled = false;
    }
}

function mostrarStatus(mensaje, tipo) {
    adminNewsStatus.textContent = mensaje;
    adminNewsStatus.className = `alert alert-${tipo} text-center font-weight-bold mb-3`;
    adminNewsStatus.style.display = "block";
}
