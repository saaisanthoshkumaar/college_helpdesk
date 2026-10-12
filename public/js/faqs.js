document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('faqs-container');
    const searchInput = document.getElementById('faq-search');
    let allFaqs = [];

    const renderFaqs = (faqsToRender) => {
        if (faqsToRender.length === 0) {
            container.innerHTML = '<p class="text-secondary">No FAQs found.</p>';
            return;
        }

        container.innerHTML = faqsToRender.map(faq => `
            <div class="card">
                <div class="chat-category-badge" style="margin-bottom: 8px;">${escapeHTML(faq.category)}</div>
                <h3 style="margin-bottom: 12px; font-size: 18px;">${escapeHTML(faq.question)}</h3>
                <p class="text-secondary" style="line-height: 1.6;">${escapeHTML(faq.answer)}</p>
            </div>
        `).join('');
    };

    try {
        allFaqs = await api.request('/api/student/faqs');
        renderFaqs(allFaqs);
    } catch (error) {
        container.innerHTML = '<p class="text-error">Failed to load FAQs.</p>';
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allFaqs.filter(f => 
                f.question.toLowerCase().includes(term) || 
                f.answer.toLowerCase().includes(term) ||
                f.category.toLowerCase().includes(term)
            );
            renderFaqs(filtered);
        });
    }
});
