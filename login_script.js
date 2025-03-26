document.addEventListener("DOMContentLoaded", () => {
    const confirmButton = document.getElementById("confirmButton");

    const registerButton = document.getElementById("registerButton");
    const loginMainContainer = document.getElementById("loginMainContainer");
    const registrationMainContainer = document.getElementById("registrationMainContainer");
    const fromRegistrationBackButton = document.getElementById("fromRegistrationBackButton");

    registerButton.addEventListener("click", () => {
        // Ukryj sekcję loginMainContainer
        loginMainContainer.style.display = "none";

        // Wyświetl sekcję registrationMainContainer
        registrationMainContainer.style.display = "flex";
    });

    // Upewnij się, że na początku tylko loginMainContainer jest widoczny
    loginMainContainer.style.display = "flex";
    registrationMainContainer.style.display = "none";


    fromRegistrationBackButton.addEventListener("click", () => {
        // Ukryj sekcję registrationMainContainer
        registrationMainContainer.style.display = "none";

        // Wyświetl sekcję loginMainContainer
        loginMainContainer.style.display = "flex";
    });

    let selectedRaceIconId = null;

    document.querySelectorAll(".race_icon_button").forEach(raceButton => {
        raceButton.addEventListener("click", () => {
            selectedRaceIconId = raceButton.id;
            console.log("Selected Race Icon ID:", selectedRaceIconId);
        });
    });

    let selectedClassIconId = null;

    document.querySelectorAll(".class_icon_button").forEach(classButton => {
        classButton.addEventListener("click", () => {
            selectedClassIconId = classButton.id;
            console.log("Selected class Icon ID:", selectedClassIconId);
        });
    });

    confirmButton.addEventListener("click", async () => {
        const userId = document.getElementById("userId").value;

        if (userId) {
            try {
                // Wyślij żądanie POST do serwera
                const response = await fetch("http://127.0.0.1:5000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data.message); // Wyświetl wiadomość z serwera

                    // Przechowaj characterId i userId w localStorage
                    localStorage.setItem("logedInCharacterId", data.characterId);
                    localStorage.setItem("userId", data.userId);

                    // Przekieruj na index.html
                    window.location.href = "index.html";
                } else {
                    alert("Login failed. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            }
        } else {
            alert("Please enter your User ID.");
        }
    });
});
