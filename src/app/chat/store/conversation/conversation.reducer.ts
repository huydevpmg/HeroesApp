import { createReducer, on } from '@ngrx/store';
import { ConversationState, initialConversationState } from './conversation.state';
import * as ConversationActions from './conversation.actions';

export const conversationReducer = createReducer(
  initialConversationState,

  // Load Conversations
  on(ConversationActions.loadConversations, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ConversationActions.loadConversationsSuccess, (state, { conversations }) => {
    const entities = conversations.reduce((acc, conversation) => ({
      ...acc,
      [conversation._id!]: conversation
    }), {});

    return {
      ...state,
      entities,
      ids: conversations.map(c => c._id!),
      loading: false,
      error: null
    };
  }),

  on(ConversationActions.loadConversationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Conversation
  on(ConversationActions.loadConversation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ConversationActions.loadConversationSuccess, (state, { conversation }) => ({
    ...state,
    entities: {
      ...state.entities,
      [conversation._id!]: conversation
    },
    ids: state.ids.includes(conversation._id!) ? state.ids : [...state.ids, conversation._id!],
    loading: false,
    error: null
  })),

  on(ConversationActions.loadConversationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Find or Create 1on1 Conversation
  on(ConversationActions.findOrCreate1on1Conversation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ConversationActions.findOrCreate1on1ConversationSuccess, (state, { conversation }) => ({
    ...state,
    entities: {
      ...state.entities,
      [conversation._id!]: conversation
    },
    ids: state.ids.includes(conversation._id!) ? state.ids : [...state.ids, conversation._id!],
    selectedConversationId: conversation._id!,
    loading: false,
    error: null
  })),

  on(ConversationActions.findOrCreate1on1ConversationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Conversation
  on(ConversationActions.createConversation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ConversationActions.createConversationSuccess, (state, { conversation }) => ({
    ...state,
    entities: {
      ...state.entities,
      [conversation._id!]: conversation
    },
    ids: [...state.ids, conversation._id!],
    selectedConversationId: conversation._id!,
    loading: false,
    error: null
  })),

  on(ConversationActions.createConversationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Conversation
  on(ConversationActions.updateConversation, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ConversationActions.updateConversationSuccess, (state, { conversation }) => ({
    ...state,
    entities: {
      ...state.entities,
      [conversation._id!]: conversation
    },
    loading: false,
    error: null
  })),

  on(ConversationActions.updateConversationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update lastMessage of a Conversation
  on(ConversationActions.updateConversationLastMessage, (state, { conversationId, message }) => {
    const current = state.entities[conversationId];
    if (!current) return state;
    if (current.lastMessage && current.lastMessage._id === message._id) return state;
    return {
      ...state,
      entities: {
        ...state.entities,
        [conversationId]: {
          ...current,
          lastMessage: message
        }
      }
    };
  }),

  // Select Conversation
  on(ConversationActions.selectConversation, (state, { id }) => ({
    ...state,
    selectedConversationId: id
  }))
);
