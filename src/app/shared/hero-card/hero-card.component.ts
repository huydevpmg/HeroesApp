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

  defaultTags = [
    { label: '💪 Strong', value: 'Strong' },
    { label: '🧠 Smart', value: 'Smart' },
    { label: '⚡ Fast', value: 'Fast' },
    { label: '🏆 Legend', value: 'Legend' }
  ];

  selectedTags: string[] = [];

  ngOnInit() {
    this.selectedTags = [...this.hero.tags];
  }

  onCheckboxChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.checkboxChanged.emit({ id: this.hero._id, checked });
  }

  onTagsChange(newTags: string[]) {
    if (!this.canEditTags) return;
    this.selectedTags = [...newTags];
    this.hero.tags = [...this.selectedTags];
    this.tagsUpdated.emit(this.hero.tags);
  }

  toggleTag(tag: string) {
    if (!this.canEditTags) return;
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      if (this.selectedTags.length < 4) {
        this.selectedTags.push(tag);
      }
    }
    this.hero.tags = [...this.selectedTags];
    this.tagsUpdated.emit(this.hero.tags);
  }

  getTagLabel(tag: string): string {
    return this.defaultTags.find(t => t.value === tag)?.label || tag;
  }
}
