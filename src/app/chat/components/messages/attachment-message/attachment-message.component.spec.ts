import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentMessageComponent } from './attachment-message.component';

describe('AttachmentMessageComponent', () => {
  let component: AttachmentMessageComponent;
  let fixture: ComponentFixture<AttachmentMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttachmentMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttachmentMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
