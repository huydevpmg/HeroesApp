import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserConversation } from '../../../shared/enums/models/user-conversation.model';

@Injectable({
  providedIn: 'root'
})
export class UserConversationApiService {
  private apiUrl = `${environment.apiUrl}/user-conversations`;

  constructor(private http: HttpClient) { }

  toggleArchive(userConversationId: string) : Observable<UserConversation> {
    return this.http.put<UserConversation>(`${this.apiUrl}/${userConversationId}/archive`, {})
  }

  addLabel(userConversationId: string, label: string): Observable<UserConversation> {
    return this.http.post<UserConversation>(`${this.apiUrl}/${userConversationId}/labels`, { label });
  }

  removeLabel(userConversationId: string, label: string): Observable<UserConversation> {
    return this.http.delete<UserConversation>(`${this.apiUrl}/${userConversationId}/labels`, { body: { label } });
  }

  markAsRead(userConversationId: string, messageId: string): Observable<UserConversation> {
    return this.http.put<UserConversation>(`${this.apiUrl}/${userConversationId}/read`, { messageId });
  }

  togglePin(userConversationId: string): Observable<UserConversation> {
    return this.http.put<UserConversation>(`${this.apiUrl}/${userConversationId}/pin`, {});
  }

  updateUserConversation(userConversationId: string, updateData: Partial<UserConversation>): Observable<UserConversation> {
    return this.http.put<UserConversation>(`${this.apiUrl}/${userConversationId}`, updateData);
  }
}
