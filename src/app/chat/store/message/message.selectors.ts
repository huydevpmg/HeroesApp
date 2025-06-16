import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MessageState } from './message.state';

export const selectMessageState = createFeatureSelector<MessageState>('messages');

export const selectMessageEntities = createSelector(
  selectMessageState,
  state => state.entities
);

export const selectMessageIds = createSelector(
  selectMessageState,
  state => state.ids
);

export const selectAllMessages = createSelector(
  selectMessageEntities,
  selectMessageIds,
  (entities, ids) => ids.map(id => entities[id])
);

export const selectMessagesLoading = createSelector(
  selectMessageState,
  state => state.loading
);

export const selectMessagesError = createSelector(
  selectMessageState,
  state => state.error
);

// Typing users
export const selectTypingUsers = createSelector(
  selectMessageState,
  state => state.typingUsers
);

export const selectTypingUsersInConversation = (conversationId: string) => createSelector(
  selectTypingUsers,
  typingUsers => typingUsers.filter(u => u.conversationId === conversationId)
);

// Online users
export const selectOnlineUsers = createSelector(
  selectMessageState,
  state => state.onlineUsers
);

export const selectIsUserOnline = (userId: string) => createSelector(
  selectOnlineUsers,
  onlineUsers => onlineUsers.includes(userId)
);
