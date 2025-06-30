import { createReducer, on } from '@ngrx/store';
import * as MessageActions from './message.actions';
import { messageAdapter, initialMessageState } from './message.state';

export const messageReducer = createReducer(
  initialMessageState,
  on(MessageActions.loadMessages, state => ({ ...state, loading: true, error: null })),
  on(MessageActions.loadMessagesSuccess, (state, { messages }) =>
    messageAdapter.setAll(messages, { ...state, loading: false })
  ),
  on(MessageActions.loadMessagesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(MessageActions.sendMessageSuccess, (state, { message }) =>
    messageAdapter.addOne(message, state)
  ),

  on(MessageActions.receiveMessage, (state, { message }) =>
    messageAdapter.addOne(message, state)
  ),

  on(MessageActions.updateMessageSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: message._id!, changes: message }, state)
  ),

  on(MessageActions.deleteMessageSuccess, (state, { messageId }) =>
    messageAdapter.updateOne({ id: messageId, changes: { isDeleteGlobal: true } }, state)
  ),

  on(MessageActions.deleteMessageFailure, (state, { error }) => ({ ...state, error })),

  on(MessageActions.addReactionSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: message._id!, changes: message }, state)
  ),

  on(MessageActions.removeReactionSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: message._id!, changes: message }, state)
  ),

  on(MessageActions.updateMessageStatusSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: message._id!, changes: message }, state)
  )
);
