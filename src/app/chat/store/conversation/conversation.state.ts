import { Conversation } from '../../models/conversation.model';

export interface ConversationState {
  entities: { [id: string]: Conversation };
  ids: string[];
  selectedConversationId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialConversationState: ConversationState = {
  entities: {},
  ids: [],
  selectedConversationId: null,
  loading: false,
  error: null
};