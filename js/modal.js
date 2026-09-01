// Login para entrar a Docentes: 

window.abrirModal = function () {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.style.display = "flex";
        document.documentElement.classList.add("modal-open");
        document.body.classList.add("modal-open");
        document.body.style.overflow = "hidden";
        setTimeout(function () {
            const input = document.getElementById("passwordInput");
            if (input) input.focus();
        }, 50);
    }
};

window.cerrarModal = function () {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.style.display = "none";
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
    }
    const input = document.getElementById("passwordInput");
    if (input) input.value = "";
    const errorMsg = document.getElementById("errorMsg");
    if (errorMsg) errorMsg.textContent = "";
};

window.checkPassword = async function () {
    const input = document.getElementById("passwordInput").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (input === "") {
        errorMsg.textContent = "Ingrese una contraseña.";
        errorMsg.style.color = "red";
        return;
    }

    errorMsg.textContent = "Verificando...";
    errorMsg.style.color = "#0284c7"; // Azul institucional sutil

    try {
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/manuel-belgrano-web-1d164/databases/(default)/documents/accesos/${input}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.fields) {
                const hasDocenteRole = data.fields.rol && data.fields.rol.stringValue === "docente";
                const isEnabled = data.fields.enabled && data.fields.enabled.booleanValue === true;
                const isExplicitlyDisabled = data.fields.enabled && data.fields.enabled.booleanValue === false;

                if (!isExplicitlyDisabled && (hasDocenteRole || isEnabled)) {
                    sessionStorage.setItem("access_granted", "true");
                    cerrarModal();
                    window.location.href = "docentes.html";
                    return;
                }
            }
        }
        errorMsg.textContent = "Contraseña incorrecta.";
        errorMsg.style.color = "red";
    } catch (error) {
        console.error("Error al validar contraseña en la nube:", error);
        errorMsg.textContent = "Error al conectar con la base de datos.";
        errorMsg.style.color = "red";
    }
};

// Cerrar el modal al hacer clic en el fondo o presionar Escape
document.addEventListener("click", function (e) {
    const modal = document.getElementById("loginModal");
    if (modal && e.target === modal) {
        window.cerrarModal();
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        window.cerrarModal();
    }
});


