// src/app/heroes/store/reducers/hero.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { HeroState, initialHeroState } from '../state/hero.state';
import * as HeroActions from '../actions/hero.actions';

export const heroReducer = createReducer(
  initialHeroState,
  // Loading states
  on(
    HeroActions.loadHeroes,
    HeroActions.loadHero,
    HeroActions.createHero,
    HeroActions.updateHero,
    HeroActions.deleteHero,
    (state) => ({
      ...state,
      loading: true,
      error: null
    })
  ),

  // Success cases
  on(HeroActions.loadHeroesSuccess, (state, { heroes }) => ({
    ...state,
    heroes,
    loading: false,
    lastUpdated: Date.now()
  })),

  on(HeroActions.loadHeroSuccess, (state, { hero }) => ({
    ...state,
    selectedHero: hero,
    loading: false
  })),

  on(HeroActions.createHeroSuccess, (state, { hero }) => ({
    ...state,
    heroes: [...state.heroes, hero],
    loading: false,
    lastUpdated: Date.now()
  })),

  on(HeroActions.updateHeroSuccess, (state, { hero }) => ({
    ...state,
    heroes: state.heroes.map(h => h._id === hero._id ? hero : h),
    selectedHero: hero,
    loading: false,
    lastUpdated: Date.now()
  })),

  on(HeroActions.deleteHeroSuccess, (state, { _id }) => ({
    ...state,
    heroes: state.heroes.filter(h => h._id !== _id),
    selectedHero: state.selectedHero?._id === _id ? null : state.selectedHero,
    loading: false,
    lastUpdated: Date.now()
})),

  on(
    HeroActions.loadHeroesFailure,
    HeroActions.loadHeroFailure,
    HeroActions.createHeroFailure,
    HeroActions.updateHeroFailure,
    HeroActions.deleteHeroFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  )
);
