import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { UserConversation } from '../../../shared/enums/models/user-conversation.model';

@Injectable({
  providedIn: 'root'
})
export class UserConversationApiService {
  private apiUrl = `${environment.apiUrl}/user-conversations`;

  constructor(private http: HttpClient) { }

  findOrCreate1on1Conversation(participantId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/1on1`, { participantId });
  }

  toggleArchive(userConversationId: string) : Observable<UserConversation> {
    return this.http.put<UserConversation>(`${this.apiUrl}/${userConversationId}/archive`, {})
  }
}
