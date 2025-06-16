import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConversationState } from './conversation.state';

export const selectConversationState = createFeatureSelector<ConversationState>('conversation');

export const selectAllConversations = createSelector(
  selectConversationState,
  (state: ConversationState) => state.ids.map(id => state.entities[id])
);

export const selectConversationEntities = createSelector(
  selectConversationState,
  (state: ConversationState) => state.entities
);

export const selectSelectedConversationId = createSelector(
  selectConversationState,
  (state: ConversationState) => state.selectedConversationId
);

export const selectSelectedConversation = createSelector(
  selectConversationEntities,
  selectSelectedConversationId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

export const selectConversationLoading = createSelector(
  selectConversationState,
  (state: ConversationState) => state.loading
);

export const selectConversationError = createSelector(
  selectConversationState,
  (state: ConversationState) => state.error
);

export const selectConversationById = (id: string) => createSelector(
  selectConversationEntities,
  (entities) => entities[id]
);

export const selectGroupConversations = createSelector(
  selectAllConversations,
  (conversations) => conversations.filter(conversation => conversation.isGroup)
);

export const selectOneOnOneConversations = createSelector(
  selectAllConversations,
  (conversations) => conversations.filter(conversation => !conversation.isGroup)
);
