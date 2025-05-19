import { Component, OnInit } from '@angular/core';
import { HeroService } from '../../service/hero.service';
import { HeroModel } from '../../models/hero.model';
import { BehaviorSubject } from 'rxjs';
import { HeroEventsService } from '../../service/hero-events.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  heroesSubject = new BehaviorSubject<HeroModel[]>([]);
  heroes$ = this.heroesSubject.asObservable();
  loading$ = new BehaviorSubject<boolean>(true);
  selectedIds: string[] = [];
  tagInput = '';
  bulkTags: string[] = [];
  constructor(
    private heroService: HeroService,
    private heroEvents: HeroEventsService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getHeroes();
    this.heroEvents.heroAdded$.subscribe(() => {
      this.getHeroes();
    });
  }

  goToDetail(heroId: string) {
    this.router.navigate(['/detail', heroId]);
  }

  private getHeroes(): void {
    const userId = this.authService.getCurrentUserId();
    console.log(userId);
    if (!userId) {
      console.error('User ID is null. Please login again.');
      this.loading$.next(false);
      return;
    }

    this.heroService.getHeroesByOwner(userId).subscribe({
      next: (heroes) => {
        this.heroesSubject.next(heroes);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading heroes:', err);
        this.loading$.next(false);
      }
    });
    this.loading$.next(true);
  }


  onCheckboxChange(event: { id: string, checked: boolean }) {
    const { id, checked } = event;
    if (checked && !this.selectedIds.includes(id)) {
      this.selectedIds.push(id);
    } else if (!checked) {
      this.selectedIds = this.selectedIds.filter(existingId => existingId !== id);
    }
  }

  deleteSelectedHeroes() {
    if (this.selectedIds.length === 0) return;

    if (confirm(`Are you sure you want to delete ${this.selectedIds.length} heroes?`)) {
      this.heroService.deleteHeroes(this.selectedIds).subscribe(() => {
        this.selectedIds = [];
        this.getHeroes();
      });
    }
  }

  updateHeroTags(heroId: string, tags: string[]) {
    this.heroService.updateHeroTags(heroId, tags).subscribe(() => {
    });
  }

  addBulkTag() {
    const tag = this.tagInput.trim();
    if (!tag || this.bulkTags.includes(tag)) return;

    this.bulkTags.push(tag);
    this.tagInput = '';

    for (const id of this.selectedIds) {
      this.heroService.updateHeroTags(id, [...this.bulkTags]).subscribe();
    }
  }

  removeBulkTag(tag: string) {
    this.bulkTags = this.bulkTags.filter(t => t !== tag);

    for (const id of this.selectedIds) {
      this.heroService.updateHeroTags(id, [...this.bulkTags]).subscribe();
    }
  }
}
