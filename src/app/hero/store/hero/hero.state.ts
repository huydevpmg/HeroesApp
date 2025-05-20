// src/app/heroes/store/state/hero.state.ts
import { HeroModel } from "../../models/hero.model";

export interface HeroState {
  heroes: HeroModel[];
  selectedHero: HeroModel | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export const initialHeroState: HeroState = {
  heroes: [],
  selectedHero: null,
  loading: false,
  error: null,
  lastUpdated: null
};
