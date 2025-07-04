import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { map, Observable, combineLatest } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { SocketService } from '../../services/socket/socket.service';
import { ConversationService } from '../../services/conversation/conversation.service';

@Component({
  selector: 'app-chat-info',
  templateUrl: './chat-info.component.html',
  styleUrls: ['./chat-info.component.css']
})
export class ChatInfoComponent implements OnInit {
  @Input() isVisible = true;
  @Output() close = new EventEmitter<void>();

  selectedConversation$: Observable<Conversation | null | undefined>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  onlineUsers$: Observable<string[]>;
  ownerId = this.authService.getCurrentUserId();
  conversationInfo$: Observable<any>;
  selectedMember: any = null;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private conversationService: ConversationService
  ) {
    this.selectedConversation$ = this.conversationService.selectedConversation$;
    this.loading$ = this.conversationService.loading$;
    this.error$ = this.conversationService.error$;
    this.onlineUsers$ = this.socketService.onOnlineUserIds().pipe(
      map(set => Array.from(set))
    );
    this.conversationInfo$ = combineLatest([
      this.selectedConversation$,
      this.onlineUsers$
    ]).pipe(
      map(([conversation, onlineUsers]) => {
        if (!conversation) { return null };
        return {
          conversationName: conversation.name,
          conversationAvatar: conversation.avatar,
          membersCount: conversation.participants?.length || 0,
          teamMembers: (conversation.participants || []).map((participant: any) => {
            return {
              id: participant._id,
              fullName: participant.fullName,
              email: participant.email,
              username: participant.username,
              role: participant._id === this.ownerId ? 'Owner' : 'Member',
              avatar: participant.avatar || 'https://st4.depositphotos.com/34939642/39599/v/450/depositphotos_395993304-stock-illustration-avatar-man-long-hair-vector.jpg',
              status: onlineUsers.includes(participant._id) ? 'online' : 'offline'
            }
          }),
          sharedImages: this.getSharedImages(),
          sharedFiles: this.getSharedFiles()
        };
      })
    );
  }

  ngOnInit() {
    this.conversationService.loadConversations();
    this.conversationService.getAllUsers();
  }

  onClose() {
    this.close.emit();
  }

  viewProfile(member: any) {
    console.log('View profile:', member);
  }

  showUserProfile(member: any) {
    this.selectedMember = member;
  }

  closeUserProfile() {
    this.selectedMember = null;
  }

  sendMessage(member: any) {
    console.log('Send message to:', member);
  }

  viewImage(image: any) {
    console.log('View image:', image);
  }

  viewAllImages() {
    console.log('View all images');
  }

  downloadFile(file: any) {
    console.log('Download file:', file);
  }

  viewFile(file: any) {
    console.log('View file:', file);
  }

  onLeaveGroup(selectedConv: Conversation) {
    if (selectedConv && selectedConv._id) {
      this.conversationService.leaveGroup(selectedConv._id);
    }
  }

  private getSharedImages() {
    return this.getMockSharedImages();
  }

  private getSharedFiles() {
    return this.getMockSharedFiles();
  }

  private getMockSharedImages() {
    return [
      {
        id: 1,
        name: 'design-mockup.png',
        url: 'https://picsum.photos/300/300?random=1'
      },
      {
        id: 2,
        name: 'wireframe.jpg',
        url: 'https://picsum.photos/300/300?random=2'
      },
      {
        id: 3,
        name: 'screenshot.png',
        url: 'https://picsum.photos/300/300?random=3'
      },
      {
        id: 4,
        name: 'prototype.png',
        url: 'https://picsum.photos/300/300?random=4'
      }
    ];
  }

  private getMockSharedFiles() {
    return [
      {
        id: 1,
        name: 'Project Requirements.pdf',
        type: 'pdf',
        size: '2.5 MB',
        icon: 'bi-file-earmark-pdf-fill',
        color: '#dc3545',
        uploadDate: '2 days ago'
      },
      {
        id: 2,
        name: 'Design Assets.zip',
        type: 'zip',
        size: '15.8 MB',
        icon: 'bi-file-earmark-zip-fill',
        color: '#fd7e14',
        uploadDate: '3 days ago'
      }
    ];
  }
}
