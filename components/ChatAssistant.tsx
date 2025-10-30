
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Fix: remove .ts extension from module imports
import type { ChatMessage } from '../types';
import { sendMessageStream } from '../services/geminiService';
import { Spinner } from './Spinner';

interface ChatAssistantProps {
    isChatOpen: boolean;
    setIsChatOpen: (isOpen: boolean) => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ isChatOpen, setIsChatOpen }) => {
    const [history, setHistory] = useState<ChatMessage[]>([
        { role: 'model', parts: [{ text: "أهلاً بيك! أنا سارة، إزاي أقدر أساعدك النهاردة؟"}]}
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);
    
     useEffect(() => {
        if (isChatOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isChatOpen]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setHistory(prev => [...prev, userMessage, { role: 'model', parts: [{ text: '' }] }]);
        
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const stream = await sendMessageStream(currentInput);
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                 setHistory(prev => {
                    const newHistory = [...prev];
                    const lastMessage = newHistory[newHistory.length - 1];
                    if (lastMessage.role === 'model') {
                        lastMessage.parts[0].text += chunkText;
                    }
                    return newHistory;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
             setHistory(prev => {
                 const newHistory = [...prev];
                 const lastMessage = newHistory[newHistory.length - 1];
                 if (lastMessage.role === 'model') {
                    lastMessage.parts[0].text = "آسفة، حصلت مشكلة. ممكن تجرب تاني؟";
                 }
                 return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading]);
    
    return (
        <>
            <button 
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-24 right-4 w-16 h-16 bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-text-on-primary))] rounded-full shadow-2xl flex items-center justify-center text-3xl z-40 transition-transform hover:scale-110"
                aria-label="افتح المساعد الذكي"
            >
                🤖
            </button>
            {isChatOpen && (
                 <div className="fixed inset-0 bg-black/50 z-50 fade-in" onClick={() => setIsChatOpen(false)}>
                    <div 
                        className="fixed bottom-4 right-4 left-4 md:left-auto md:w-full md:max-w-sm h-[70vh] flex flex-col bg-[rgb(var(--color-surface))] rounded-2xl shadow-2xl slide-in-bottom"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-4 border-b border-[rgb(var(--color-border))] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))]">المساعد الذكي سارة</h2>
                             <button onClick={() => setIsChatOpen(false)} className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]">&times;</button>
                        </header>
                        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin">
                            {history.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && <div className="w-7 h-7 rounded-full bg-[rgb(var(--color-secondary))] text-sm flex items-center justify-center flex-shrink-0">🤖</div>}
                                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-br-none' : 'bg-[rgb(var(--color-surface-soft))] rounded-bl-none'}`}>
                                       {msg.parts[0].text || <Spinner />}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-[rgb(var(--color-border))]">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="اسأل سارة أي حاجة..."
                                    className="flex-grow bg-[rgb(var(--color-surface-soft))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-[rgb(var(--color-primary))] focus:outline-none"
                                    disabled={isLoading}
                                />
                                <button type="submit" disabled={isLoading || !input.trim()} className="w-10 h-10 flex-shrink-0 text-white bg-[rgb(var(--color-primary))] hover:opacity-90 font-bold rounded-full flex items-center justify-center transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                    ↑
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
