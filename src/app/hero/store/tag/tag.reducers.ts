import { createReducer, on } from '@ngrx/store';
import * as TagActions from './tag.actions';
import { Tag } from '../../models/tag.model';

export interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

export const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
};

export const tagReducer = createReducer(
  initialState,

  // Load
  on(TagActions.loadTags, (state) => ({ ...state, loading: true })),
  on(TagActions.loadTagsSuccess, (state, { tags }) => ({
    ...state,
    tags,
    loading: false,
    error: null,
  })),
  on(TagActions.loadTagsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create
  on(TagActions.createTagSuccess, (state, { tag }) => ({
    ...state,
    tags: [...state.tags, tag],
  })),
  on(TagActions.createTagFailure, (state, { error }) => ({ ...state, error })),

  // Delete
  on(TagActions.deleteTagSuccess, (state, { id }) => ({
    ...state,
    tags: state.tags.filter((tag) => tag._id !== id),
  })),
  on(TagActions.deleteTagFailure, (state, { error }) => ({ ...state, error })),
);
