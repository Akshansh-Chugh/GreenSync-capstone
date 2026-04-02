document.addEventListener('DOMContentLoaded', () => {
    // ===== Theme =====
    initTheme();

    const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const publicPages = ['login.html', 'signup.html', 'index.html', ''];
    if (!isLoggedIn && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return;
    }

    // Build navigation
    const navEl = document.getElementById('siteNav');
    if (navEl) {
        const navItems = [
            { label: 'Dashboard', href: 'my-plants.html', match: ['my-plants.html', 'pot-detail.html'] },
            { label: 'About', href: 'about.html', match: ['about.html'] },
            { label: 'Contact', href: 'contact.html', match: ['contact.html'] },
        ];

        navItems.forEach(item => {
            const a = document.createElement('a');
            a.href = item.href;
            a.className = 'nav-link' + (item.match.includes(currentPage) ? ' active' : '');
            a.textContent = item.label;
            navEl.appendChild(a);
        });

        // Theme toggle in nav
        const themeBtn = document.createElement('button');
        themeBtn.className = 'theme-toggle';
        themeBtn.title = 'Toggle dark mode';
        themeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
        themeBtn.addEventListener('click', () => toggleTheme(themeBtn));
        navEl.appendChild(themeBtn);

        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-link logout';
        logoutBtn.textContent = '↪ Logout';
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
        navEl.appendChild(logoutBtn);
    }

    // Mobile menu toggle
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn && navEl) {
        menuBtn.addEventListener('click', () => {
            navEl.classList.toggle('open');
            menuBtn.textContent = navEl.classList.contains('open') ? '✕' : '☰';
        });
    }
});

// ===== Theme Helpers =====
function initTheme() {
    const saved = localStorage.getItem('greensync-theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark');
    }
    // Auth pages: inject floating toggle
    const authLayout = document.querySelector('.auth-layout');
    if (authLayout) {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle auth-theme-toggle';
        btn.title = 'Toggle dark mode';
        btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
        btn.addEventListener('click', () => toggleTheme(btn));
        document.body.appendChild(btn);
    }
}

function toggleTheme(btn) {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('greensync-theme', isDark ? 'dark' : 'light');
    // Update all toggle buttons on page
    document.querySelectorAll('.theme-toggle').forEach(b => {
        b.textContent = isDark ? '☀️' : '🌙';
    });
}

// Toast notification helper
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
