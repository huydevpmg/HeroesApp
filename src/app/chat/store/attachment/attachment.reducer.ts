import { createReducer, on } from '@ngrx/store';
import { attachmentAdapter, initialAttachmentState } from './attachment.state';
import * as AttachmentActions from './attachment.actions';

export const attachmentReducer = createReducer(
  initialAttachmentState,
  on(AttachmentActions.uploadAttachment, (state) => ({ ...state, loading: true, error: null })),
  on(AttachmentActions.uploadAttachmentSuccess, (state, { attachment }) =>
    attachment && attachment._id
      ? attachmentAdapter.upsertOne(attachment, { ...state, loading: false })
      : { ...state, loading: false }
  ),
  on(AttachmentActions.uploadAttachmentFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(AttachmentActions.loadAttachment, (state) => ({ ...state, loading: true, error: null })),
  on(AttachmentActions.loadAttachmentSuccess, (state, { attachment }) =>
    attachmentAdapter.upsertOne(attachment, { ...state, loading: false })
  ),
  on(AttachmentActions.loadAttachmentFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
