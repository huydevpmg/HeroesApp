import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Tag } from '../../models/tag.model';
import { loadTags, createTag } from '../../store/tag/tag.actions';
import { selectAllTags } from '../../store/tag/tag.selectors';
import { addTagToHero, removeTagFromHero } from '../../store/hero/hero.actions';
import { selectAllHeroes } from '../../store/hero/hero.selectors';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
})
export class TagsComponent implements OnInit, OnChanges {
  @Input() heroIds: string[] = [];
  @Input() currentHeroTags: string[] = [];

  tagInputControl = new FormControl('');
  allTags: Tag[] = [];
  filteredTags: Tag[] = [];
  selectedTags: Tag[] = [];
  debugMode = false;

  constructor(private store: Store, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.store.dispatch(loadTags());

    this.store.select(selectAllTags).subscribe(tags => {
      this.allTags = tags;
      this.filteredTags = [...tags];
      this.syncSelectedTags();
    });

    this.tagInputControl.valueChanges.subscribe(() => this.filterTags());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentHeroTags']) {
      this.syncSelectedTags();
    }
  }

  private syncSelectedTags(): void {
    if (!this.currentHeroTags || this.allTags.length === 0) return;

    this.selectedTags = this.allTags.filter(tag =>
      this.currentHeroTags.includes(tag.name)
    );
    this.cdr.markForCheck();
  }

  filterTags(): void {
    const keyword = this.tagInputControl.value?.toLowerCase().trim() || '';
    this.filteredTags = this.allTags.filter(tag =>
      tag.name.toLowerCase().includes(keyword)
    );
  }

  toggleTag(tag: Tag): void {
    const isChecked = this.selectedTags.some(t => t.name === tag.name);

    if (isChecked) {
      this.selectedTags = this.selectedTags.filter(t => t.name !== tag.name);

      if (this.heroIds?.length) {
        this.heroIds.forEach(heroId => {
          this.store.dispatch(removeTagFromHero({ heroId, tag: tag.name }));
        });
      }
    } else {
      this.selectedTags.push(tag);

      if (this.heroIds?.length) {
        this.heroIds.forEach(heroId => {
          this.store.dispatch(addTagToHero({ heroId, tag: tag.name }));
        });
      }
    }
  }

  isSelected(tagId: string): boolean {
    return this.selectedTags.some(t => t._id === tagId);
  }

  onEnter(): void {
    const name = this.tagInputControl.value?.trim();
    if (!name) {
      console.warn('Tag name cannot be empty');
      return;
    }

    const exists = this.allTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      this.toggleTag(exists);
    } else {
      this.store.dispatch(createTag({ name }));
    }

    this.tagInputControl.setValue('');
  }
}
