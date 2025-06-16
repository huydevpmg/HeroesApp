import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Message } from '../../models/message.model';
import { SocketService } from '../socket/socket.service';
import { AuthService } from '../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private authService: AuthService
  ) { }

  // Gửi tin nhắn mới
  sendMessage(conversationId: string, content: string): Observable<Message> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const message: Partial<Message> = {
      conversationId,
      content,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.http.post<Message>(`${this.apiUrl}`, message).pipe(
      tap(msg => {
        this.socketService.sendMessage(msg);
      })
    );
  }

  // Lấy danh sách tin nhắn của một cuộc trò chuyện
  getMessages(conversationId: string): Observable<Message[]> {
    // Backend chỉ có GET /messages, truyền conversationId qua query param
    return this.http.get<Message[]>(`${this.apiUrl}`, {
      params: { conversationId }
    });
  }

  // Cập nhật trạng thái tin nhắn (ví dụ: đã đọc)
  updateMessageStatus(messageId: string, status: string): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${messageId}/status`, { status });
  }

  // Xóa tin nhắn
  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`);
  }

  // Thêm reaction vào tin nhắn
  addReaction(messageId: string, emoji: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${messageId}/reactions`, { emoji }).pipe(
      tap(msg => {
        this.socketService.addReaction(messageId, emoji);
      })
    );
  }

  // Xóa reaction khỏi tin nhắn
  removeReaction(messageId: string): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/${messageId}/reactions`).pipe(
      tap(msg => {
        this.socketService.removeReaction(messageId);
      })
    );
  }
}
