import { TestBed } from '@angular/core/testing';

import { UserConversationService } from './user-conversation.service';

describe('UserConversationService', () => {
  let service: UserConversationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserConversationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
