document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm').value;

        if (password !== confirm) {
            showToast('Passwords do not match!');
            return;
        }

        // Redirect to login after signup
        showToast('Account created! Redirecting to login...');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });
});

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}