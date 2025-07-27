import { createReducer, on } from '@ngrx/store';
import { attachmentAdapter, initialAttachmentState } from './attachment.state';
import * as AttachmentActions from './attachment.actions';

export const attachmentReducer = createReducer(
  initialAttachmentState,

  // Upload multiple
  on(AttachmentActions.uploadMultipleAttachments, (state) => ({ ...state, loading: true, error: null })),
  on(AttachmentActions.uploadMultipleAttachmentsSuccess, (state, { attachments }) =>
    attachmentAdapter.upsertMany(attachments, { ...state, loading: false })
  ),
  on(AttachmentActions.uploadMultipleAttachmentsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load by id
  on(AttachmentActions.loadAttachment, (state) => ({ ...state, loading: true, error: null })),
  on(AttachmentActions.loadAttachmentSuccess, (state, { attachment }) =>
    attachmentAdapter.upsertOne(attachment, { ...state, loading: false })
  ),
  on(AttachmentActions.loadAttachmentFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load by conversation
  on(AttachmentActions.loadAttachmentsByConversation, (state) => ({ ...state, loading: true, error: null })),
  on(AttachmentActions.loadAttachmentsByConversationSuccess, (state, { attachments }) =>
    attachmentAdapter.setAll(attachments, { ...state, loading: false })
  ),
  on(AttachmentActions.loadAttachmentsByConversationFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load by user
  on(AttachmentActions.loadAttachmentsByUser, (state) => ({ ...state, loading: true, error: null })),
  on(AttachmentActions.loadAttachmentsByUserSuccess, (state, { attachments }) =>
    attachmentAdapter.setAll(attachments, { ...state, loading: false })
  ),
  on(AttachmentActions.loadAttachmentsByUserFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load by type
  on(AttachmentActions.loadAttachmentsByType, (state) => ({ ...state, loading: true, error: null })),
  on(AttachmentActions.loadAttachmentsByTypeSuccess, (state, { attachments }) =>
    attachmentAdapter.setAll(attachments, { ...state, loading: false })
  ),
  on(AttachmentActions.loadAttachmentsByTypeFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Delete
  on(AttachmentActions.deleteAttachment, (state) => ({ ...state, loading: true, error: null })),
  on(AttachmentActions.deleteAttachmentSuccess, (state, { attachmentId }) =>
    attachmentAdapter.removeOne(attachmentId, { ...state, loading: false })
  ),
  on(AttachmentActions.deleteAttachmentFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
