document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';

            const identifier = document.getElementById('identifier').value.trim();
            const password = document.getElementById('password').value;

            try {
                const response = await api.request('/api/auth/login', 'POST', { identifier, password });
                showToast('Login successful!');
                setTimeout(() => {
                    window.location.href = response.redirect;
                }, 500);
            } catch (error) {
                errorMsg.textContent = error.message;
                errorMsg.style.display = 'block';
            }
        });
    }
});
