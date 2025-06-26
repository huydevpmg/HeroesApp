import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AttachmentState, attachmentAdapter } from './attachment.state';

export const selectAttachmentState = createFeatureSelector<AttachmentState>('attachments');

const { selectAll, selectEntities } = attachmentAdapter.getSelectors();

export const selectAllAttachments = createSelector(
  selectAttachmentState,
  selectAll
);

export const selectAttachmentEntities = createSelector(
  selectAttachmentState,
  selectEntities
);

export const selectAttachmentById = (id: string) => createSelector(
  selectAttachmentEntities,
  entities => entities[id]
);

export const selectAttachmentLoading = createSelector(
  selectAttachmentState,
  state => state.loading
);

export const selectAttachmentError = createSelector(
  selectAttachmentState,
  state => state.error
);
