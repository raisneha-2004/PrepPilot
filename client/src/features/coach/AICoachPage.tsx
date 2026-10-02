import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  User,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { coachApi } from '../../lib/api/client';
import { useAppStore } from '../../store/useAppStore';
import { useSpeech } from '../../hooks/useSpeech';
import { toast } from 'sonner';

const SUGGESTIONS = [
  "Explain binary search like I'm a beginner with visual intuition",
  "Bhai dynamic programming me memoization vs tabulation kab use karein?",
  "Give me 5 high-frequency array problems asked at Amazon",
  "How does the browser event loop handle microtasks vs macrotasks?"
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const AICoachPage: React.FC = () => {
  const { profile } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **PrepPilot AI Coach**. I'm tuned to help you master Data Structures, Algorithms, CS fundamentals, and crack your technical placement interviews for **${profile.targetRole || 'SDE'}** roles.\n\nYou can ask me questions in **English, Hindi, or Hinglish**! What shall we tackle today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, isSupported, startListening, stopListening, speak, stopSpeaking, isSpeaking } = useSpeech();

  const { data: historyData } = useQuery({
    queryKey: ['coachHistory'],
    queryFn: coachApi.getHistory,
    staleTime: 60000
  });

  useEffect(() => {
    if (historyData?.history && historyData.history.length > 0) {
      setMessages(historyData.history);
    }
  }, [historyData]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isStreaming) return;

    if (isListening) stopListening();
    setInput('');

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    const assistantPlaceholder: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setIsStreaming(true);

    try {
      let accumulated = '';
      await coachApi.sendMessage(messageText, (chunk) => {
        accumulated += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
          }
          return updated;
        });
      });
    } catch (err: any) {
      toast.error('AI streaming interrupted. Showing offline mentor guidance.');
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: 'Bilkul! For this concept, remember that identifying the invariant constraint and time complexity boundaries is key. Try breaking down the problem into smaller sub-problems first.'
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col glass-panel overflow-hidden border border-subtle">
      {/* Chat Header */}
      <div className="p-4 border-b border-subtle bg-surface/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-main">AI Placement Coach</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-muted">
              Role: {profile.targetRole || 'SDE'} • Multilingual (EN/HI/Hinglish)
            </span>
          </div>
        </div>

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold animate-pulse"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute Voice</span>
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md shadow-indigo-500/10'
                    : 'glass-card border border-subtle text-main rounded-tl-none'
                }`}
              >
                <div className="prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {!isUser && msg.content && (
                  <div className="flex items-center gap-2 pt-2 border-t border-subtle/50 text-[10px] text-muted">
                    <button
                      onClick={() => copyToClipboard(msg.content, idx)}
                      className="hover:text-main transition-colors flex items-center gap-1"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => speak(msg.content)}
                      className="hover:text-main transition-colors flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Read aloud</span>
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-subtle bg-surface-subtle/40">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="chip-tag text-[10px] hover:border-indigo-400 hover:text-main transition-colors"
            >
              💬 {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-subtle bg-surface/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-surface-subtle border-subtle text-muted hover:text-main'
              }`}
              title={isListening ? 'Stop listening' : 'Speak message'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a technical concept, DSA logic, or placement question..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs text-main placeholder:text-muted outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="btn-primary text-xs px-4 py-2.5 disabled:opacity-40"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
