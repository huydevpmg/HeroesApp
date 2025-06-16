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
    return this.http.get<HeroModel[]>(`${this.apiUrl}`);
  }

  getHeroesByOwner(ownerId: string): Observable<HeroModel[]> {
    return this.http.get<HeroModel[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  getHeroById(id: string): Observable<HeroModel> {
    return this.http.get<HeroModel>(`${this.apiUrl}/${id}`);
  }

  createHero(hero: CreateHeroModel): Observable<HeroModel> {
    return this.http.post<HeroModel>(`${this.apiUrl}`, hero);
  }

  updateHero(id: string, hero: HeroModel): Observable<HeroModel> {
    return this.http.put<HeroModel>(`${this.apiUrl}/${id}`, hero);
  }

  deleteHero(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteHeroes(ids: string[]): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}`, { body: { ids } });
  }

  updateHeroTags(id: string, tags: string[]): Observable<HeroModel> {
    return this.http.patch<HeroModel>(`${this.apiUrl}/${id}/tags`, { tags });
  }

  addTagToHeroes(heroIds: string[], tag: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tags/add`, { heroIds, tag });
  }

  removeTagFromHeroes(heroIds: string[], tag: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tags/remove`, { heroIds, tag });
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email`, {
      params: { email }
    });
  }
}
