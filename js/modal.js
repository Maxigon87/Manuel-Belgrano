//Login para entrar a Docentes: 

window.abrirModal = function () {
    document.getElementById("loginModal").style.display = "flex"; // 👈 CAMBIADO
};

window.cerrarModal = function () {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("passwordInput").value = "";
    document.getElementById("errorMsg").textContent = "";
};

window.checkPassword = async function () {
    const input = document.getElementById("passwordInput").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (input === "") {
        errorMsg.textContent = "Ingrese una contraseña.";
        return;
    }

    errorMsg.textContent = "Verificando...";
    errorMsg.style.color = "#FFD700"; // Color dorado temporal

    try {
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/manuel-belgrano-web/databases/(default)/documents/accesos/${input}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.fields && data.fields.rol && data.fields.rol.stringValue === "docente") {
                localStorage.setItem("access_granted", "true");
                cerrarModal();
                window.location.href = "docentes.html";
                return;
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

