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

  constructor(private http: HttpClient) { }

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

  deleteHeroes(ids: string[]): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/bulk-delete`, { body: { ids } });
  }

  addTagToHero(heroIds: string[], tag: string): Observable<HeroModel> {
    return this.http.patch<HeroModel>(`${this.apiUrl}/bulk/add-tag`, { heroIds, tag });
  }

  removeTagFromHero(heroIds: string[], tag: string): Observable<HeroModel> {
    return this.http.patch<HeroModel>(`${this.apiUrl}/bulk/remove-tag`, { heroIds, tag });
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email`, {
      params: { email }
    });
  }
}
