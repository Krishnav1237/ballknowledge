'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Flame, MessageCircle, Zap, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  matchId: string;
  author: string;
  text: string;
  timestamp: number;
  reactions: Record<string, number>; // emoji → count
  type: 'message' | 'system';
}

interface MatchLiveChatProps {
  matchId: string;
  isLive: boolean;
  isCompleted: boolean;
  homeTeam: string;
  awayTeam: string;
  managerAlias?: string;
}

const BANTER_BUTTONS = [
  { label: 'VAR robbery 🤬', text: 'That is a VAR robbery! Absolutely disgraceful decision 🤬' },
  { label: 'Offside 😤', text: 'That was SO offside, are the VAR officials blind?! 😤' },
  { label: 'Ref blind? 🙈', text: 'This referee is absolutely clueless, how is that not a red card?! 🙈' },
  { label: 'GOAT play ⚽', text: 'What a moment of PURE genius, absolute GOAT behaviour ⚽🐐' },
  { label: 'Get in!! 🎉', text: 'YESSSSS GET IN THERE!! What a goal!! 🎉🔥' },
  { label: 'Unlucky 😬', text: 'Oh no, so unlucky... that hit the post! 😬' },
  { label: 'Park the bus 🚌', text: "Are you seeing this? They're parking the bus and calling it tactics 🚌😂" },
  { label: 'Simulation 🎭', text: 'Absolute simulation, that dive deserves an Oscar 🎭😂' },
];

const REACTIONS = ['🔥', '🤣', '😤', '👀', '💀', '🐐'];

function getStoredMessages(matchId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`bk_chat_${matchId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(matchId: string, messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    // Keep last 200 messages
    const trimmed = messages.slice(-200);
    localStorage.setItem(`bk_chat_${matchId}`, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export default function MatchLiveChat({
  matchId,
  isLive,
  isCompleted,
  homeTeam,
  awayTeam,
  managerAlias,
}: MatchLiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const alias = managerAlias || 'Anonymous';

  // Load messages on mount
  useEffect(() => {
    const msgs = getStoredMessages(matchId);
    setMessages(msgs);

    // Add system message if empty + match is live
    if (msgs.length === 0 && isLive) {
      const systemMsg: ChatMessage = {
        id: generateId(),
        matchId,
        author: 'SYSTEM',
        text: `⚽ ${homeTeam} vs ${awayTeam} is LIVE! The banter zone is open. Predictions are locked.`,
        timestamp: Date.now(),
        reactions: {},
        type: 'system',
      };
      setMessages([systemMsg]);
      saveMessages(matchId, [systemMsg]);
    }
  }, [matchId, isLive, homeTeam, awayTeam]);

  // Poll for new messages every 3 seconds (simulates real-time)
  useEffect(() => {
    const interval = setInterval(() => {
      const latest = getStoredMessages(matchId);
      setMessages(prev => {
        if (latest.length !== prev.length) return latest;
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);

    const msg: ChatMessage = {
      id: generateId(),
      matchId,
      author: alias,
      text: text.trim(),
      timestamp: Date.now(),
      reactions: {},
      type: 'message',
    };

    setMessages(prev => {
      const updated = [...prev, msg];
      saveMessages(matchId, updated);
      return updated;
    });

    setInput('');
    setSending(false);
    inputRef.current?.focus();
  }, [matchId, alias, sending]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.id !== messageId) return m;
        const reactions = { ...m.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...m, reactions };
      });
      saveMessages(matchId, updated);
      return updated;
    });
  }, [matchId]);

  const isReadOnly = isCompleted && !isLive;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-[9px] font-black uppercase tracking-widest text-white">
            {isLive ? 'LIVE BANTER ZONE' : isCompleted ? 'MATCH CHAT LOG' : 'BANTER ZONE'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-3 h-3 text-gray-500" />
          <span className="text-[8px] font-mono text-gray-500">{messages.filter(m => m.type === 'message').length} msgs</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Flame className="w-8 h-8 text-amber-500/30 mb-2" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
              {isLive ? 'Be the first to drop a hot take!' : 'Chat opens when match goes LIVE'}
            </p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.author === alias;
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[9px] font-semibold text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
              {/* Author + time */}
              <div className={`flex items-center gap-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar circle */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${
                  isMe ? 'bg-amber-500 text-black' : 'bg-[#1b2030] text-gray-300 border border-white/10'
                }`}>
                  {msg.author.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-wide">{isMe ? 'You' : msg.author}</span>
                <span className="text-[7px] font-mono text-gray-700">{formatTime(msg.timestamp)}</span>
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed font-medium ${
                  isMe
                    ? 'bg-amber-500/15 border border-amber-500/20 text-white rounded-tr-sm'
                    : 'bg-[#0d1321] border border-white/5 text-gray-200 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>

              {/* Reactions */}
              <div className={`flex gap-1 flex-wrap ${isMe ? 'justify-end' : ''}`}>
                {Object.entries(msg.reactions).filter(([, c]) => c > 0).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(msg.id, emoji)}
                    className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-full px-1.5 py-0.5 text-[9px] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span>{emoji}</span>
                    <span className="text-gray-400 font-mono">{count}</span>
                  </button>
                ))}
                {/* Quick reaction row */}
                <div className="flex gap-0.5 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(msg.id, emoji)}
                      className="w-4 h-4 rounded-full hover:bg-white/10 flex items-center justify-center text-[8px] transition-colors cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick banter buttons */}
      {!isReadOnly && (
        <div className="shrink-0 border-t border-white/5 p-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {BANTER_BUTTONS.map(btn => (
              <button
                key={btn.label}
                onClick={() => sendMessage(btn.text)}
                className="shrink-0 text-[8px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/5 border border-amber-500/15 hover:border-amber-500/40 hover:bg-amber-500/10 px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex gap-2 mt-1.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
              placeholder={isLive ? 'Drop your hot take...' : isCompleted ? 'Match ended — chat is read-only' : 'Chat opens at kick-off'}
              disabled={!isLive}
              maxLength={280}
              className="flex-1 bg-[#0d1321] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || !isLive}
              className="shrink-0 w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
          <p className="text-[7px] font-mono text-gray-700 mt-1">Chatting as <span className="text-amber-600">{alias}</span> · {input.length}/280</p>
        </div>
      )}

      {isReadOnly && (
        <div className="shrink-0 border-t border-white/5 p-3">
          <div className="flex items-center gap-2 text-[9px] text-gray-600 font-semibold">
            <AlertCircle className="w-3 h-3" />
            Match ended — chat is now read-only.
          </div>
        </div>
      )}
    </div>
  );
}
