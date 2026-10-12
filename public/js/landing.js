document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatSendBtn = document.getElementById('chat-send');

    const appendMessage = (text, sender, meta = '') => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        
        let contentHtml = escapeHTML(text);
        if (meta) {
            contentHtml = `<span class="chat-category-badge">${escapeHTML(meta)}</span><br>` + contentHtml;
        }

        msgDiv.innerHTML = contentHtml;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const appendTypingIndicator = () => {
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = 'typing-indicator';
        div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        chatInput.disabled = true;
        chatSendBtn.disabled = true;

        appendMessage(text, 'user');
        appendTypingIndicator();

        try {
            const data = await api.request('/api/public/chat', 'POST', { message: text });
            removeTypingIndicator();
            appendMessage(data.answer, 'bot', data.category || 'General');
        } catch (error) {
            removeTypingIndicator();
            appendMessage("Sorry, I'm having trouble connecting right now.", 'bot', 'Error');
        } finally {
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
            chatInput.focus();
        }
    });
});
