import { HeroState } from '../hero/store/hero/hero.state';
import { TagState } from '../hero/store/tag/tag.state';

export interface AppState {
  heroes: HeroState;
  tag: TagState;
}
