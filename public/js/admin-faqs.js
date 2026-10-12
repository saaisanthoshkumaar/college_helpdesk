document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('faqs-table-body');
    const faqModal = document.getElementById('faq-modal');
    const faqForm = document.getElementById('faq-form');
    const addFaqBtn = document.getElementById('add-faq-btn');
    const closeFaqModal = document.getElementById('close-faq-modal');
    const cancelFaqModal = document.getElementById('cancel-faq-modal');
    const faqSearch = document.getElementById('faq-search');
    let allFaqs = [];

    const openModal = (faq = null) => {
        document.getElementById('faq-id').value = faq ? faq.id : '';
        document.getElementById('faq-question').value = faq ? faq.question : '';
        document.getElementById('faq-answer').value = faq ? faq.answer : '';
        document.getElementById('faq-category').value = faq ? faq.category : '';
        document.getElementById('faq-published').checked = faq ? Boolean(faq.published) : true;
        // Parse keywords from JSON
        let keywords = '';
        if (faq && faq.keywords_json) {
            try { keywords = JSON.parse(faq.keywords_json).join(', '); } catch(e){}
        }
        document.getElementById('faq-keywords').value = keywords;
        document.getElementById('modal-title').textContent = faq ? 'Edit FAQ' : 'Add FAQ';
        faqModal.classList.add('active');
    };

    const closeModal = () => faqModal.classList.remove('active');

    const bindFaqActions = () => {
        tableBody.querySelectorAll('button[data-action]').forEach((button) => {
            button.addEventListener('click', async () => {
                const id = Number(button.dataset.id);
                const action = button.dataset.action;
                const row = button.closest('tr');
                const questionPreview = row?.cells[0]?.textContent?.trim() || 'this FAQ';

                if (action === 'edit') {
                    const faq = allFaqs.find((item) => item.id === id);
                    if (faq) openModal(faq);
                    return;
                }

                if (action === 'delete') {
                    if (!confirm(`Delete FAQ: "${questionPreview.slice(0, 30)}"?`)) return;
                    try {
                        await api.request(`/api/admin/faqs/${id}`, 'DELETE');
                        showToast('FAQ deleted successfully.', 'success');
                        await loadFaqs();
                    } catch (e) {
                        showToast('Failed to delete FAQ.', 'error');
                    }
                }
            });
        });
    };

    const renderFaqs = (faqs) => {
        if (faqs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-secondary" style="text-align:center; padding: 40px;">No FAQs found.</td></tr>';
            return;
        }
        tableBody.innerHTML = faqs.map(faq => `
            <tr>
                <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(faq.question)}</td>
                <td>${escapeHTML(faq.category)}</td>
                <td><span class="badge ${faq.published ? 'badge-published' : 'badge-draft'}">${faq.published ? 'Published' : 'Draft'}</span></td>
                <td>${new Date(faq.updated_at).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn" data-action="edit" data-id="${faq.id}">✏️</button>
                    <button class="action-btn danger" data-action="delete" data-id="${faq.id}">🗑️</button>
                </td>
            </tr>
        `).join('');
        bindFaqActions();
    };

    const loadFaqs = async () => {
        try {
            allFaqs = await api.request('/api/admin/faqs');
            renderFaqs(allFaqs);
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-error" style="text-align:center;">Failed to load FAQs.</td></tr>';
        }
    };

    faqForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('faq-id').value;
        const question = document.getElementById('faq-question').value.trim();
        const answer = document.getElementById('faq-answer').value.trim();
        const category = document.getElementById('faq-category').value;
        const published = document.getElementById('faq-published').checked;
        const keywordsRaw = document.getElementById('faq-keywords').value;
        const keywords_json = JSON.stringify(keywordsRaw.split(',').map(k => k.trim()).filter(Boolean));

        try {
            if (id) {
                await api.request(`/api/admin/faqs/${id}`, 'PUT', { question, answer, category, keywords_json, published });
                showToast('FAQ updated successfully.', 'success');
            } else {
                await api.request('/api/admin/faqs', 'POST', { question, answer, category, keywords_json, published });
                showToast('FAQ created successfully.', 'success');
            }
            closeModal();
            await loadFaqs();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    addFaqBtn.addEventListener('click', () => openModal());
    closeFaqModal.addEventListener('click', closeModal);
    cancelFaqModal.addEventListener('click', closeModal);
    faqModal.addEventListener('click', (e) => { if (e.target === faqModal) closeModal(); });

    faqSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        renderFaqs(allFaqs.filter(f => f.question.toLowerCase().includes(term) || f.category.toLowerCase().includes(term)));
    });

    await loadFaqs();
});
