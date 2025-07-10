import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Conversation } from '../../../shared/enums/models/conversation.model';

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface TypingUser {
  userId: string;
  timestamp: number;
  conversationId?: string;
}

export interface ConversationState extends EntityState<Conversation> {
  selectedConversationId: string | null;
  loading: boolean;
  error: string | null;

  users: User[];
  usersLoading: boolean;
  usersError: string | null;

  typingUsers: TypingUser[];
  onlineUsers: string[];

  page: number;
  total: number;
  totalPages: number;
}

export const conversationAdapter: EntityAdapter<Conversation> =
  createEntityAdapter<Conversation>({
    selectId: (entity) => entity._id!
  });

export const initialConversationState: ConversationState =
  conversationAdapter.getInitialState({
    selectedConversationId: null,
    loading: false,
    error: null,

    users: [],
    usersLoading: false,
    usersError: null,

    typingUsers: [],
    onlineUsers: [],

    page: 1,
    total: 0,
    totalPages: 1,
  });
