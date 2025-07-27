import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MessageState, messageAdapter } from './message.state';

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
  selectMessageState,
  messageAdapter.getSelectors().selectAll
);

export const selectMessagesPage = createSelector(
  selectMessageState,
  state => state.page
);

export const selectMessagesTotalPages = createSelector(
  selectMessageState,
  state => state.totalPages
);

export const selectMessagesTotal = createSelector(
  selectMessageState,
  state => state.total
);

// // Select deleted message ids (if you want to track deleted for animation/undo)
// export const selectDeletedMessageIds = createSelector(
//   selectAllMessages,
//   (messages) => messages.filter(m => m.isDeleted).map(m => m._id)
// );
