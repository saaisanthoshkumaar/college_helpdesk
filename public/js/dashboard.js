document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await api.request('/api/student/dashboard');
        
        const deptDisplay = document.getElementById('student-dept-display');
        if (deptDisplay && data.student) {
            deptDisplay.textContent = `${data.student.department} Department`;
        }

        const noticesContainer = document.getElementById('recent-notices');
        if (noticesContainer) {
            if (data.recentNotices && data.recentNotices.length > 0) {
                noticesContainer.innerHTML = data.recentNotices.map(notice => `
                    <div class="notice-item">
                        <div class="notice-title">${escapeHTML(notice.title)}</div>
                        <div class="notice-meta">${escapeHTML(notice.category)} • ${new Date(notice.created_at).toLocaleDateString()}</div>
                    </div>
                `).join('');
            } else {
                noticesContainer.innerHTML = '<p class="text-secondary">No recent notices.</p>';
            }
        }
    } catch (error) {
        console.error('Failed to load dashboard data', error);
    }

    const quickAskForm = document.getElementById('quick-ask-form');
    if (quickAskForm) {
        quickAskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('quick-ask-input').value;
            if (input.trim()) {
                // Store question in sessionStorage and redirect to chat
                sessionStorage.setItem('initialChatQuestion', input);
                window.location.href = '/chat.html';
            }
        });
    }
});
