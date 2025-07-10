import { createFeatureSelector, createSelector } from '@ngrx/store';
import { conversationAdapter, ConversationState } from './conversation.state';

export const selectConversationState =
  createFeatureSelector<ConversationState>('conversation');

const {
  selectIds: selectConversationIds,
  selectEntities: selectConversationEntities,
  selectAll: selectAllConversations,
  selectTotal: selectConversationTotal,
} = conversationAdapter.getSelectors(selectConversationState);

export {
  selectConversationIds,
  selectConversationEntities,
  selectAllConversations,
  selectConversationTotal,
};

// Selected
export const selectSelectedConversationId = createSelector(
  selectConversationState,
  s => s.selectedConversationId
);

export const selectSelectedConversation = createSelector(
  selectConversationEntities,
  selectSelectedConversationId,
  (entities, id) => (id ? entities[id] : null)
);

// Loading / Error
export const selectConversationLoading = createSelector(
  selectConversationState,
  s => s.loading
);

export const selectConversationError = createSelector(
  selectConversationState,
  s => s.error
);

// Users list
export const selectConversationUsers = createSelector(
  selectConversationState,
  s => s.users
);

export const selectConversationUsersLoading = createSelector(
  selectConversationState,
  s => s.usersLoading
);

export const selectConversationUsersError = createSelector(
  selectConversationState,
  s => s.usersError
);

// Typing / Online
export const selectTypingUsers = createSelector(
  selectConversationState,
  s => s.typingUsers
);

export const selectOnlineUsers = createSelector(
  selectConversationState,
  s => s.onlineUsers
);

export const getAllUsers = createSelector(
  selectConversationState,
  s => s.users
);

// Paging
export const selectConversationPage = createSelector(
  selectConversationState,
  s => s.page
);

export const selectConversationTotalPages = createSelector(
  selectConversationState,
  s => s.totalPages
);

export const selectConversationTotalCount = createSelector(
  selectConversationState,
  s => s.total
);
