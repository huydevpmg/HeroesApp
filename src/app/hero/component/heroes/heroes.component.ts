import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeroModel } from '../../models/hero.model';
import { Observable, Subscription, take } from 'rxjs';
import { HeroEventsService } from '../../service/hero-events.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.state';
import { selectAllHeroes, selectLoading, selectError } from '../../store/hero/hero.selectors';
import { loadHeroesByOwner, deleteHero } from '../../store/hero/hero.actions';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit, OnDestroy {
  heroes$: Observable<HeroModel[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  selectedIds: string[] = [];
  currentHeroTags: string[] = [];
  private subscriptions = new Subscription();

  constructor(
    private store: Store<AppState>,
    private heroEvents: HeroEventsService,
    private router: Router,
    private authService: AuthService
  ) {
    this.heroes$ = this.store.select(selectAllHeroes);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
  }

  ngOnInit(): void {
    this.loadHeroes();
    this.subscriptions.add(
      this.heroEvents.heroAdded$.subscribe(() => {
        this.loadHeroes();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goToDetail(heroId: string) {
    this.router.navigate(['/detail', heroId]);
  }

  private loadHeroes(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      console.error('User ID is null. Please login again.');
      return;
    }
    this.store.dispatch(loadHeroesByOwner({ ownerId: userId }));
  }

  onCheckboxChange(event: { id: string; checked: boolean }) {
    const { id, checked } = event;

    if (checked && !this.selectedIds.includes(id)) {
      this.selectedIds.push(id);
    } else if (!checked) {
      this.selectedIds = this.selectedIds.filter(existingId => existingId !== id);
    }

    if (this.selectedIds.length === 1) {
      this.heroes$.pipe(take(1)).subscribe(heroes => {
        const selectedHero = heroes.find(h => h._id === this.selectedIds[0]);
        this.currentHeroTags = selectedHero?.tags || [];
      });
    } else {
      this.currentHeroTags = [];
    }
  }

  deleteSelectedHeroes() {
    if (this.selectedIds.length === 0) return;
    this.selectedIds.forEach(id => {
      this.store.dispatch(deleteHero({ _id: id }));
    });
    this.selectedIds = [];
  }
}



