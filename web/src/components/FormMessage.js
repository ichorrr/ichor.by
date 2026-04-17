import React, { useState, useEffect, useRef } from 'react';

const EMOJIS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '⚠️', label: 'Alert' },
  { emoji: '🤔', label: 'Confused' },
  { emoji: '😂', label: 'Laugh' }
];

function FormMessage({ onSend, placeholder = 'Type your message...', initial = '' }) {
    const [message, setMessage] = useState(initial);
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [sending, setSending] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
    const [error, setError] = useState(null);
    const emojiMenuRef = useRef(null);

    const MAX_FILES = 5;
    const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB

    useEffect(() => {
        if (files.length === 0) {
            setPreviews([]);
            return;
        }
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiMenuRef.current && !emojiMenuRef.current.contains(e.target)) {
                setShowEmojis(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const API_BASE = window.location.hostname === 'localhost' && window.location.port === '1234'
        ? 'http://localhost:4000'
        : '';

    const handleSend = async () => {
        const text = (message || '').trim();
        if (!text && files.length === 0) return;
        setSending(true);
        setError(null);
        
        try {
            const fileUrls = [];
            
            // Upload all files
            if (files.length > 0) {
                for (const file of files) {
                    const form = new FormData();
                    form.append('file', file);
                    const res = await fetch(`${API_BASE}/uploadmessage`, {
                        method: 'POST',
                        body: form
                    });
                    if (!res.ok) throw new Error('Upload failed');
                    const body = await res.json();
                    fileUrls.push(body.url);
                }
            }
            
            // Send single message with all file URLs
            if (typeof onSend === 'function') {
                onSend(text || '', fileUrls.length > 0 ? fileUrls.join('|') : null);
            }

            setMessage('');
            setFiles([]);
            setPreviews([]);
        } catch (err) {
            console.error('Send error', err);
            alert('Failed to send message: ' + (err.message || ''));
        } finally {
            setSending(false);
        }
    };

    const handleFileChange = (e) => {
        const newFiles = e.target.files ? Array.from(e.target.files) : [];
        
        // Clear error
        setError(null);
        
        // Check total number of files
        if (files.length + newFiles.length > MAX_FILES) {
            setError(`Maximum ${MAX_FILES} images allowed. You have ${files.length} already.`);
            return;
        }
        
        // Calculate total size
        const currentSize = files.reduce((sum, f) => sum + f.size, 0);
        const newSize = newFiles.reduce((sum, f) => sum + f.size, 0);
        const totalSize = currentSize + newSize;
        
        if (totalSize > MAX_TOTAL_SIZE) {
            const maxMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(1);
            const currentMB = (currentSize / (1024 * 1024)).toFixed(1);
            const newMB = (newSize / (1024 * 1024)).toFixed(1);
            setError(`Total size exceeds ${maxMB}MB. Current: ${currentMB}MB, New: ${newMB}MB`);
            return;
        }
        
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const addEmoji = (emoji) => {
        setMessage(prev => prev + emoji);
        setShowEmojis(false);
    };

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const styles = {
        emojiMenu: {
            position: 'absolute',
            bottom: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 8,
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
            padding: '8px',
            display: 'flex',
            gap: '4px',
            marginBottom: 8,
            zIndex: 100
        },
        emojiButton: {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px 8px',
            borderRadius: 4,
            transition: 'all 0.2s'
        }
    };

    return (
        <div className="form-message">
            <textarea
                className="fm-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={2}
                aria-label="Message"
            />

            {error && (
                <div style={{ 
                    marginTop: 8, 
                    padding: 8, 
                    background: '#ffebee', 
                    color: '#d32f2f', 
                    borderRadius: 6,
                    fontSize: 12
                }}>
                    {error}
                </div>
            )}

            {/* File size info */}
            {files.length > 0 && (
                <div style={{ 
                    marginTop: 8, 
                    fontSize: 12, 
                    color: '#666'
                }}>
                    {files.length}/{MAX_FILES} images, {((files.reduce((sum, f) => sum + f.size, 0)) / (1024 * 1024)).toFixed(1)}/{(MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0)} MB
                </div>
            )}

            {/* Image previews */}
            {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {previews.map((preview, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                            <img
                                src={preview}
                                alt={`preview-${idx}`}
                                style={{
                                    width: 56,
                                    height: 56,
                                    objectFit: 'cover',
                                    borderRadius: 6
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                style={{
                                    position: 'absolute',
                                    top: -6,
                                    right: -6,
                                    background: '#d32f2f',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px'
                                }}
                                title="Remove image"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <label style={{ cursor: 'pointer' }}>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <span style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}>
                        📎 Attach
                    </span>
                </label>

                {/* Emoji button */}
                <div style={{ position: 'relative' }} ref={emojiMenuRef}>
                    <button
                        type="button"
                        onClick={() => setShowEmojis(!showEmojis)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #ddd',
                            padding: '6px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                        title="Add emoji"
                    >
                        😊
                    </button>

                    {showEmojis && (
                        <div style={styles.emojiMenu}>
                            {EMOJIS.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    style={styles.emojiButton}
                                    onClick={() => addEmoji(item.emoji)}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    title={item.label}
                                >
                                    {item.emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="fm-button"
                    onClick={handleSend}
                    disabled={sending || (!message.trim() && files.length === 0)}
                    style={{ padding: '8px 12px', marginLeft: 'auto' }}
                >
                    {sending ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}

export default FormMessage;