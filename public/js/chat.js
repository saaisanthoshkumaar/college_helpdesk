document.addEventListener('DOMContentLoaded', async () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatSendBtn = document.getElementById('chat-send');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    let sessionReference = sessionStorage.getItem('chatSessionRef') || null;

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

    // Load History
    const loadHistory = async () => {
        try {
            const history = await api.request('/api/chat/history');
            if (history.length === 0) {
                appendMessage("Hello! I am the AI Help Desk. How can I assist you today?", 'bot');
            } else {
                history.forEach(item => {
                    appendMessage(item.question, 'user');
                    // We don't have category in history right now, could be added later
                    appendMessage(item.answer, 'bot');
                });
            }
        } catch (error) {
            console.error('Failed to load history', error);
        }
    };

    await loadHistory();

    // Check if there is an initial question from dashboard
    const initialQuestion = sessionStorage.getItem('initialChatQuestion');
    if (initialQuestion) {
        sessionStorage.removeItem('initialChatQuestion');
        chatInput.value = initialQuestion;
        // Trigger submit
        setTimeout(() => {
            chatForm.dispatchEvent(new Event('submit'));
        }, 300);
    }

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
            const data = await api.request('/api/chat/message', 'POST', { 
                message: text,
                sessionReference
            });
            
            removeTypingIndicator();
            appendMessage(data.answer, 'bot', data.category || 'General');
            
            if (data.sessionReference) {
                sessionReference = data.sessionReference;
                sessionStorage.setItem('chatSessionRef', sessionReference);
            }

        } catch (error) {
            removeTypingIndicator();
            appendMessage("Sorry, I'm having trouble connecting right now.", 'bot', 'Error');
        } finally {
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
            chatInput.focus();
        }
    });

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear your chat history?')) {
                try {
                    await api.request('/api/chat/history', 'DELETE');
                    chatMessages.innerHTML = '';
                    appendMessage("Hello! I am the AI Help Desk. How can I assist you today?", 'bot');
                    sessionStorage.removeItem('chatSessionRef');
                    sessionReference = null;
                } catch (error) {
                    showToast('Failed to clear history', 'error');
                }
            }
        });
    }
});
