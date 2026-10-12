document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('users-table-body');
    const userSearch = document.getElementById('user-search');
    let allUsers = [];

    const renderTable = (users) => {
        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-secondary" style="text-align:center;padding:40px;">No students found.</td></tr>';
            return;
        }
        tableBody.innerHTML = users.map(u => `
            <tr>
                <td>${escapeHTML(u.name)}</td>
                <td><code>${escapeHTML(u.college_id)}</code></td>
                <td>${escapeHTML(u.email)}</td>
                <td>${escapeHTML(u.department || '—')}</td>
                <td><span class="badge ${u.status === 'active' ? 'badge-active' : 'badge-inactive'}">${u.status}</span></td>
                <td>${new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                    ${u.status === 'active'
                        ? `<button class="action-btn danger" onclick="toggleStatus(${u.id}, 'deactivated')">Deactivate</button>`
                        : `<button class="action-btn" onclick="toggleStatus(${u.id}, 'active')">Activate</button>`
                    }
                </td>
            </tr>
        `).join('');
    };

    const loadUsers = async () => {
        try {
            allUsers = await api.request('/api/admin/students');
            renderTable(allUsers);
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-error" style="text-align:center;">Failed to load students.</td></tr>';
        }
    };

    window.toggleStatus = async (id, status) => {
        const label = status === 'active' ? 'activate' : 'deactivate';
        if (!confirm(`Are you sure you want to ${label} this account?`)) return;
        try {
            await api.request(`/api/admin/students/${id}/status`, 'PATCH', { status });
            showToast(`Account ${label}d successfully.`, 'success');
            await loadUsers();
        } catch (e) {
            showToast(`Failed to ${label} account.`, 'error');
        }
    };

    userSearch.addEventListener('input', (e) => {
        const t = e.target.value.toLowerCase();
        renderTable(allUsers.filter(u =>
            u.name.toLowerCase().includes(t) ||
            u.college_id.toLowerCase().includes(t) ||
            (u.department || '').toLowerCase().includes(t)
        ));
    });

    await loadUsers();
});
