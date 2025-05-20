import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag } from '../models/tag.model';

@Injectable({ providedIn: 'root' })
export class TagService {
  private apiUrl = 'http://localhost:5000/api/tags';

  constructor(private http: HttpClient) { }

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  createTag(name: string): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, { name });
  }

  updateTag(id: string, data: Partial<Tag>): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}`, data);
  }

  deleteTag(id: string): Observable<{ message: string; tag: Tag }> {
    return this.http.delete<{ message: string; tag: Tag }>(`${this.apiUrl}/${id}`);
  }

  getTagStyle(name: string): Observable<{ color: string; icon: string }> {
    const params = new HttpParams().set('name', name);
    return this.http.get<{ color: string; icon: string }>(`${this.apiUrl}/style`, { params });
  }
}
