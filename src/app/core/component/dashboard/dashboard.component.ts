// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { HeroService } from '../../services/heroes/hero.service';
import { BehaviorSubject } from 'rxjs';
import { HeroModel } from '../../models/hero.model';
import { HeroEventsService } from '../../services/heroes/hero-events.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  heroesSubject = new BehaviorSubject<HeroModel[]>([]);
  heroes$ = this.heroesSubject.asObservable();
  loading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private heroService: HeroService,
    private heroEvents: HeroEventsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHeroes();

    this.heroEvents.heroAdded$.subscribe(() => {
      this.loadHeroes();
    });
  }

  private loadHeroes(): void {
    this.loading$.next(true);
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
      },
    });
  }
}
