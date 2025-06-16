import { Message } from '../../models/message.model';

// Typing user interface
export interface TypingUser {
  userId: string;
  timestamp: number;
  conversationId?: string; // Optional: for conversation-specific typing
}

// State interface
export interface MessageState {
  entities: { [id: string]: Message };
  ids: string[];
  loading: boolean;
  error: string | null;
  typingUsers: TypingUser[];
  onlineUsers: string[];
}

export const initialMessageState: MessageState = {
  entities: {},
  ids: [],
  loading: false,
  error: null,
  typingUsers: [],
  onlineUsers: []
};
