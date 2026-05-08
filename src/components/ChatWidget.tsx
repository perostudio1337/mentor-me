'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are the official assistant for Mentor.me — a platform that connects students who have a startup idea or problem with experienced mentors in the right field of expertise.



## Your role

Help users navigate and get the most out of the Mentor.me platform. You are friendly, professional, and encouraging — like a helpful teammate, not a formal support bot.



## You help with

- Explaining how the matching system works (students describe their problem + idea, mentors list their expertise — the algorithm finds the best fit)

- Guiding new users through profile setup and onboarding

- Answering questions about the chat function, events board, and session scheduling

- Helping mentors understand what is expected of them

- Helping students articulate their problem or idea clearly



## Rules

- Always respond in the language that the user asks the question in

- Keep answers concise — 2 to 4 sentences unless the user asks for more detail

- Be warm and encouraging, especially to first-time users

- If someone asks something unrelated to Mentor.me, kindly say: "I'm here specifically to help with Mentor.me — feel free to ask me anything about the platform!"

- Never make up platform data, user statistics, or features that don't exist



## Key facts about Mentor.me

- Two user types: students (have an idea + problem) and mentors (have expertise)

- Matching is based on 70% problem context and 30% idea overlap using keyword similarity

- After matching, users can chat in real time and schedule sessions via a shared calendar

- Networking events can be posted by any user and go live immediately on the community board

- The platform enforces respectful communication — inappropriate language is not allowed

Keep answers concise and warm. If someone asks something unrelated to Mentor.me, gently redirect them. Never make up specific platform data.`;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, system: SYSTEM_PROMPT }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "Sorry, something went wrong. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
        }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-40 w-[360px] flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(124,58,237,0.15)',
          boxShadow: '0 16px 48px rgba(79,70,229,0.18), 0 2px 8px rgba(0,0,0,0.06)',
          maxHeight: '520px',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm leading-tight">Mentor.me Assistant</p>
            <p className="text-white/70 text-xs">Ask me anything about the platform</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Online" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '340px' }}>
          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Hi there! 👋</p>
              <p className="text-xs text-gray-400 mt-1">How can I help you with Mentor.me today?</p>
              <div className="mt-4 flex flex-col gap-2">
                {["How does matching work?", "How do I set up my profile?", "What are networking events?"].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-left text-xs px-3 py-2 rounded-xl border transition-all hover:border-violet-400 hover:bg-violet-50"
                    style={{ border: '1px solid rgba(124,58,237,0.2)', color: '#5b21b6', background: 'rgba(237,233,254,0.4)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', borderBottomRightRadius: '4px' }
                    : { background: 'rgba(237,233,254,0.6)', color: '#1e1b4b', borderBottomLeftRadius: '4px', border: '1px solid rgba(124,58,237,0.1)' }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center"
                style={{ background: 'rgba(237,233,254,0.6)', border: '1px solid rgba(124,58,237,0.1)' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(124,58,237,0.1)', background: 'rgba(255,255,255,0.6)' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 text-sm px-4 py-2.5 rounded-full outline-none transition-all disabled:opacity-50"
            style={{
              background: 'rgba(237,233,254,0.5)',
              border: '1px solid rgba(124,58,237,0.2)',
              color: '#1e1b4b',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            aria-label="Send message"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="none" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
