document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('notices-table-body');
    const noticeModal = document.getElementById('notice-modal');
    const noticeForm = document.getElementById('notice-form');
    let allNotices = [];

    const openModal = (notice = null) => {
        document.getElementById('notice-id').value = notice ? notice.id : '';
        document.getElementById('notice-title').value = notice ? notice.title : '';
        document.getElementById('notice-category').value = notice ? notice.category : '';
        document.getElementById('notice-content').value = notice ? notice.content : '';
        document.getElementById('notice-dept').value = notice ? (notice.department || '') : '';
        document.getElementById('notice-published').checked = notice ? Boolean(notice.published) : true;
        document.getElementById('notice-modal-title').textContent = notice ? 'Edit Notice' : 'Add Notice';
        noticeModal.classList.add('active');
    };

    const closeModal = () => noticeModal.classList.remove('active');

    const bindNoticeActions = () => {
        tableBody.querySelectorAll('button[data-action]').forEach((button) => {
            button.addEventListener('click', async () => {
                const id = Number(button.dataset.id);
                const action = button.dataset.action;
                const row = button.closest('tr');
                const noticePreview = row?.cells[0]?.textContent?.trim() || 'this notice';

                if (action === 'edit') {
                    const notice = allNotices.find((item) => item.id === id);
                    if (notice) openModal(notice);
                    return;
                }

                if (action === 'delete') {
                    if (!confirm(`Delete notice: "${noticePreview.slice(0, 30)}"?`)) return;
                    try {
                        await api.request(`/api/admin/notices/${id}`, 'DELETE');
                        showToast('Notice deleted.', 'success');
                        await loadNotices();
                    } catch (e) {
                        showToast('Failed to delete notice.', 'error');
                    }
                }
            });
        });
    };

    const renderTable = (notices) => {
        if (notices.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-secondary" style="text-align:center;padding:40px;">No notices found.</td></tr>';
            return;
        }
        tableBody.innerHTML = notices.map(n => `
            <tr>
                <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(n.title)}</td>
                <td>${escapeHTML(n.category)}</td>
                <td><span class="badge ${n.published ? 'badge-published' : 'badge-draft'}">${n.published ? 'Published' : 'Draft'}</span></td>
                <td>${new Date(n.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn" data-action="edit" data-id="${n.id}">✏️</button>
                    <button class="action-btn danger" data-action="delete" data-id="${n.id}">🗑️</button>
                </td>
            </tr>
        `).join('');
        bindNoticeActions();
    };

    const loadNotices = async () => {
        try {
            allNotices = await api.request('/api/admin/notices');
            renderTable(allNotices);
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-error" style="text-align:center;">Failed to load notices.</td></tr>';
        }
    };

    noticeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('notice-id').value;
        const body = {
            title: document.getElementById('notice-title').value.trim(),
            category: document.getElementById('notice-category').value,
            content: document.getElementById('notice-content').value.trim(),
            department: document.getElementById('notice-dept').value.trim(),
            published: document.getElementById('notice-published').checked
        };
        try {
            if (id) {
                await api.request(`/api/admin/notices/${id}`, 'PUT', body);
                showToast('Notice updated.', 'success');
            } else {
                await api.request('/api/admin/notices', 'POST', body);
                showToast('Notice created.', 'success');
            }
            closeModal();
            await loadNotices();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.getElementById('add-notice-btn').addEventListener('click', () => openModal());
    document.getElementById('close-notice-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-notice-modal').addEventListener('click', closeModal);
    noticeModal.addEventListener('click', (e) => { if (e.target === noticeModal) closeModal(); });
    document.getElementById('notice-search').addEventListener('input', (e) => {
        const t = e.target.value.toLowerCase();
        renderTable(allNotices.filter(n => n.title.toLowerCase().includes(t) || n.category.toLowerCase().includes(t)));
    });

    await loadNotices();
});
