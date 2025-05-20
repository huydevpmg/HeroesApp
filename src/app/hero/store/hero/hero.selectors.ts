// src/app/heroes/store/selectors/hero.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HeroState } from './hero.state';

export const selectHeroState = createFeatureSelector<HeroState>('heroes');

// Basic selectors
export const selectAllHeroes = createSelector(
  selectHeroState,
  (state) => state.heroes
);

export const selectSelectedHero = createSelector(
  selectHeroState,
  (state) => state.selectedHero
);

export const selectLoading = createSelector(
  selectHeroState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectHeroState,
  (state) => state.error
);

export const selectLastUpdated = createSelector(
  selectHeroState,
  (state) => state.lastUpdated
);

// Derived selectors
export const selectTopHeroes = createSelector(
  selectAllHeroes,
  (heroes) => heroes.slice(0, 4)
);

export const selectHeroById = (_id: string) => createSelector(
  selectAllHeroes,
  (heroes) => heroes.find(hero => hero._id === _id)
);

export const selectHeroesCount = createSelector(
  selectAllHeroes,
  (heroes) => heroes.length
);
