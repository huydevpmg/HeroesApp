import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Conversation } from '../../models/conversation.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) { }

  // Create 1on1 conversation (findOrCreate)
  findOrCreate1on1Conversation(participantId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/1on1`, { participantId });
  }

  // Create group conversation
  createConversation(data: Partial<Conversation>): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/`, data);
  }

  // Get all conversations (current user)
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}`).pipe(
      tap(conversations => {
        console.log('Received conversations from API:', conversations);
      })
    );
  }

  // Get conversation by id
  getConversationById(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/${id}`);
  }

  // Update conversation (PATCH)
  updateConversation(id: string, data: Partial<Conversation>): Observable<Conversation> {
    return this.http.patch<Conversation>(`${this.apiUrl}/${id}`, data);
  }

  // Delete conversation (if you want to use this, uncomment backend route)
  // deleteConversation(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`);
  // }
}
