import { TestBed } from '@angular/core/testing';

import { MessageReadReceiptService } from './message-read-receipt.service';

describe('MessageReadReceiptService', () => {
  let service: MessageReadReceiptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageReadReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
