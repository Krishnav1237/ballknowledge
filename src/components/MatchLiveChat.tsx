'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Flame, MessageCircle, AlertCircle } from 'lucide-react';

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

// Format time
function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MatchLiveChat({
  matchId,
  isLive,
  isCompleted,
  managerAlias,
}: MatchLiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const alias = managerAlias || 'Anonymous';
  // Chat is ONLY read-only when the match hasn't started yet (upcoming)
  // Completed and Live matches should allow full banter/roasting
  const isReadOnly = !isLive && !isCompleted;

  // Fetch messages from database endpoint
  const fetchChatMessages = useCallback(async () => {
    if (!matchId || matchId === 'undefined' || matchId === 'null') return;
    try {
      const res = await fetch(`/api/chat/${matchId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch chat messages from DB:', e);
    }
  }, [matchId]);

  // Poll chat messages: LIVE = every 3s, COMPLETED = every 15s, UPCOMING = every 60s
  useEffect(() => {
    fetchChatMessages();
    const intervalTime = isLive ? 3000 : isCompleted ? 15000 : 60000;
    const interval = setInterval(fetchChatMessages, intervalTime);
    return () => clearInterval(interval);
  }, [fetchChatMessages, isLive, isCompleted]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;
    if (!matchId || matchId === 'undefined' || matchId === 'null') return;
    setSending(true);

    const trimmedText = text.trim();
    const tempId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const newLocalMsg: ChatMessage = {
      id: tempId,
      matchId,
      author: alias,
      text: trimmedText,
      timestamp: Date.now(),
      reactions: {},
      type: 'message'
    };

    // Update UI state immediately (optimistic UI pattern)
    setMessages(prev => [...prev, newLocalMsg]);
    setInput('');
    setSendError(null);

    try {
      const res = await fetch(`/api/chat/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmedText
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.message) {
          // Replace temporary message with official database record
          setMessages(prev => prev.map(m => m.id === tempId ? data.message : m));
        }
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setSendError(res.status === 401 ? 'Sign in to post in live chat.' : 'Message was not saved. Please try again.');
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setSendError('Chat is temporarily unavailable. Please try again.');
      console.warn('Failed to post message to chat DB:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [matchId, alias, sending]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!matchId || matchId === 'undefined' || matchId === 'null') return;
    if (messageId.startsWith('local_')) {
      setSendError('Wait for the message to save before reacting.');
      return;
    }
    let previousMessages: ChatMessage[] = [];
    setMessages(prev => {
      previousMessages = prev;
      return prev.map(m => {
      if (m.id !== messageId) return m;
      const reactions = { ...m.reactions };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...m, reactions };
      });
    });

    try {
      const res = await fetch(`/api/chat/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'react',
          messageId,
          emoji
        })
      });
      if (!res.ok) {
        setMessages(previousMessages);
        setSendError(res.status === 401 ? 'Sign in to react in live chat.' : 'Reaction was not saved.');
      }
    } catch (err) {
      setMessages(previousMessages);
      setSendError('Reaction was not saved.');
      console.warn('Failed to post reaction to chat DB:', err);
    }
  }, [matchId]);


  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0B0F19] text-white">
      {/* Chat header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#111827]/85">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#E11D48] animate-pulse' : 'bg-zinc-500'}`} />
          <span className="text-[9px] font-black uppercase tracking-widest text-white">
            {isLive ? 'LIVE BANTER & ROAST ZONE 🔥' : isCompleted ? 'POST-MATCH ROAST ZONE 🗣️' : 'ROAST & BANTER ZONE 💬'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <MessageCircle className="w-3 h-3 text-zinc-400" />
          <span className="text-[8px] font-mono">{messages.filter(m => m.type === 'message').length} msgs</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0 bg-[#0B0F19]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Flame className="w-8 h-8 text-[#E11D48]/30 mb-2" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {isReadOnly ? 'Chat available once match is confirmed live.' : 'Be the first to drop a hot take! 🔥'}
            </p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.author === alias;
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[9px] font-semibold text-[#E11D48] bg-[#E11D48]/5 border border-[#E11D48]/10 px-3 py-1 rounded-full text-center max-w-[90%]">
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
                  isMe ? 'bg-[#E11D48] text-white' : 'bg-[#1b2030] text-gray-300 border border-white/10'
                }`}>
                  {msg.author.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-wide">{isMe ? 'You' : msg.author}</span>
                <span className="text-[7px] font-mono text-gray-600">{formatTime(msg.timestamp)}</span>
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed font-medium ${
                  isMe
                    ? 'bg-[#E11D48]/15 border border-[#E11D48]/20 text-white rounded-tr-sm'
                    : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-sm'
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
                {/* Quick reaction row — always visible, compact tap targets */}
                <div className="flex gap-0.5 overflow-x-auto scrollbar-none mt-0.5">
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(msg.id, emoji)}
                      className="shrink-0 w-5 h-5 rounded-full hover:bg-white/15 active:bg-white/20 flex items-center justify-center text-[9px] transition-colors cursor-pointer"
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
        <div className="shrink-0 border-t border-white/5 p-2 bg-[#111827]/70">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {BANTER_BUTTONS.map(btn => (
              <button
                key={btn.label}
                onClick={() => sendMessage(btn.text)}
                className="shrink-0 text-[8px] font-black uppercase tracking-wider text-[#E11D48] bg-[#E11D48]/5 border border-[#E11D48]/15 hover:border-[#E11D48]/40 hover:bg-[#E11D48]/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap"
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
              placeholder={isReadOnly ? 'Chat unlocks when match is LIVE' : 'Roast opponent or drop a hot take... 🔥'}
              disabled={isReadOnly}
              maxLength={280}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-[#E11D48] disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isReadOnly}
              className="shrink-0 w-9 h-9 rounded-xl bg-[#E11D48] hover:bg-rose-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[7px] font-mono text-gray-500 mt-1">Chatting as <span className="text-[#E11D48] font-bold">{alias}</span> · {input.length}/280</p>
          {sendError && (
            <p className="text-[8px] font-semibold text-amber-300 mt-1">{sendError}</p>
          )}
        </div>
      )}

      {isReadOnly && (
        <div className="shrink-0 border-t border-white/5 p-3 bg-[#111827]/70">
          <div className="flex items-center gap-2 text-[9px] text-gray-400 font-semibold">
            <AlertCircle className="w-3 h-3" />
            Chat unlocks when this match goes LIVE.
          </div>
        </div>
      )}
    </div>
  );
}
