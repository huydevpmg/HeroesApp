import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Conversation } from '../../../shared/enums/models/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationApiService {
  private apiUrl = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) { }

  findOrCreate1on1Conversation(participantId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/1on1`, { participantId });
  }

  createConversation(data: Partial<Conversation>): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/`, data);
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}`)
  }

  getConversationById(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/${id}`);
  }

  updateConversation(id: string, data: Partial<Conversation>): Observable<Conversation> {
    return this.http.patch<Conversation>(`${this.apiUrl}/${id}`, data);
  }

  updateLastAttachmentName(conversationId: string, lastAttachmentName: string): Observable<Conversation> {
    return this.http.patch<Conversation>(`${this.apiUrl}/${conversationId}/last-attachment`, { lastAttachmentName });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.authService}/api/profile`);
  }

  // deleteConversation(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`);
  // }
}
