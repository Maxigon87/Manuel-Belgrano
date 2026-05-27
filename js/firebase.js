// js/firebase.js
// Archivo de inicialización de Firebase con SDK v10 (ES Modules)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// REEMPLAZAR esta configuración por las credenciales de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCiokSgOy8qluTfWLR2n88Xz4fx4wqZ6Co",
  authDomain: "manuel-belgrano-web.firebaseapp.com",
  projectId: "manuel-belgrano-web",
  storageBucket: "manuel-belgrano-web.firebasestorage.app",
  messagingSenderId: "755776572609",
  appId: "1:755776572609:web:ce637b04910b28c1025840"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Servicios
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Exportar servicios para usar en news.js y admin-news.js
export { db, storage, auth };
