import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HeroModel } from '../../hero/models/hero.model';

@Component({
  selector: 'app-hero-card',
  templateUrl: './hero-card.component.html',
  styleUrls: ['./hero-card.component.css']
})
export class HeroCardComponent implements OnInit {
  @Input() hero!: HeroModel;
  @Input() isChecked = false;
  @Input() showCheckbox = true;
  @Input() canEditTags = true;
  @Input() isMyHeroesView = false;

  @Output() checkboxChanged = new EventEmitter<{ id: string; checked: boolean }>();
  @Output() tagsUpdated = new EventEmitter<string[]>();

  ngOnInit() {
  }

  onCheckboxChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.checkboxChanged.emit({ id: this.hero._id, checked });
  }
}
