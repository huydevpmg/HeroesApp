import { messageAdapter, MessageState, initialMessageState } from './message.state';
import { createReducer, on } from '@ngrx/store';
import * as MessageActions from './message.actions';

export const messageReducer = createReducer(
  initialMessageState,

  // Load messages
  on(MessageActions.loadMessages, state => ({ ...state, loading: true, error: null })),
  on(MessageActions.loadMessagesSuccess, (state, { messages }) =>
    messageAdapter.setAll(messages, { ...state, loading: false })
  ),
  on(MessageActions.loadMessagesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Send message
  on(MessageActions.sendMessage, state => ({ ...state, loading: true, error: null })),
  on(MessageActions.sendMessageSuccess, (state, { message }) =>
    messageAdapter.addOne(message, { ...state, loading: false })
  ),
  on(MessageActions.sendMessageFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Receive message (socket)
  on(MessageActions.receiveMessage, (state, { message }) =>
    messageAdapter.addOne(message, state)
  ),

  // Delete message
  on(MessageActions.deleteMessage, state => ({ ...state, loading: true, error: null })),
  on(MessageActions.deleteMessageSuccess, (state, { messageId }) =>
    messageAdapter.removeOne(messageId, { ...state, loading: false })
  ),
  on(MessageActions.deleteMessageFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Update message status
  on(MessageActions.updateMessageStatus, state => ({ ...state, loading: true, error: null })),
  on(MessageActions.updateMessageStatusSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: String(message._id), changes: message }, { ...state, loading: false })
  ),
  on(MessageActions.updateMessageStatusFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Add reaction
  on(MessageActions.addReaction, state => ({ ...state, loading: true, error: null })),
  on(MessageActions.addReactionSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: String(message._id), changes: message }, { ...state, loading: false })
  ),
  on(MessageActions.addReactionFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Remove reaction
  on(MessageActions.removeReaction, state => ({ ...state, loading: true, error: null })),
  on(MessageActions.removeReactionSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: String(message._id), changes: message }, { ...state, loading: false })
  ),
  on(MessageActions.removeReactionFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
