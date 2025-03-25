document.addEventListener("DOMContentLoaded", () => {
    const confirmButton = document.getElementById("confirmButton");

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

                    // Przechowaj ID w localStorage
                    localStorage.setItem("logedInCharacterId", userId);

                    // Logowanie w konsoli
                    console.log(`User with ID ${userId} has been successfully logged in.`);

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
