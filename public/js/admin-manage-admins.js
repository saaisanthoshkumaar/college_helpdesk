document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('admins-table-body');
    const adminModal = document.getElementById('admin-modal');
    const adminForm = document.getElementById('admin-form');
    const adminFormError = document.getElementById('admin-form-error');
    let allAdmins = [];

    const openModal = () => {
        adminForm.reset();
        adminFormError.style.display = 'none';
        adminModal.classList.add('active');
    };
    const closeModal = () => adminModal.classList.remove('active');

    const renderTable = (admins) => {
        if (admins.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-secondary" style="text-align:center;padding:40px;">No admins found.</td></tr>';
            return;
        }
        tableBody.innerHTML = admins.map(a => `
            <tr>
                <td>${escapeHTML(a.name)}</td>
                <td>${escapeHTML(a.email)}</td>
                <td><span class="badge ${a.role === 'main_admin' ? 'badge-published' : 'badge-draft'}">${a.role === 'main_admin' ? 'Main Admin' : 'Admin'}</span></td>
                <td><span class="badge ${a.status === 'active' ? 'badge-active' : 'badge-inactive'}">${a.status}</span></td>
                <td>${new Date(a.created_at).toLocaleDateString()}</td>
                <td>
                    ${a.role !== 'main_admin'
                        ? (a.status === 'active'
                            ? `<button class="action-btn danger" onclick="toggleAdminStatus(${a.id}, 'deactivated')">Deactivate</button>`
                            : `<button class="action-btn" onclick="toggleAdminStatus(${a.id}, 'active')">Activate</button>`)
                        : '<span class="text-secondary" style="font-size:12px;">Protected</span>'
                    }
                </td>
            </tr>
        `).join('');
    };

    const loadAdmins = async () => {
        try {
            allAdmins = await api.request('/api/admin/admins');
            renderTable(allAdmins);
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-error" style="text-align:center;">Failed to load admins.</td></tr>';
        }
    };

    window.toggleAdminStatus = async (id, status) => {
        const label = status === 'active' ? 'activate' : 'deactivate';
        if (!confirm(`Are you sure you want to ${label} this admin account?`)) return;
        try {
            await api.request(`/api/admin/admins/${id}/status`, 'PATCH', { status });
            showToast(`Admin account ${label}d.`, 'success');
            await loadAdmins();
        } catch (e) {
            showToast(e.message || `Failed to ${label} account.`, 'error');
        }
    };

    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminFormError.style.display = 'none';
        const body = {
            name: document.getElementById('admin-name').value.trim(),
            email: document.getElementById('admin-email').value.trim(),
            password: document.getElementById('admin-password').value
        };
        try {
            await api.request('/api/admin/admins', 'POST', body);
            showToast('Admin account created successfully.', 'success');
            closeModal();
            await loadAdmins();
        } catch (err) {
            adminFormError.textContent = err.message;
            adminFormError.style.display = 'block';
        }
    });

    document.getElementById('add-admin-btn').addEventListener('click', openModal);
    document.getElementById('close-admin-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-admin-modal').addEventListener('click', closeModal);
    adminModal.addEventListener('click', (e) => { if (e.target === adminModal) closeModal(); });

    await loadAdmins();
});
