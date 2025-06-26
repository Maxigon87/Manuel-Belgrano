//Login para entrar a Docentes: 

window.abrirModal = function () {
    document.getElementById("loginModal").style.display = "flex"; // 👈 CAMBIADO
};

window.cerrarModal = function () {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("passwordInput").value = "";
    document.getElementById("errorMsg").textContent = "";
};

window.checkPassword = function () {
    const input = document.getElementById("passwordInput").value;
    const errorMsg = document.getElementById("errorMsg");

    if (input === "") {
        errorMsg.textContent = "Ingrese una contraseña.";
    } else if (input === "3escuelas2025") {
        localStorage.setItem("access_granted", "true");
        cerrarModal();
        window.location.href = "docentes.html";
    } else {
        errorMsg.textContent = "Contraseña incorrecta.";
    }
};
