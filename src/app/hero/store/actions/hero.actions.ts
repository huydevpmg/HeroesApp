// src/app/heroes/store/actions/hero.actions.ts
import { createAction, props } from '@ngrx/store';
import { HeroModel } from '../../models/hero.model';

// Action types
const ACTION_PREFIX = '[Heroes]'; //Type để định danh

// Load Actions
export const loadHeroes = createAction(`${ACTION_PREFIX} Load Heroes`);
export const loadHeroesSuccess = createAction(
  `${ACTION_PREFIX} Load Heroes Success`,
  props<{ heroes: HeroModel[] }>()
);
export const loadHeroesFailure = createAction(
  `${ACTION_PREFIX} Load Heroes Failure`,
  props<{ error: string }>()
);

// CRUD Actions
export const loadHero = createAction(
  `${ACTION_PREFIX} Load Hero`,
  props<{ _id: string }>()
);
export const loadHeroSuccess = createAction(
  `${ACTION_PREFIX} Load Hero Success`,
  props<{ hero: HeroModel }>()
);
export const loadHeroFailure = createAction(
  `${ACTION_PREFIX} Load Hero Failure`,
  props<{ error: string }>()
);

//Create
export const createHero = createAction(
  `${ACTION_PREFIX} Create Hero`,
  props<{ hero: Omit<HeroModel, '_id'> }>()
);
export const createHeroSuccess = createAction(
  `${ACTION_PREFIX} Create Hero Success`,
  props<{ hero: HeroModel }>()
);
export const createHeroFailure = createAction(
  `${ACTION_PREFIX} Create Hero Failure`,
  props<{ error: string }>()
);

// update
export const updateHero = createAction(
  `${ACTION_PREFIX} Update Hero`,
  props<{ hero: HeroModel }>()
);
export const updateHeroSuccess = createAction(
  `${ACTION_PREFIX} Update Hero Success`,
  props<{ hero: HeroModel }>()
);
export const updateHeroFailure = createAction(
  `${ACTION_PREFIX} Update Hero Failure`,
  props<{ error: string }>()
);

//deletehttps://chatgpt.com/
export const deleteHero = createAction(
  `${ACTION_PREFIX} Delete Hero`,
  props<{ _id: string }>()
);
export const deleteHeroSuccess = createAction(
  `${ACTION_PREFIX} Delete Hero Success`,
  props<{ _id: string }>()
);
export const deleteHeroFailure = createAction(
  `${ACTION_PREFIX} Delete Hero Failure`,
  props<{ error: string }>()
);
