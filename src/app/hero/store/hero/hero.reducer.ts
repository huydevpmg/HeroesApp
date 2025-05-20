import { createReducer, on } from '@ngrx/store';
import { initialHeroState } from './hero.state';
import * as HeroActions from '../hero/hero.actions';

export const heroReducer = createReducer(
  initialHeroState,

  // 🔄 Loading states
  on(
    HeroActions.loadHeroes,
    HeroActions.loadHero,
    HeroActions.createHero,
    HeroActions.updateHero,
    HeroActions.deleteHero,
    HeroActions.addTagToHero,
    HeroActions.removeTagFromHero,
    HeroActions.loadHeroesByOwner,
    (state) => ({
      ...state,
      loading: true,
      error: null
    })
  ),

  // ✅ Success: Load all
  on(HeroActions.loadHeroesSuccess, (state, { heroes }) => ({
    ...state,
    heroes,
    loading: false,
    lastUpdated: Date.now()
  })),

  // ✅ Success: Load by owner
  on(HeroActions.loadHeroesByOwnerSuccess, (state, { heroes }) => ({
    ...state,
    heroes,
    loading: false,
    lastUpdated: Date.now()
  })),

  // ✅ Success: Load one
  on(HeroActions.loadHeroSuccess, (state, { hero }) => ({
    ...state,
    selectedHero: hero,
    loading: false
  })),

  // ✅ Success: Create
  on(HeroActions.createHeroSuccess, (state, { hero }) => ({
    ...state,
    heroes: [...state.heroes, hero],
    loading: false,
    lastUpdated: Date.now()
  })),

  // ✅ Success: Update
  on(HeroActions.updateHeroSuccess, (state, { hero }) => ({
    ...state,
    heroes: state.heroes.map(h => h._id === hero._id ? hero : h),
    selectedHero: hero,
    loading: false,
    lastUpdated: Date.now()
  })),

  // ✅ Success: Delete
  on(HeroActions.deleteHeroSuccess, (state, { _id }) => ({
    ...state,
    heroes: state.heroes.filter(h => h._id !== _id),
    selectedHero: state.selectedHero?._id === _id ? null : state.selectedHero,
    loading: false,
    lastUpdated: Date.now()
  })),

  // ✅ Success: Add or Remove Tag
  on(
    HeroActions.addTagToHeroSuccess,
    HeroActions.removeTagFromHeroSuccess,
    (state, { hero }) => ({
      ...state,
      heroes: state.heroes.map(h => h._id === hero._id ? hero : h),
      selectedHero: state.selectedHero?._id === hero._id ? hero : state.selectedHero,
      loading: false,
      lastUpdated: Date.now()
    })
  ),


  // ❌ All Failure cases
  on(
    HeroActions.loadHeroesFailure,
    HeroActions.loadHeroFailure,
    HeroActions.createHeroFailure,
    HeroActions.updateHeroFailure,
    HeroActions.deleteHeroFailure,
    HeroActions.addTagToHeroFailure,
    HeroActions.removeTagFromHeroFailure,
    HeroActions.loadHeroesByOwnerFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  )
);
