document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('notices-container');

    try {
        const notices = await api.request('/api/student/notices');
        
        if (notices.length === 0) {
            container.innerHTML = '<p class="text-secondary">No notices available at this time.</p>';
            return;
        }

        container.innerHTML = notices.map(notice => `
            <div class="card">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span class="chat-category-badge">${escapeHTML(notice.category)}</span>
                    <span class="text-secondary" style="font-size: 12px;">${new Date(notice.created_at).toLocaleDateString()}</span>
                </div>
                <h3 style="margin-bottom: 12px; font-size: 18px;">${escapeHTML(notice.title)}</h3>
                <p class="text-secondary" style="line-height: 1.6;">${escapeHTML(notice.content)}</p>
                ${notice.department ? `<div class="mt-4 text-secondary" style="font-size: 12px;">Department: ${escapeHTML(notice.department)}</div>` : ''}
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="text-error">Failed to load notices.</p>';
    }
});
