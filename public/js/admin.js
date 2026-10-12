// Admin Auth Guard
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    try {
        const me = await api.request('/api/auth/me');
        if (!me.authenticated) {
            window.location.href = '/login.html';
            return;
        }
        if (me.role === 'student') {
            window.location.href = '/dashboard.html';
            return;
        }
        // Set name
        document.querySelectorAll('.user-name-display').forEach(el => el.textContent = me.name);
    } catch(e) {
        window.location.href = '/login.html';
        return;
    }

    // Logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await api.request('/api/auth/logout', 'POST');
            } finally {
                window.location.href = '/login.html';
            }
        });
    }

    // Mobile toggle
    const mobileToggle = document.getElementById('admin-mobile-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    // Dashboard specific: load stats
    const statStudents = document.getElementById('stat-students');
    if (statStudents) {
        try {
            const data = await api.request('/api/admin/dashboard');
            statStudents.textContent = data.students;
            document.getElementById('stat-admins').textContent = data.admins;
            document.getElementById('stat-faqs').textContent = data.faqs;
            document.getElementById('stat-notices').textContent = data.notices;

            const activityBody = document.getElementById('activity-table-body');
            if (data.recentActivity && data.recentActivity.length > 0) {
                activityBody.innerHTML = data.recentActivity.map(a => `
                    <tr>
                        <td>${escapeHTML(a.admin_name)}</td>
                        <td>${escapeHTML(a.action)}</td>
                        <td>${escapeHTML(a.entity_type)}</td>
                        <td>${new Date(a.created_at).toLocaleString()}</td>
                    </tr>
                `).join('');
            } else {
                activityBody.innerHTML = '<tr><td colspan="4" class="text-secondary" style="text-align:center;">No recent activity.</td></tr>';
            }
        } catch(e) {
            console.error('Failed to load dashboard data', e);
        }
    }
});
