import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { chatWithHealthu } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const HealthuOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Healthu, your MedVault companion. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await chatWithHealthu(userMessage, history);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1002] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-blue-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold">Healthu AI</h3>
                  <p className="text-[10px] text-blue-100">AI Health Companion</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Warning */}
            <div className="flex items-center gap-2 bg-amber-50 p-2 text-[10px] text-amber-700">
               <AlertCircle size={12} className="shrink-0" />
               <span>Experimental AI: For information only, not medical advice.</span>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
            >
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex",
                    m.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
                    m.role === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white text-gray-800 ring-1 ring-gray-100 rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl p-3 text-sm bg-white ring-1 ring-gray-100 rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-gray-100 p-4 bg-white">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask Healthu anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 py-3 pl-4 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-opacity disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 transition-transform active:scale-90"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default HealthuOverlay;
