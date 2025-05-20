import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import * as TagActions from './tag.actions';
import { TagService } from '../../service/tag.service';

@Injectable()
export class TagEffects {
  constructor(private actions$: Actions, private tagService: TagService) { }

  loadTags$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.loadTags),
      mergeMap(() =>
        this.tagService.getAllTags().pipe(
          map((tags) => TagActions.loadTagsSuccess({ tags })),
          catchError((err) => of(TagActions.loadTagsFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  createTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.createTag),
      mergeMap(({ name }) =>
        this.tagService.createTag(name).pipe(
          map((tag) => TagActions.createTagSuccess({ tag })),
          catchError((err) => of(TagActions.createTagFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  deleteTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.deleteTag),
      mergeMap(({ id }) =>
        this.tagService.deleteTag(id).pipe(
          map(() => TagActions.deleteTagSuccess({ id })),
          catchError((err) => of(TagActions.deleteTagFailure({ error: err.message }))),
        ),
      ),
    ),
  );
}
