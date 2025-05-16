// src/app/core/services/hero.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeroModel } from '../models/hero.model';

export type CreateHeroModel = Omit<HeroModel, '_id'>;

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private apiUrl = 'http://localhost:5000/api/heroes';

  constructor(private http: HttpClient) {}

  getAllHeroes(): Observable<HeroModel[]> {
    return this.http.get<HeroModel[]>(`${this.apiUrl}/getAllHeroes`);
  }

  getHeroesByOwner(_id: string): Observable<HeroModel[]> {
      return this.http.get<HeroModel[]>(`${this.apiUrl}/getHeroesByOwner`, {
          params: { ownerId: _id }
      });
  }


  getHeroById(_id: string): Observable<HeroModel> {
    return this.http.get<HeroModel>(
      `${this.apiUrl}/getHeroById/${_id}`
    );
  }

  createHero(hero: CreateHeroModel): Observable<HeroModel> {
    return this.http.post<HeroModel>(`${this.apiUrl}/createHero`, hero);
  }

  updateHero(_id: string, hero: HeroModel): Observable<HeroModel> {
    return this.http.put<HeroModel>(`${this.apiUrl}/updateHero/${_id}`, hero);
  }

  deleteHero(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteHero/${_id}`);
  }

  deleteHeroes(ids: string[]): Observable<any> {
  return this.http.request('delete', `${this.apiUrl}/bulk-delete`, { body: { ids } });
}
}
