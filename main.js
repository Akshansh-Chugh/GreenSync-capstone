document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // LOAD HEADER / NAVBAR / FOOTER
    // =========================
    const header = document.getElementById("header");
    const navbar = document.getElementById("navbar");
    const footer = document.getElementById("footer");

    if (header) {
        header.innerHTML = `
            <div class="header-container">
                <img src="assets/logo.jpg" class="logo">
                <h1>GreenSync</h1>
            </div>
        `;
    }

    if (navbar) {
        navbar.innerHTML = `
            <a href="myplants.html" class="nav-link">My Plants</a>
            <a href="about.html" class="nav-link">About</a>
            <a href="contact.html" class="nav-link">Contact</a>
        `;
    }

    if (footer) {
        footer.innerHTML = `<p>© 2026 GreenSync</p>`;
    }

    // =========================
    // CHART (only runs if exists)
    // =========================
    const chartCanvas = document.getElementById("sensorChart");

    if (chartCanvas && window.Chart) {
        const ctx = chartCanvas.getContext("2d");

        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["12:00", "12:05", "12:10", "12:15"],
                datasets: [
                    {
                        label: "Temperature",
                        data: [22, 23, 24, 25],
                        borderColor: "#43ea7f",
                        tension: 0.3
                    },
                    {
                        label: "Moisture",
                        data: [45, 47, 46, 48],
                        borderColor: "#2e7d32",
                        tension: 0.3
                    },
                    {
                        label: "Humidity",
                        data: [50, 52, 53, 54],
                        borderColor: "#8bc34a",
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true
            }
        });
    }

    // =========================
    // CONTACT FORM (SAFE)
    // =========================
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Message sent successfully!");
            contactForm.reset();
        });
    }

});