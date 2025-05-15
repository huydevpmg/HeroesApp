// src/app/heroes/store/effects/hero.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import * as HeroActions from '../actions/hero.actions';
import { HeroService } from '../../heroes/hero.service';
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

  // Delete hero
  deleteHero$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeroActions.deleteHero),
      exhaustMap(({ _id }) =>
        this.heroService.deleteHero(_id).pipe(
          map(() => HeroActions.deleteHeroSuccess({ _id })),
          catchError(error => of(HeroActions.deleteHeroFailure({ error: error.message })))
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
        HeroActions.deleteHeroSuccess
      ),
      tap(action => {
        let message = '';
        if (action.type === HeroActions.createHeroSuccess.type) {
          message = `Hero ${action.hero.name} created successfully`;
        } else if (action.type === HeroActions.updateHeroSuccess.type) {
          message = `Hero ${action.hero.name} updated successfully`;
        } else if (action.type === HeroActions.deleteHeroSuccess.type) {
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

  constructor(
    private actions$: Actions,
    private heroService: HeroService,
    private router: Router,
  ) {}
}
