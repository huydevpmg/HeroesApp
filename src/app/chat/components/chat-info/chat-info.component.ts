import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { map, Observable, combineLatest, take, switchMap, of } from 'rxjs';
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
  showAddMemberModal = false;
  showRemoveMemberModal = false;
  memberToRemove: string | null = null;
  allUsers$: Observable<any[]>;
  selectedUsersToAdd: string[] = [];
  isRemovingMember = false;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private conversationService: ConversationService
  ) {
    this.selectedConversation$ = this.conversationService.selectedConversation$;
    this.loading$ = this.conversationService.loading$;
    this.error$ = this.conversationService.error$;
    this.allUsers$ = this.conversationService.allUsers$;
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
          createdBy: conversation.createdBy, // Add createdBy for permission checks
          teamMembers: (conversation.participants || []).map((participant: any) => {
            return {
              id: participant._id,
              fullName: participant.fullName,
              email: participant.email,
              username: participant.username,
              role: participant._id === conversation.createdBy ? 'Owner' : 'Member',
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

  // Member management methods
  openAddMemberModal() {
    this.showAddMemberModal = true;
  }

  closeAddMemberModal() {
    this.showAddMemberModal = false;
    this.selectedUsersToAdd = [];
  }

  toggleUserSelection(user: any) {
    const index = this.selectedUsersToAdd.indexOf(user._id);
    if (index > -1) {
      this.selectedUsersToAdd.splice(index, 1);
    } else {
      this.selectedUsersToAdd.push(user._id);
    }
  }

  isUserSelected(user: any): boolean {
    return this.selectedUsersToAdd.includes(user._id);
  }

  addSelectedMembers() {
    if (this.selectedUsersToAdd.length === 0) {
      return;
    }

    this.selectedConversation$.pipe(
      take(1),
      switchMap(conversation => {
        if (conversation && conversation._id) {
          this.conversationService.addMembersToGroup(conversation._id, this.selectedUsersToAdd);
          this.closeAddMemberModal();
        }
        return of(null);
      })
    ).subscribe();
  }

  // Open modal to confirm member removal
  showRemoveModal(memberId: string) {
    this.memberToRemove = memberId;
    this.showRemoveMemberModal = true;
  }

  // Close the remove member modal
  closeRemoveModal() {
    this.showRemoveMemberModal = false;
    this.memberToRemove = null;
  }

  // Execute member removal after confirmation
  removeMember() {
    if (this.isRemovingMember || !this.memberToRemove) {
      return;
    }

    const memberId = this.memberToRemove;
    this.isRemovingMember = true;

    this.selectedConversation$.pipe(
      take(1),
      switchMap(conversation => {
        if (conversation && conversation._id) {
          // Check if user is still in the conversation
          const isStillMember = conversation.participants?.some((p: any) => p._id === memberId);
          if (!isStillMember) {
            console.warn('User is no longer a member of this group');
            this.isRemovingMember = false;
            this.closeRemoveModal();
            return of(null);
          }

          this.conversationService.removeMemberFromGroup(conversation._id, memberId);
        }
        return of(null);
      })
    ).subscribe({
      complete: () => {
        // Reset flag after a delay to allow UI to update
        setTimeout(() => {
          this.isRemovingMember = false;
          this.closeRemoveModal();
        }, 1000);
      },
      error: (error) => {
        console.error('Error removing member:', error);
        this.isRemovingMember = false;
        this.closeRemoveModal();
      }
    });
  }

  getAvailableUsers() {
    return combineLatest([this.allUsers$, this.selectedConversation$]).pipe(
      map(([users, conversation]) => {
        if (!users || !conversation) {
          return [];
        }

        // Get the participant IDs from the current conversation
        const participantIds = conversation.participants?.map((p: any) => p._id) || [];

        // Filter out users who are already in the conversation
        return users.filter(user => {
          return user && user._id && !participantIds.includes(user._id);
        });
      })
    );
  }

  canManageMembers(): boolean {
    // Check if current user is the owner or has permission to manage members
    let canManage = false;

    this.conversationInfo$.pipe(take(1)).subscribe(info => {
      if (info && info.createdBy) {
        canManage = info.createdBy === this.ownerId;
      }
    });

    return canManage;
  }

  isCurrentUserOwner(): boolean {
    let isOwner = false;

    this.conversationInfo$.pipe(take(1)).subscribe(info => {
      if (info && info.createdBy) {
        isOwner = info.createdBy === this.ownerId;
      }
    });

    return isOwner;
  }

  isSelectedMemberOwner(): boolean {
    if (!this.selectedMember) {
      return false;
    }

    let isOwner = false;
    this.conversationInfo$.pipe(take(1)).subscribe(info => {
      if (info && info.createdBy) {
        isOwner = this.selectedMember.id === info.createdBy;
      }
    });

    return isOwner;
  }
}
