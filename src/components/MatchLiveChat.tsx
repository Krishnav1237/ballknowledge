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

const SIMULATED_MANAGERS = [
  'TacticalMaster',
  'VARTribunal',
  'PepFanatic',
  'ElSocio',
  'Capitano',
  'Gegenpresser',
  'FalseNine',
  'JoseParkedBus',
  'SpecialOne',
  'AncelottiEyebrow',
  'KloppHugging',
  'ParkTheDoubleBus'
];

const SIMULATED_BANTER = [
  'Ref is absolute garbage today 🤬',
  'What a goal! World class finish 🚀⚽',
  'VAR checking... please don\'t ruin this 🙏',
  'Offside by a millimeter, game is gone 😤',
  'PARK THE BUS TACTICS IS REAL FOOTBALL 🚌',
  'Absolute dive, give him a yellow card 🎭',
  'How did he miss that open goal?! 💀',
  'Tactical masterclass from the home side today.',
  'We need substitutions immediately, the midfield is ghosting 👻',
  'What a pass! Absolute vision 👁️',
  'Is it just me or is this match of the tournament? 🔥',
  'This is why we love the World Cup 🏆🐐',
  'Defending is non-existent, love to see it 😂',
  'VAR is saving them again, unbelievable 🙄'
];

/**
 * Retrieves cached chat messages for a specific match from local storage.
 * 
 * @param {string} matchId - The unique match ID.
 * @returns {ChatMessage[]} Array of cached messages.
 */
function getStoredMessages(matchId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`bk_chat_${matchId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves chat messages back to local storage.
 * Caps the messages at the latest 200 items to prevent bloating the local storage quota.
 * 
 * @param {string} matchId - The unique match ID.
 * @param {ChatMessage[]} messages - Array of chat messages.
 */
function saveMessages(matchId: string, messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    // Keep last 200 messages to respect browser storage limits
    const trimmed = messages.slice(-200);
    localStorage.setItem(`bk_chat_${matchId}`, JSON.stringify(trimmed));
  } catch { /* ignore local storage full errors */ }
}


// Format time
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

  // Load messages on mount with initial seeded banter
  useEffect(() => {
    let msgs = getStoredMessages(matchId);
    if (msgs.length === 0) {
      const systemMsg: ChatMessage = {
        id: generateId(),
        matchId,
        author: 'SYSTEM',
        text: isLive
          ? `⚽ ${homeTeam} vs ${awayTeam} is LIVE! The banter zone is open. Predictions are locked.`
          : `⚽ ${homeTeam} vs ${awayTeam} chat log.`,
        timestamp: Date.now() - 3600000,
        reactions: {},
        type: 'system',
      };

      const seedCount = isLive ? 3 : 8;
      const seedMsgs: ChatMessage[] = [systemMsg];

      for (let i = 0; i < seedCount; i++) {
        const randomManager = SIMULATED_MANAGERS[Math.floor(Math.random() * SIMULATED_MANAGERS.length)];
        const randomText = SIMULATED_BANTER[Math.floor(Math.random() * SIMULATED_BANTER.length)];
        const reactionEmoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];

        seedMsgs.push({
          id: generateId(),
          matchId,
          author: randomManager,
          text: randomText,
          timestamp: Date.now() - (seedCount - i) * 300000,
          reactions: Math.random() > 0.4 ? { [reactionEmoji]: Math.floor(Math.random() * 5) + 1 } : {},
          type: 'message',
        });
      }

      msgs = seedMsgs;
      saveMessages(matchId, msgs);
    }
    setMessages(msgs);
  }, [matchId, isLive, homeTeam, awayTeam]);

  // Poll for new messages every 3 seconds to pick up chat changes from other tabs or mock sources
  useEffect(() => {
    const interval = setInterval(() => {
      const latest = getStoredMessages(matchId);
      setMessages(prev => {
        // Only trigger react state update if message count changes
        if (latest.length !== prev.length) return latest;
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  // Simulates other live managers joining the banter room in real-time during live matches
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // 35% chance to post a message every 10 seconds to create active tournament feel
      if (Math.random() > 0.35) return;

      const randomManager = SIMULATED_MANAGERS[Math.floor(Math.random() * SIMULATED_MANAGERS.length)];
      const randomText = SIMULATED_BANTER[Math.floor(Math.random() * SIMULATED_BANTER.length)];
      const reactionEmoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];

      const msg: ChatMessage = {
        id: generateId(),
        matchId,
        author: randomManager,
        text: randomText,
        timestamp: Date.now(),
        reactions: Math.random() > 0.6 ? { [reactionEmoji]: 1 } : {},
        type: 'message',
      };

      setMessages(prev => {
        // Prevent inserting identical duplicate messages
        if (prev.some(m => m.text === msg.text && m.author === msg.author)) return prev;
        const updated = [...prev, msg];
        saveMessages(matchId, updated);
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [matchId, isLive]);

  // Auto-scroll to bottom
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
    <div className="flex flex-col h-full overflow-hidden bg-[#0B0F19] text-white">
      {/* Chat header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#111827]/85">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#E11D48] animate-pulse' : 'bg-zinc-500'}`} />
          <span className="text-[9px] font-black uppercase tracking-widest text-white">
            {isLive ? 'LIVE BANTER ZONE' : isCompleted ? 'MATCH CHAT LOG' : 'BANTER ZONE'}
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
                {/* Quick reaction row */}
                <div className="flex gap-0.5 opacity-0 hover:opacity-100 transition-opacity">
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
              placeholder={isLive ? 'Drop your hot take...' : isCompleted ? 'Match ended — chat is read-only' : 'Chat opens at kick-off'}
              disabled={!isLive}
              maxLength={280}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-[#E11D48] disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || !isLive}
              className="shrink-0 w-9 h-9 rounded-xl bg-[#E11D48] hover:bg-rose-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[7px] font-mono text-gray-500 mt-1">Chatting as <span className="text-[#E11D48] font-bold">{alias}</span> · {input.length}/280</p>
        </div>
      )}

      {isReadOnly && (
        <div className="shrink-0 border-t border-white/5 p-3 bg-[#111827]/70">
          <div className="flex items-center gap-2 text-[9px] text-gray-400 font-semibold">
            <AlertCircle className="w-3 h-3" />
            Match ended — chat is now read-only.
          </div>
        </div>
      )}
    </div>
  );
}
