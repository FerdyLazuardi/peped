import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu } from 'lucide-react';
import Message from './Message';

export default function ChatArea({ isOpen, toggleSidebar }) {
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Haii A-Team! **Peped** is here to save your day! 💅✨\n\nLagi pusing sama modul Amarthapedia atau ada materi yang bikin *stuck*? Santai, spill aja pertanyaannya di bawah, kita beresin bareng-bareng!\n\nWhat’s on your mind today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const inputContainerRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Handle textarea resize
    const handleInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userText = input.trim();
        setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        setIsTyping(true);

        try {
            const res = await fetch("https://dip-utility-effect-copying.trycloudflare.com/webhook/peped-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: userText, sessionId: "user-demo-web" })
            });

            const data = await res.json();
            const reply = data?.data?.reply || data?.output || "Maaf, aku sedang tidak konek ke server.";

            setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
        } catch (error) {
            setMessages((prev) => [...prev, { sender: 'ai', text: "⚠️ Gagal terhubung ke server." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="main-content">
            <div className="top-bar">
                {!isOpen && (
                    <button className="hamburger-btn" onClick={toggleSidebar} title="Open sidebar">
                        <Menu size={24} />
                    </button>
                )}
                <span className="app-title">Peped AI</span>
            </div>

            <div className="chat-container">
                {messages.map((msg, idx) => (
                    <Message key={idx} text={msg.text} sender={msg.sender} />
                ))}

                {isTyping && (
                    <div className="message-wrapper ai">
                        <div className="avatar ai">
                            <span style={{ fontSize: '10px' }}>AI</span>
                        </div>
                        <div className="typing-indicator" style={{ paddingLeft: '15px' }}>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="input-container" ref={inputContainerRef}>
                <div className="input-box">
                    <textarea
                        ref={textareaRef}
                        rows="1"
                        placeholder="Message Peped AI..."
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        title="Send Message"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Kalo bingung tinggal Pepedin aja!
                </div>
            </div>
        </div >
    );
}
