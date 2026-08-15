/** Chat list payload used by GET /api/chat/:matchId. Always returns a messages array. */

export type ChatListMessage = {
  id: string;
  matchId: string;
  author: string;
  text: string;
  timestamp: number;
  reactions: Record<string, number>;
  type: 'message';
};

export type ChatListBody = {
  success: true;
  messages: ChatListMessage[];
  degraded?: true;
};

const BANTER_COOLDOWN_MS = 5 * 60 * 1000;

export function shouldInjectBanter(messageCount: number, lastMessageAgeMs: number): boolean {
  return messageCount === 0 || (messageCount < 50 && lastMessageAgeMs > BANTER_COOLDOWN_MS);
}

export function serializeChatMessages(messages: Array<{
  id: string;
  matchId: string;
  text: string;
  createdAt: Date | string | number;
  reactions?: unknown;
  profile?: { username?: string | null } | null;
  author?: string;
}>): ChatListMessage[] {
  return messages.map((message) => ({
    id: message.id,
    matchId: message.matchId,
    author: message.profile?.username || message.author || 'Anonymous',
    text: message.text,
    timestamp: new Date(message.createdAt).getTime(),
    reactions: (message.reactions as Record<string, number>) || {},
    type: 'message',
  }));
}

export function chatListSuccess(messages: ChatListMessage[]): ChatListBody {
  return { success: true, messages };
}

export function chatListDegraded(): ChatListBody {
  return { success: true, degraded: true, messages: [] };
}

export async function chatListOrDegraded(
  load: () => Promise<ChatListMessage[]>,
): Promise<ChatListBody> {
  try {
    return chatListSuccess(await load());
  } catch {
    return chatListDegraded();
  }
}
