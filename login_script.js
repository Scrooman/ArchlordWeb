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
            document.querySelectorAll('.race_icon_button').forEach(btn => btn.classList.remove('race_active'));
            raceButton.classList.add('race_active');
        });
    });

    let selectedClassIconId = null;

    document.querySelectorAll(".class_icon_button").forEach(classButton => {
        classButton.addEventListener("click", () => {
            selectedClassIconId = classButton.id;
            console.log("Selected Class Icon ID:", selectedClassIconId);
            document.querySelectorAll('.class_icon_button').forEach(btn => btn.classList.remove('active'));
            classButton.classList.add('active');
        });
    });

    confirmButton.addEventListener("click", async () => {
        const userLogin = document.getElementById("userId").value;
        const userPassword = document.getElementById("password").value;

        if (userLogin) {
            try {
                // Wyślij żądanie POST do serwera
                const response = await fetch("http://127.0.0.1:5000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userLogin, userPassword }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data.message); // Wyświetl wiadomość z serwera

                    // Przechowaj characterId i userId w localStorage
                    localStorage.setItem("logedInCharacterId", data.characterId);
                    localStorage.setItem("userId", data.userId);
                    localStorage.setItem("isLoggedIn", "true");

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

    const registerNewCharacter = async () => {
        const newCharacterName = document.getElementById("characterName").value;
        const newCharacterLogin = document.getElementById("newCharacterLogin").value;
        const newCharacterPassword = document.getElementById("newCharacterPassword").value;
        const newCharacterRace = selectedRaceIconId;
        const newCharacterClass = selectedClassIconId;

        if (newCharacterName && newCharacterLogin && newCharacterPassword && newCharacterRace && newCharacterClass) {
            try {
                // Wyślij żądanie POST do serwera
                const response = await fetch("http://127.0.0.1:5000/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        newCharacterName,
                        newCharacterLogin,
                        newCharacterPassword,
                        newCharacterRace,
                        newCharacterClass,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data.message); // Wyświetl wiadomość z serwera
                    alert("Registration successful!");
                    // Przechowaj characterId i userId w localStorage
                    localStorage.setItem("logedInCharacterId", data.new_character_id);
                    localStorage.setItem("userId", data.new_user_id);
                    localStorage.setItem("isLoggedIn", "true");
                    // Przekieruj na index.html
                    window.location.href = "index.html";
                } else {
                    const errorData = await response.json();
                    const errorMessage = errorData.error || "Unknown error occurred.";
                    alert(`Registration failed: ${errorMessage}`);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            }
        } else {
            alert("Please fill in all fields.");
        }
    };

    const registrationConfirmButton = document.getElementById("createButton");
    registrationConfirmButton.addEventListener("click", registerNewCharacter);
});
