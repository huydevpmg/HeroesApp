import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MessageState, messageAdapter } from './message.state';
import { selectAttachmentEntities } from '../attachment/attachment.selectors';


export const selectMessageState = createFeatureSelector<MessageState>('messages');

const {
  selectIds: selectMessageIds,
  selectEntities: selectMessageEntities,
  selectAll: selectAllMessages,
  selectTotal: selectMessageTotal
} = messageAdapter.getSelectors(selectMessageState);

export {
  selectMessageIds,
  selectMessageEntities,
  selectAllMessages,
  selectMessageTotal
};

export const selectMessagesLoading = createSelector(
  selectMessageState,
  state => state.loading
);

export const selectMessagesError = createSelector(
  selectMessageState,
  state => state.error
);

export const selectMessagesByConversation = (conversationId: string) => createSelector(
  selectAllMessages,
  (messages) => messages.filter(m => m.conversationId === conversationId)
);

export const selectMessagesWithAttachment = createSelector(
  selectAllMessages,
  selectAttachmentEntities,
  (messages, attachmentEntities) =>
    messages.map(msg => ({
      ...msg,
      attachment: msg.attachmentId ? attachmentEntities[msg.attachmentId] : undefined
    }))
);

// // Select deleted message ids (if you want to track deleted for animation/undo)
// export const selectDeletedMessageIds = createSelector(
//   selectAllMessages,
//   (messages) => messages.filter(m => m.isDeleted).map(m => m._id)
// );
