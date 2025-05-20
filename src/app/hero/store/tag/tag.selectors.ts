import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TagState } from './tag.reducers';

export const selectTagState = createFeatureSelector<TagState>('tag');

export const selectAllTags = createSelector(
  selectTagState,
  (state) => state.tags
);

export const selectTagLoading = createSelector(
  selectTagState,
  (state) => state.loading
);

export const selectTagError = createSelector(
  selectTagState,
  (state) => state.error
);
