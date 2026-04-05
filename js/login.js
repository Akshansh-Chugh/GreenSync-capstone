document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value
        };

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok && result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('role', result.role);
                window.location.href = 'my-plants.html';
            } else {
                showToast(result.message || 'Login failed');
            }

        } catch (err) {
            showToast('Server error');
        }
    });
});