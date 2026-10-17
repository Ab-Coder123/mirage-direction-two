'use client';

import * as React from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{ text: string; fromUser: boolean }[]>([
    {
      text: 'Hello! Welcome to Mirage Pharma. How can our medical specialists assist you today?',
      fromUser: false,
    },
  ]);
  const [inputValue, setInputValue] = React.useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setMessages((prev) => [...prev, { text: userText, fromUser: true }]);
    setInputValue('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Thank you for reaching out! A clinical pharmacist will review your question shortly. You can also call us directly at 01070786720.',
          fromUser: false,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Chat Drawer */}
      {open && (
        <div className="mb-4 w-80 sm:w-96 rounded-2xl bg-white border border-brand-border-subtle shadow-2xl overflow-hidden flex flex-col h-[420px] animate-in fade-in-50 slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-navy to-brand-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-brand-cyan-light" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm">Medical Support</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Clinical Team Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.fromUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    msg.fromUser
                      ? 'bg-brand-primary text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about dosage, ingredients..."
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-100 border-none outline-none focus:ring-1 focus:ring-brand-primary text-slate-800"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Bubble in Mirage Brand Colors */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open Medical Live Chat"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-navy hover:to-brand-primary text-white shadow-hud-glow hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer border-2 border-white/80"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};
