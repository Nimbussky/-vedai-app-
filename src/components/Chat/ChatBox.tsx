"use client";
import React, { useState, useRef, useEffect } from 'react';

export type Message = {
  id: number;
  text: string;
  sender: 'AI' | 'User';
  timestamp: string;
};

const STORAGE_KEY = 'vedai_chat_history';

const MessageItem: React.FC<{ message: Message }> = ({ message }) => (
  <div className={`p-3 rounded-lg max-w-[80%] ${message.sender === 'User' ? 'bg-[#3B5BDB] self-end text-white' : 'bg-[#1A2338] border border-[#F7F7F5]/10 self-start text-[#F7F7F5]'}`}>
    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
    <span className="text-xs opacity-40 mt-1 block">{message.timestamp}</span>
  </div>
);

const ChatBox: React.FC<{ initialMessages?: Message[] }> = ({ initialMessages = [] }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chartData, setChartData] = useState<Array<Record<string, unknown>> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load chat history
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch {}
      }

      // Load chart data
      const storedChart = localStorage.getItem('vedai_user_chart');
      if (storedChart) {
        try {
          const parsed = JSON.parse(storedChart);
          const planets = parsed && Array.isArray(parsed.planets) ? parsed.planets : (Array.isArray(parsed) ? parsed : null);
          setChartData(planets || parsed);
        } catch (e) {
          console.error("Error parsing chart data", e);
        }
      } else {
        setMessages((prev) => {
          if (prev.length > 0) return prev;
          return [{
            id: Date.now(),
            text: "Namaste! I noticed you haven't saved your birth chart yet. I can answer general astrology questions, but for personalized readings, please add your birth details on the Dashboard!",
            sender: 'AI',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
          }];
        });
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = inputValue.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = {
      id: Date.now(),
      text,
      sender: 'User',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };

    const aiPlaceholder: Message = {
      id: Date.now() + 1,
      text: '',
      sender: 'AI',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setInputValue('');
    setIsStreaming(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, chartData }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiText += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: aiText,
            };
            return updated;
          });
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: 'Sorry, I encountered an error. Please try again.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  function clearHistory() {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="flex flex-col h-full bg-[#0B1120]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center px-4">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#3B5BDB]/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#3B5BDB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-[#F7F7F5]/50 text-sm">Ask me anything about Vedic astrology, your birth chart, or planetary transits.</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        {isStreaming && messages.length > 0 && messages[messages.length - 1].text === '' && (
          <div className="self-start flex items-center gap-1 px-4 py-2">
            <div className="w-2 h-2 bg-[#3B5BDB] rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-[#3B5BDB] rounded-full animate-pulse [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-[#3B5BDB] rounded-full animate-pulse [animation-delay:0.4s]" />
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[#F7F7F5]/10">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <button onClick={clearHistory} className="text-xs text-[#F7F7F5]/30 hover:text-[#F7F7F5]/50 transition-colors">
              Clear chat history
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your Vedic guide..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 rounded-xl text-[#F7F7F5] placeholder-[#F7F7F5]/30 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-[#1A2338] border border-[#F7F7F5]/10 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !inputValue.trim()}
            className="px-4 py-3 rounded-xl bg-[#3B5BDB] text-white font-medium hover:bg-[#3B5BDB]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
