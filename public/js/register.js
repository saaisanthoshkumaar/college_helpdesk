document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-message');
    const successMsg = document.getElementById('success-message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';

            const name = document.getElementById('name').value.trim();
            const collegeId = document.getElementById('collegeId').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                errorMsg.textContent = 'Passwords do not match.';
                errorMsg.style.display = 'block';
                return;
            }

            try {
                const response = await api.request('/api/auth/register', 'POST', { 
                    name, collegeId, email, password, confirmPassword 
                });
                
                successMsg.textContent = response.message;
                successMsg.style.display = 'block';
                registerForm.reset();
                
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } catch (error) {
                errorMsg.textContent = error.message;
                errorMsg.style.display = 'block';
            }
        });
    }
});
