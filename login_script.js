document.addEventListener("DOMContentLoaded", () => {
    const confirmButton = document.getElementById("confirmButton");

    confirmButton.addEventListener("click", () => {
        const userId = document.getElementById("userId").value;

        if (userId) {
            // Przechowaj ID w localStorage
            localStorage.setItem("logedInCharacterId", userId);

            // Przekieruj na index.html
            window.location.href = "index.html";
        } else {
            alert("Please enter your User ID.");
        }
    });
});