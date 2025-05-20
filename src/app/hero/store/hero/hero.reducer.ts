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
    HeroActions.deleteManyHeroes,
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
  on(HeroActions.deleteManyHeroesSuccess, (state, { ids }) => ({
    ...state,
    heroes: state.heroes.filter(h => !ids.includes(h._id)),
    selectedHero:
      state.selectedHero && ids.includes(state.selectedHero._id)
        ? null
        : state.selectedHero,
    loading: false,
    lastUpdated: Date.now()
  })),

  // ✅ Success: Add or Remove Tag
  on(
    HeroActions.addTagToHeroSuccess,
    (state, { heroIds, tag }) => ({
      ...state,
      heroes: state.heroes.map(h =>
        heroIds.includes(h._id) && !h.tags.includes(tag)
          ? { ...h, tags: [...h.tags, tag] }
          : h
      ),
      selectedHero:
        state.selectedHero && heroIds.includes(state.selectedHero._id)
          ? {
            ...state.selectedHero,
            tags: state.selectedHero.tags.includes(tag)
              ? state.selectedHero.tags
              : [...state.selectedHero.tags, tag]
          }
          : state.selectedHero,
      loading: false,
      lastUpdated: Date.now()
    })
  ),

  on(
    HeroActions.removeTagFromHeroSuccess,
    (state, { heroIds, tag }) => ({
      ...state,
      heroes: state.heroes.map(h =>
        heroIds.includes(h._id)
          ? { ...h, tags: h.tags.filter(t => t !== tag) }
          : h
      ),
      selectedHero:
        state.selectedHero && heroIds.includes(state.selectedHero._id)
          ? {
            ...state.selectedHero,
            tags: state.selectedHero.tags.filter(t => t !== tag)
          }
          : state.selectedHero,
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
    HeroActions.deleteManyHeroesFailure,
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
