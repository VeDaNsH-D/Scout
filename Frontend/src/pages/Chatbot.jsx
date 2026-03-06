import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import chatbotService from '../services/chatbotService';

export default function Chatbot() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hey! I\'m your Scout AI assistant powered by Llama 3. Ask me anything about your leads, campaigns, or workflows.'
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg = { role: 'user', content: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const data = await chatbotService.sendMessage(trimmed);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.answer,
                    context: data.contextUsed,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, something went wrong. Please try again.',
                    error: true,
                },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-border-subtle mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-text-primary">AI Chatbot</h1>
                    <p className="text-xs text-text-muted">Powered by Llama 3 &middot; RAG-enabled</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-text-muted">Online</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-accent text-white rounded-br-md'
                                    : msg.error
                                        ? 'bg-red-500/10 border border-red-500/30 text-red-400 rounded-bl-md'
                                        : 'bg-bg-card border border-border-card text-text-primary rounded-bl-md'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                {/* Context pill */}
                                {msg.context && msg.context.length > 0 && (
                                    <ContextBadge docs={msg.context} />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-bg-card border border-border-card rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" />
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="pt-4 border-t border-border-subtle mt-2">
                <div className="flex items-end gap-3 bg-bg-card border border-border-card rounded-2xl px-4 py-3 focus-within:border-accent/50 transition">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about your leads, campaigns..."
                        rows={1}
                        className="flex-1 bg-transparent text-text-primary text-sm placeholder-text-muted resize-none outline-none max-h-32"
                        style={{ minHeight: '24px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="p-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition text-white flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <p className="text-[10px] text-text-muted text-center mt-2">
                    Llama 3 may produce inaccurate information. Verify critical data independently.
                </p>
            </div>
        </div>
    );
}

/* Collapsible context badge */
function ContextBadge({ docs }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mt-2">
            <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] text-accent hover:text-accent-hover flex items-center gap-1 transition"
            >
                <svg
                    className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {docs.length} source{docs.length !== 1 ? 's' : ''} used
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1.5 space-y-1">
                            {docs.map((doc, i) => (
                                <p
                                    key={i}
                                    className="text-[11px] text-text-muted bg-bg-secondary/50 rounded-lg px-3 py-1.5 line-clamp-2"
                                >
                                    {doc}
                                </p>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
