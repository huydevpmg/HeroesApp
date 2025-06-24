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
