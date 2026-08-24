# 🏫 Escuela N°3 Manuel Belgrano (San Luis)

> Sitio web institucional, portales de acceso y sistema de noticias dinámico para la comunidad educativa de la Escuela N°3 Manuel Belgrano.

---

## 📌 ¿De qué trata este proyecto?

Este proyecto es el portal oficial de la **Escuela N°3 Manuel Belgrano** (San Luis, Argentina). Diseñado con un enfoque híbrido, combina la velocidad y sencillez de un sitio estático con la potencia de servicios en la nube para gestionar contenido dinámico y áreas privadas.

### ✨ Características principales
* **Portal público institucional:** Información sobre la escuela, oferta académica, galería multimedia, calendario escolar y formulario de inscripciones.
* **Portales de acceso:** Secciones dedicadas para alumnos y docentes.
* **Módulo dinámico de noticias y eventos:** Carruseles de novedades y agenda actualizados en tiempo real mediante base de datos.
* **Gestión de contenidos:** Integración con Netlify CMS (`admin/`) e interfaces directas de carga.
* **Widget interactivo:** Fecha, clima en vivo y utilidades de interfaz accesibles.

---

## 🛠️ Stack Tecnológico

| Capa / Área | Tecnologías |
| :--- | :--- |
| **Frontend / Marcado** | HTML5, CSS3 (Sass disponible en `scss/`), JavaScript (ES6+) |
| **Frameworks UI & Librerías** | Bootstrap 4.4.1, jQuery |
| **Componentes Visuales** | Owl Carousel (carruseles dinámicos), Tempus Dominus (fechas/horas), Font Awesome |
| **Base de Datos & Tiempo Real** | Firebase Firestore (SDK & REST API) |
| **Despliegue & Backend Serverless** | Cloudflare Pages, Cloudflare Workers & D1 *(planeado/arquitectura)*, Netlify CMS |

---

## 📁 Estructura del Proyecto

```text
Manuel-Belgrano/
├── admin/               # Panel de administración (integración Netlify CMS)
├── css/                 # Estilos compilados/minificados y minimal-style.css
├── scss/                # Fuentes Sass para personalización y rediseño
├── js/                  # Lógica del cliente
│   ├── firebase.js      # Inicialización y configuración de Firebase
│   ├── main.js          # Control de UI (clima, accesos, menú, back-to-top)
│   ├── news.js          # Consulta Firestore y renderizado de noticias/eventos
│   └── modal.js         # Comportamiento de ventanas modales
├── lib/                 # Dependencias externas (Owl Carousel, Tempus Dominus, etc.)
├── img/                 # Recursos gráficos (logos, portadas, fotos, img/posteos/)
├── noticias/            # Recursos y contenido estático de noticias
├── scripts/             # Scripts utilitarios de build, deploy o helpers
├── vid/                 # Medios audiovisuales
├── alum.html            # Portal para alumnos
├── docentes.html        # Portal para docentes
├── inscripciones.html   # Formulario e info de inscripciones
├── calendario.html      # Calendario académico
├── galeria.html         # Galería de imágenes y eventos
├── nosotros.html        # Historia e información institucional
├── carga.html           # Interfaz de carga rápida/administración
├── index.html           # Página principal / Layout base
└── README.md            # Documentación del proyecto
