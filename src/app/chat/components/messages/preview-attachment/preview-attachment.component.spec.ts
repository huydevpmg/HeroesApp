import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewAttachmentComponent } from './preview-attachment.component';

describe('PreviewAttachmentComponent', () => {
  let component: PreviewAttachmentComponent;
  let fixture: ComponentFixture<PreviewAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreviewAttachmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
