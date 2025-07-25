import { createReducer, on } from '@ngrx/store';
import * as MessageActions from './message.actions';
import { messageAdapter, initialMessageState } from './message.state';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';

export const messageReducer = createReducer(
  initialMessageState,
  on(MessageActions.loadMessages, state => ({ ...state, loading: true, error: null })),
  on(MessageActions.loadMessagesSuccess, (state, { messages, total, page, totalPages }) => {
    const orderedMessages = [...messages].reverse();
    let newState;
    if (page === 1) {
      newState = messageAdapter.setAll(orderedMessages, { ...state, loading: false, total, page, totalPages });
    } else {
      const ids = state.ids as string[];
      newState = messageAdapter.addMany(
        orderedMessages.filter(m => !!m._id && !ids.includes(m._id as string)),
        { ...state, loading: false, total, page, totalPages }
      );
    }
    const all = messageAdapter.getSelectors().selectAll(newState);
    const sorted = [...all].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });
    return messageAdapter.setAll(sorted, newState);
  }),
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
