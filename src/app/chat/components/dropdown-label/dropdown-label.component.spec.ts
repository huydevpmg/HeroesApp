import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownLabelComponent } from './dropdown-label.component';

describe('DropdownLabelComponent', () => {
  let component: DropdownLabelComponent;
  let fixture: ComponentFixture<DropdownLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropdownLabelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DropdownLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
