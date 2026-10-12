document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    const authPaths = ['/dashboard.html', '/chat.html', '/faqs.html', '/notices.html', '/profile.html', '/admin', '/admin.html'];
    const currentPath = window.location.pathname;
    
    let isProtected = false;
    for (const path of authPaths) {
        if (currentPath.includes(path)) {
            isProtected = true;
            break;
        }
    }

    if (isProtected) {
        try {
            const me = await api.request('/api/auth/me');
            if (!me.authenticated) {
                window.location.href = '/login.html';
                return;
            }
            
            // Check roles
            if (currentPath.includes('/admin') && me.role === 'student') {
                window.location.href = '/dashboard.html';
                return;
            }
            if (!currentPath.includes('/admin') && me.role !== 'student') {
                window.location.href = '/admin.html';
                return;
            }

            // Update UI with name
            const nameEls = document.querySelectorAll('.user-name-display');
            nameEls.forEach(el => el.textContent = me.name);

        } catch (error) {
            window.location.href = '/login.html';
        }
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await api.request('/api/auth/logout', 'POST');
                window.location.href = '/login.html';
            } catch (error) {
                console.error('Logout failed', error);
                window.location.href = '/login.html'; // force redirect anyway
            }
        });
    }

    // Mobile Sidebar Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
});
