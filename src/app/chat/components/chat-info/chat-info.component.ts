import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-chat-info',
    templateUrl: './chat-info.component.html',
    styleUrls: ['./chat-info.component.css']
})
export class ChatInfoComponent {
    @Input() isVisible = false;
    @Output() close = new EventEmitter<void>();

    // Mock data
    chatInfo = {
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1',
        status: 'Online',
        lastSeen: 'Active now',
        about: 'UI/UX Designer at Heroes Inc. Love creating beautiful interfaces and experiences.',
        sharedMedia: [
            { url: 'https://picsum.photos/200/200?random=1', type: 'image' },
            { url: 'https://picsum.photos/200/200?random=2', type: 'image' },
            { url: 'https://picsum.photos/200/200?random=3', type: 'image' },
            { url: 'https://picsum.photos/200/200?random=4', type: 'image' },
            { url: 'https://picsum.photos/200/200?random=5', type: 'image' },
            { url: 'https://picsum.photos/200/200?random=6', type: 'image' }
        ],
        sharedFiles: [
            { name: 'Project_Proposal.pdf', type: 'pdf', size: '2.5 MB', icon: 'bi-file-earmark-pdf' },
            { name: 'Design_Assets.zip', type: 'zip', size: '15.8 MB', icon: 'bi-file-earmark-zip' },
            { name: 'Meeting_Notes.docx', type: 'doc', size: '1.2 MB', icon: 'bi-file-earmark-word' }
        ]
    };

    onClose() {
        this.close.emit();
    }
}
