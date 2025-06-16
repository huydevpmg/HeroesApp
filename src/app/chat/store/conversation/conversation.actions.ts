import { createAction, props } from '@ngrx/store';
import { Conversation } from '../../models/conversation.model';

// Load Conversations
export const loadConversations = createAction(
  '[Conversation] Load Conversations'
);

export const loadConversationsSuccess = createAction(
  '[Conversation] Load Conversations Success',
  props<{ conversations: Conversation[] }>()
);

export const loadConversationsFailure = createAction(
  '[Conversation] Load Conversations Failure',
  props<{ error: string }>()
);

// Load Single Conversation
export const loadConversation = createAction(
  '[Conversation] Load Conversation',
  props<{ id: string }>()
);

export const loadConversationSuccess = createAction(
  '[Conversation] Load Conversation Success',
  props<{ conversation: Conversation }>()
);

export const loadConversationFailure = createAction(
  '[Conversation] Load Conversation Failure',
  props<{ error: string }>()
);

// Create 1on1 Conversation
export const findOrCreate1on1Conversation = createAction(
  '[Conversation] Find Or Create 1on1 Conversation',
  props<{ participantId: string }>()
);

export const findOrCreate1on1ConversationSuccess = createAction(
  '[Conversation] Find Or Create 1on1 Conversation Success',
  props<{ conversation: Conversation }>()
);

export const findOrCreate1on1ConversationFailure = createAction(
  '[Conversation] Find Or Create 1on1 Conversation Failure',
  props<{ error: string }>()
);

// Create Group Conversation
export const createConversation = createAction(
  '[Conversation] Create Conversation',
  props<{ data: Partial<Conversation> }>()
);

export const createConversationSuccess = createAction(
  '[Conversation] Create Conversation Success',
  props<{ conversation: Conversation }>()
);

export const createConversationFailure = createAction(
  '[Conversation] Create Conversation Failure',
  props<{ error: string }>()
);

// Update Conversation
export const updateConversation = createAction(
  '[Conversation] Update Conversation',
  props<{ id: string; data: Partial<Conversation> }>()
);

export const updateConversationSuccess = createAction(
  '[Conversation] Update Conversation Success',
  props<{ conversation: Conversation }>()
);

export const updateConversationFailure = createAction(
  '[Conversation] Update Conversation Failure',
  props<{ error: string }>()
);

// Select Conversation
export const selectConversation = createAction(
  '[Conversation] Select Conversation',
  props<{ id: string | null }>()
);
