// js/firebase.js
// Archivo de inicialización de Firebase con SDK v10 (ES Modules)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// REEMPLAZAR esta configuración por las credenciales de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIyz10jlI_M6RrBQn8OF5l7NM4NNTpg3Y",
  authDomain: "manuel-belgrano-web-1d164.firebaseapp.com",
  projectId: "manuel-belgrano-web-1d164",
  storageBucket: "manuel-belgrano-web-1d164.firebasestorage.app",
  messagingSenderId: "863044823769",
  appId: "1:863044823769:web:8c87fdf4bff5fd2cc9acc8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Servicios
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Exportar servicios para usar en news.js y admin-news.js
export { db, storage, auth };
