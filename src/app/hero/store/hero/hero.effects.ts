// src/app/heroes/store/effects/hero.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import * as HeroActions from '../hero/hero.actions';
import { HeroService } from '../../service/hero.service';
import { Router } from '@angular/router';

@Injectable()
export class HeroEffects {
  // Load all heroes
  loadHeroes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeroActions.loadHeroes),
      exhaustMap(() =>
        this.heroService.getAllHeroes().pipe(
          map(heroes => HeroActions.loadHeroesSuccess({ heroes })),
          catchError(error => of(HeroActions.loadHeroesFailure({ error: error.message })))
        )
      )
    )
  );

  // Load heroes by owner
  loadHeroesByOwner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeroActions.loadHeroesByOwner),
      exhaustMap(({ ownerId }) =>
        this.heroService.getHeroesByOwner(ownerId).pipe(
          map(heroes => HeroActions.loadHeroesByOwnerSuccess({ heroes })),
          catchError(error => of(HeroActions.loadHeroesByOwnerFailure({ error: error.message })))
        )
      )
    )
  );

  // Load single hero
  loadHero$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeroActions.loadHero),
      exhaustMap(({ _id }) =>
        this.heroService.getHeroById(_id).pipe(
          map(hero => HeroActions.loadHeroSuccess({ hero })),
          catchError(error => of(HeroActions.loadHeroFailure({ error: error.message })))
        )
      )
    )
  );

  // Create hero
  createHero$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeroActions.createHero),
      exhaustMap(({ hero }) =>
        this.heroService.createHero(hero).pipe(
          map(createdHero => HeroActions.createHeroSuccess({ hero: createdHero })),
          catchError(error => of(HeroActions.createHeroFailure({ error: error.message })))
        )
      )
    )
  );

  // Update hero
  updateHero$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeroActions.updateHero),
      exhaustMap(({ hero }) =>
        this.heroService.updateHero(hero._id, hero).pipe(
          map(updatedHero => HeroActions.updateHeroSuccess({ hero: updatedHero })),
          catchError(error => of(HeroActions.updateHeroFailure({ error: error.message })))
        )
      )
    )
  );

  deleteManyHeroes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeroActions.deleteManyHeroes),
      exhaustMap(({ ids }) =>
        this.heroService.deleteHeroes(ids).pipe( // gọi đến API xóa nhiều
          map(() => HeroActions.deleteManyHeroesSuccess({ ids })), // trả lại đúng danh sách đã xoá
          catchError(error =>
            of(HeroActions.deleteManyHeroesFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // Success notifications
  successNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        HeroActions.createHeroSuccess,
        HeroActions.updateHeroSuccess,
        HeroActions.deleteManyHeroesSuccess
      ),
      tap(action => {
        let message = '';
        if (action.type === HeroActions.createHeroSuccess.type) {
          message = `Hero ${action.hero.name} created successfully`;
        } else if (action.type === HeroActions.updateHeroSuccess.type) {
          message = `Hero ${action.hero.name} updated successfully`;
        } else if (action.type === HeroActions.deleteManyHeroesSuccess.type) {
          message = 'Hero deleted successfully';
        }
      })
    ),
    { dispatch: false }
  );

  // Navigation after successful operations
  navigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        HeroActions.createHeroSuccess,
        HeroActions.updateHeroSuccess
      ),
      tap(action => {
        this.router.navigate(['/heroes', action.hero._id]);
      })
    ),
    { dispatch: false }
  );

  // Add tag to hero
  addTagToHero$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeroActions.addTagToHero),
      exhaustMap(({ heroIds, tag }) =>
        this.heroService.addTagToHero(heroIds, tag).pipe(
          map(hero => HeroActions.addTagToHeroSuccess({ heroIds, tag })),
          catchError(error =>
            of(HeroActions.addTagToHeroFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // Remove tag from hero
  removeTagFromHero$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeroActions.removeTagFromHero),
      exhaustMap(({ heroIds, tag }) =>
        this.heroService.removeTagFromHero(heroIds, tag).pipe(
          map(hero => HeroActions.removeTagFromHeroSuccess({ heroIds, tag })),
          catchError(error =>
            of(HeroActions.removeTagFromHeroFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private heroService: HeroService,
    private router: Router
  ) { }
}
