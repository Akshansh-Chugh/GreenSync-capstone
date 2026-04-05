document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm').value;

        if (password !== confirm) {
            showToast('Passwords do not match!');
            return;
        }

        const data = {
            name: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            password: password,
            role: document.getElementById('role').value
        };

        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                showToast('Account created! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showToast(result.message || 'Signup failed');
            }

        } catch (err) {
            showToast('Server error');
        }
    });
});