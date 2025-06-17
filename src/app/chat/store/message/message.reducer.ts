import { createReducer, on } from '@ngrx/store';
import * as MessageActions from './message.actions';
import { MessageState, initialMessageState } from './message.state';

export const messageReducer = createReducer(
  initialMessageState,

  // Load messages
  on(MessageActions.loadMessages, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MessageActions.loadMessagesSuccess, (state, { messages }) => {
    const entities = messages.reduce((acc, msg) => ({
      ...acc,
      [String(msg._id)]: msg
    }), {});
    const ids = messages.map(msg => String(msg._id)).filter(id => !!id);
    return { ...state, loading: false, entities, ids };
  }),
  on(MessageActions.loadMessagesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Send message
  on(MessageActions.sendMessage, state => ({
    ...state,
    error: null
  })),
  on(MessageActions.sendMessageSuccess, (state, { message }) => {
    const id = String(message._id);
    return {
      ...state,
      entities: { ...state.entities, [id]: message },
      ids: state.ids.includes(id) ? state.ids : [...state.ids, id]
    };
  }),
  on(MessageActions.sendMessageFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // Receive message (socket)
  on(MessageActions.receiveMessage, (state, { message }) => {
    const id = String(message._id);
    return {
      ...state,
      entities: { ...state.entities, [id]: message },
      ids: state.ids.includes(id) ? state.ids : [...state.ids, id]
    };
  }),

  // Delete message
  on(MessageActions.deleteMessage, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MessageActions.deleteMessageSuccess, (state, { messageId }) => {
    const id = String(messageId);
    const { [id]: removed, ...entities } = state.entities;
    return {
      ...state,
      loading: false,
      entities,
      ids: state.ids.filter(i => i !== id)
    };
  }),
  on(MessageActions.deleteMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update message status
  on(MessageActions.updateMessageStatus, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MessageActions.updateMessageStatusSuccess, (state, { message }) => {
    const id = String(message._id);
    return {
      ...state,
      loading: false,
      entities: { ...state.entities, [id]: message }
    };
  }),
  on(MessageActions.updateMessageStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Add reaction
  on(MessageActions.addReaction, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MessageActions.addReactionSuccess, (state, { message }) => {
    const id = String(message._id);
    return {
      ...state,
      loading: false,
      entities: { ...state.entities, [id]: message }
    };
  }),
  on(MessageActions.addReactionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Remove reaction
  on(MessageActions.removeReaction, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MessageActions.removeReactionSuccess, (state, { message }) => {
    const id = String(message._id);
    return {
      ...state,
      loading: false,
      entities: { ...state.entities, [id]: message }
    };
  }),
  on(MessageActions.removeReactionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Typing users
  on(MessageActions.setTypingUsers, (state, { typingUsers }) => ({
    ...state,
    typingUsers: typingUsers.map((user: any) =>
      typeof user === 'string' ? { id: user } : user
    )
  })),

  // Online users
  on(MessageActions.setOnlineUsers, (state, { onlineUsers }) => ({
    ...state,
    onlineUsers
  })),
  on(MessageActions.updateOnlineUsers, (state, { onlineUsers }) => ({
    ...state,
    onlineUsers
  }))
);
