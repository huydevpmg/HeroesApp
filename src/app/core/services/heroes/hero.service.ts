import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { MessageService } from '../messages/message.service';
import { HeroModel } from '../../models/hero.model';
import { HEROES } from '../../models/mock-heroes';


@Injectable({ providedIn: 'root' })
export class HeroService {

  constructor(private messageService: MessageService) { }

  getHeroes(): Observable<HeroModel[]> {
    const heroes = of(HEROES);
    this.messageService.add('HeroService: fetched heroes');
    return heroes;
  }

  addHero(hero: HeroModel) {
    HEROES.push(hero);
    this.messageService.add(`HeroService: added hero w/ id=${hero.id}`);
  }

  getHero(id: number): Observable<HeroModel> {
    const hero = HEROES.find(h => h.id === id)!;
    this.messageService.add(`HeroService: fetched hero id=${id}`);
    return of(hero);
  }
}
