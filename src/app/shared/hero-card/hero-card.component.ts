import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HeroModel } from '../../hero/models/hero.model';

@Component({
  selector: 'app-hero-card',
  templateUrl: './hero-card.component.html',
  styleUrls: ['./hero-card.component.css']
})
export class HeroCardComponent {
  @Input() hero!: HeroModel;
  @Input() isChecked: boolean = false;
  @Output() checkboxChanged = new EventEmitter<{ id: string, checked: boolean }>();

  onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.checkboxChanged.emit({ id: this.hero._id, checked });
  }
}
