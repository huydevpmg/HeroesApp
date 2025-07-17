import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReactionApiService {
  private baseUrl = `${environment.apiUrl}/reaction`;

  constructor(private http: HttpClient) {}

  addReaction(messageId: string, emoji: string, conversationId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, { messageId, emoji, conversationId });
  }

  removeReaction(messageId: string, emoji: string, conversationId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/remove`, { messageId, emoji, conversationId });
  }

  getReactions(messageId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${messageId}`);
  }
}
