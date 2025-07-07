import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadReceiptComponent } from './read-receipt.component';

describe('ReadReceiptComponent', () => {
  let component: ReadReceiptComponent;
  let fixture: ComponentFixture<ReadReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReadReceiptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReadReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
