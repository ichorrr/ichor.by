import React, { useState } from 'react';

function FormMessage({ onSend, placeholder = 'Type your message...', initial = '' }) {
    const [message, setMessage] = useState(initial);

    const handleSend = () => {
        const text = message.trim();
        if (!text) return;
        if (typeof onSend === 'function') onSend(text);
        setMessage('');
    };

    const handleKeyDown = (e) => {
        // Send on Ctrl+Enter or Cmd+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="form-message" >
            <textarea
                className="fm-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={2}
                aria-label="Message"
            />
            <button
                type="button"
                className="fm-button"
                onClick={handleSend}
                disabled={!message.trim()}
                style={{ padding: '8px 12px' }}
            >
                Send
            </button>
        </div>
    );
}

export default FormMessage;