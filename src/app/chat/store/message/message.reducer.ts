import { createReducer, on } from '@ngrx/store';
import * as MessageActions from './message.actions';
import { messageAdapter, initialMessageState } from './message.state';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';

export const messageReducer = createReducer(
  initialMessageState,
  on(MessageActions.loadMessages, state => ({ ...state, loading: true, error: null })),
  on(MessageActions.loadMessagesSuccess, (state, { messages, total, page, totalPages }) => {
    if (page === 1) {
      return messageAdapter.setAll(messages, { ...state, loading: false, total, page, totalPages });
    } else {
      const ids = state.ids as string[];
      return messageAdapter.addMany(
        messages.filter(m => !!m._id && !ids.includes(m._id as string)),
        { ...state, loading: false, total, page, totalPages }
      );
    }
  }),
  on(MessageActions.loadMessagesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(MessageActions.sendMessageSuccess, (state, { message }) => {
    return messageAdapter.addOne(message, state);
  }),

  on(MessageActions.receiveMessage, (state, { message }) =>
    messageAdapter.addOne(message, state)
  ),

  on(MessageActions.updateMessageSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: message._id!, changes: message }, state)
  ),


  on(MessageActions.deleteMessageSuccess, (state, { messageId, deleteType, affectedReplies }) => {
    if (deleteType === DeleteType.JUSTME) {
      return messageAdapter.removeOne(messageId, state);
    }

    let newState = messageAdapter.updateOne(
      {
        id: messageId,
        changes: { isDeleteGlobal: true }
      },
      state
    );

    if (!affectedReplies || affectedReplies.length === 0) {
      return newState;
    }

    const replyUpdates = affectedReplies
      .map(replyId => {
        const reply = newState.entities[replyId];
        const parent = reply?.parentMessage;

        return {
          id: replyId,
          changes: {
            parentMessage: {
              ...(typeof parent === 'object' && parent !== null ? parent : {}),
              isDeleteGlobal: true
            }
          }
        };
      })
      .filter(Boolean) as { id: string; changes: any }[];

    return replyUpdates.length > 0
      ? messageAdapter.updateMany(replyUpdates, newState)
      : newState;
  }),


  on(MessageActions.deleteMessageFailure, (state, { error }) => ({ ...state, error })),

  on(MessageActions.addReactionSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: message._id!, changes: message }, state)
  ),

  on(MessageActions.removeReactionSuccess, (state, { message }) => {
    return messageAdapter.updateOne({ id: message._id!, changes: message }, state);
  }),

  on(MessageActions.editMessageSuccess, (state, { message }) =>
    messageAdapter.updateOne({ id: message._id!, changes: message }, state)
  )
);
