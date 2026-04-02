document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Message sent! We\'ll get back to you soon.');
        form.reset();
    });
});
