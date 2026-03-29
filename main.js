document.addEventListener("DOMContentLoaded", () => {

    // ================= HEADER / NAVBAR / FOOTER =================
    const header = document.getElementById("header");
    const navbar = document.getElementById("navbar");
    const footer = document.getElementById("footer");

    if (header) {
        header.innerHTML = `
            <div class="header-container">
                <img src="assets/logo.jpg" class="logo">
                <h1>GreenSync</h1>
                <button id="theme-toggle">🌙</button>
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

    // ================= DARK MODE =================
    const toggleBtn = document.getElementById("theme-toggle");

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark");

            if (document.body.classList.contains("dark")) {
                localStorage.setItem("theme", "dark");
            } else {
                localStorage.setItem("theme", "light");
            }
        });
    }

});