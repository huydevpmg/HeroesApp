import { createAction, props } from '@ngrx/store';
import { Tag } from '../../models/tag.model';

export const loadTags = createAction('[Tag] Load Tags');
export const loadTagsSuccess = createAction('[Tag] Load Tags Success', props<{ tags: Tag[] }>());
export const loadTagsFailure = createAction('[Tag] Load Tags Failure', props<{ error: any }>());

export const createTag = createAction('[Tag] Create Tag', props<{ name: string }>());
export const createTagSuccess = createAction('[Tag] Create Tag Success', props<{ tag: Tag }>());
export const createTagFailure = createAction('[Tag] Create Tag Failure', props<{ error: any }>());

export const deleteTag = createAction('[Tag] Delete Tag', props<{ id: string }>());
export const deleteTagSuccess = createAction('[Tag] Delete Tag Success', props<{ id: string }>());
export const deleteTagFailure = createAction('[Tag] Delete Tag Failure', props<{ error: any }>());
