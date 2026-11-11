const app = document.getElementById("app");

const params = new URLSearchParams(window.location.search);

const username =
    params.get("name") ||
    window.initialUser?.name ||
    "Guest";

if (app) {
    app.textContent = "";

    const profileCard = document.createElement("section");
    profileCard.className = "profile-card";

    const heading = document.createElement("h2");
    heading.textContent = `Welcome, ${username}`;

    const emailParagraph = document.createElement("p");
    emailParagraph.textContent = `Email: ${window.initialUser?.email || "Unknown"}`;

    const roleParagraph = document.createElement("p");
    roleParagraph.textContent = `Role: ${window.initialUser?.role || "User"}`;

    profileCard.appendChild(heading);
    profileCard.appendChild(emailParagraph);
    profileCard.appendChild(roleParagraph);

    app.appendChild(profileCard);
}

function prepareSettings(userSettings) {
    const ALLOWED_KEYS = ["theme", "language", "fontSize"];
    const settings = Object.create(null);

    if (userSettings && typeof userSettings === "object") {
        for (const key of ALLOWED_KEYS) {
            if (Object.prototype.hasOwnProperty.call(userSettings, key)) {
                // Ignore dangerous prototype keys
                if (key === "__proto__" || key === "constructor" || key === "prototype") {
                    continue;
                }
                settings[key] = String(userSettings[key]);
            }
        }
    }

    return Object.assign({}, settings);
}

const saveButton = document.getElementById("save-settings");

saveButton.addEventListener("click", async () => {
    const theme = document.getElementById("theme").value;
    const language = document.getElementById("language").value;
    const fontSize = document.getElementById("fontSize").value;

    const settings = prepareSettings({
        theme,
        language,
        fontSize
    });

    try {
        const response = await fetch("/api/settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(settings)
        });

        const result = await response.json();

        document.getElementById("settings-status").textContent =
            result.message;
    } catch (error) {
        document.getElementById("settings-status").textContent =
            "Unable to save settings.";
    }
});