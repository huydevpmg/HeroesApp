import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Conversation } from '../../../shared/enums/models/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationApiService {
  private apiUrl = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) { }


  createConversation(data: Partial<Conversation>): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/`, data);
  }

  getConversations(page: number = 1, limit: number = 20): Observable<{ conversations: Conversation[], total: number, page: number, totalPages: number }> {
    return this.http.get<{ conversations: Conversation[], total: number, page: number, totalPages: number }>(`${this.apiUrl}?page=${page}&limit=${limit}`);
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
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  addMembersToGroup(conversationId: string, memberIds: string[]): Observable<Conversation> {
    return this.http.post<{ message: string, data: { conversation: Conversation, addedMembers: string[], systemMessage: any } }>(`${this.apiUrl}/${conversationId}/members`, { memberIds })
      .pipe(map((response: any) => response.data.conversation));
  }

  removeMemberFromGroup(conversationId: string, userId: string): Observable<Conversation> {
    return this.http.delete<{ message: string, data: { conversation: Conversation, removedUserId: string, systemMessage: any } }>(`${this.apiUrl}/${conversationId}/members`, {
      body: { userId }
    }).pipe(map((response: any) => response.data.conversation));
  }

  leaveGroup(conversationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/leave/${conversationId}`, {});
  }

  clearConversation(conversationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${conversationId}/clear`, {});
  }

  // deleteConversation(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`);
  // }
}
