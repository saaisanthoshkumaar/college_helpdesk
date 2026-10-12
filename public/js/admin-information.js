document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('info-table-body');
    const infoModal = document.getElementById('info-modal');
    const infoForm = document.getElementById('info-form');
    const addInfoBtn = document.getElementById('add-info-btn');
    const closeInfoModal = document.getElementById('close-info-modal');
    const cancelInfoModal = document.getElementById('cancel-info-modal');
    const infoSearch = document.getElementById('info-search');
    let allInfo = [];

    const openModal = (item = null) => {
        document.getElementById('info-id').value = item ? item.id : '';
        document.getElementById('info-title').value = item ? item.title : '';
        document.getElementById('info-category').value = item ? item.category : '';
        document.getElementById('info-content').value = item ? item.content : '';
        document.getElementById('info-dept').value = item ? (item.department || '') : '';
        document.getElementById('info-source').value = item ? (item.source_reference || '') : '';
        document.getElementById('info-published').checked = item ? Boolean(item.published) : true;
        document.getElementById('info-modal-title').textContent = item ? 'Edit Information' : 'Add Information';
        infoModal.classList.add('active');
    };

    const closeModal = () => infoModal.classList.remove('active');

    const bindInfoActions = () => {
        tableBody.querySelectorAll('button[data-action]').forEach((button) => {
            button.addEventListener('click', async () => {
                const id = Number(button.dataset.id);
                const action = button.dataset.action;
                const row = button.closest('tr');
                const itemPreview = row?.cells[0]?.textContent?.trim() || 'this information record';

                if (action === 'edit') {
                    const item = allInfo.find((currentItem) => currentItem.id === id);
                    if (item) openModal(item);
                    return;
                }

                if (action === 'delete') {
                    if (!confirm(`Delete information: "${itemPreview.slice(0, 30)}"?`)) return;
                    try {
                        await api.request(`/api/admin/information/${id}`, 'DELETE');
                        showToast('Deleted successfully.', 'success');
                        await loadData();
                    } catch (e) {
                        showToast('Failed to delete.', 'error');
                    }
                }
            });
        });
    };

    const renderTable = (items) => {
        if (items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-secondary" style="text-align:center;padding:40px;">No information records found.</td></tr>';
            return;
        }
        tableBody.innerHTML = items.map(item => `
            <tr>
                <td>${escapeHTML(item.title)}</td>
                <td>${escapeHTML(item.category)}</td>
                <td>${escapeHTML(item.department || '—')}</td>
                <td><span class="badge ${item.published ? 'badge-published' : 'badge-draft'}">${item.published ? 'Published' : 'Draft'}</span></td>
                <td>
                    <button class="action-btn" data-action="edit" data-id="${item.id}">✏️</button>
                    <button class="action-btn danger" data-action="delete" data-id="${item.id}">🗑️</button>
                </td>
            </tr>
        `).join('');
        bindInfoActions();
    };

    const loadData = async () => {
        try {
            allInfo = await api.request('/api/admin/information');
            renderTable(allInfo);
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-error" style="text-align:center;">Failed to load data.</td></tr>';
        }
    };

    infoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('info-id').value;
        const body = {
            title: document.getElementById('info-title').value.trim(),
            category: document.getElementById('info-category').value,
            content: document.getElementById('info-content').value.trim(),
            department: document.getElementById('info-dept').value.trim(),
            source_reference: document.getElementById('info-source').value.trim(),
            published: document.getElementById('info-published').checked
        };
        try {
            if (id) {
                await api.request(`/api/admin/information/${id}`, 'PUT', body);
                showToast('Updated successfully.', 'success');
            } else {
                await api.request('/api/admin/information', 'POST', body);
                showToast('Created successfully.', 'success');
            }
            closeModal();
            await loadData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    addInfoBtn.addEventListener('click', () => openModal());
    closeInfoModal.addEventListener('click', closeModal);
    cancelInfoModal.addEventListener('click', closeModal);
    infoModal.addEventListener('click', (e) => { if (e.target === infoModal) closeModal(); });
    infoSearch.addEventListener('input', (e) => {
        const t = e.target.value.toLowerCase();
        renderTable(allInfo.filter(i => i.title.toLowerCase().includes(t) || i.category.toLowerCase().includes(t)));
    });

    await loadData();
});
