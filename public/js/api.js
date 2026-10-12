// API Helper
const api = {
    async request(endpoint, method = 'GET', body = null) {
        try {
            // Include CSRF token for mutating requests
            const headers = {
                'Content-Type': 'application/json'
            };

            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                // Fetch CSRF token if not fetching /auth or /public/chat
                if (!endpoint.includes('/api/auth/') && !endpoint.includes('/api/public/chat')) {
                    const csrfRes = await fetch('/api/csrf-token');
                    if (csrfRes.ok) {
                        const { csrfToken } = await csrfRes.json();
                        headers['x-csrf-token'] = csrfToken;
                    }
                }
            }

            const config = {
                method,
                headers
            };

            if (body) {
                config.body = JSON.stringify(body);
            }

            const response = await fetch(endpoint, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
};

// UI Helpers
const showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};
