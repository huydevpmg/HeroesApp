import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaMessageComponent } from './media-message.component';

describe('MediaMessageComponent', () => {
  let component: MediaMessageComponent;
  let fixture: ComponentFixture<MediaMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediaMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MediaMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
