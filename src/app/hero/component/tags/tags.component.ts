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
import { loadTags, createTag, deleteTag } from '../../store/tag/tag.actions';
import { selectAllTags } from '../../store/tag/tag.selectors';
import { addTagToHero, removeTagFromHero } from '../../store/hero/hero.actions';
import { selectAllHeroes } from '../../store/hero/hero.selectors';
import { map, take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadTags());
    this.store.select(selectAllTags).subscribe(tags => {
      this.allTags = tags;
      this.filterTags();
      this.syncSelectedTags();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentHeroTags']) {
      this.syncSelectedTags();
    }
  }

  private syncSelectedTags(): void {
    if (!this.currentHeroTags || this.allTags.length === 0) return;

    if (this.heroIds.length > 1) {
      this.store.select(selectAllHeroes).pipe(take(1)).subscribe(heroes => {
        const selectedHeroes = heroes.filter(h => this.heroIds.includes(h._id));
        if (selectedHeroes.length > 0) {
          const commonTags = selectedHeroes.reduce((common, hero) => {
            return common.filter(tag => hero.tags.includes(tag));
          }, selectedHeroes[0].tags);

          this.selectedTags = this.allTags.filter(tag =>
            commonTags.includes(tag.name)
          );
        }
      });
    } else {
      this.selectedTags = this.allTags.filter(tag =>
        this.currentHeroTags.includes(tag.name)
      );
    }
    this.cdr.markForCheck();
  }

  filterTags(): void {
    const searchTerm = this.tagInputControl.value?.toLowerCase() || '';
    this.filteredTags = this.allTags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm)
    );
  }

  toggleTag(tag: Tag): void {
    const isChecked = this.selectedTags.some(t => t.name === tag.name);

    if (isChecked) {
      this.selectedTags = this.selectedTags.filter(t => t.name !== tag.name);
      this.store.dispatch(removeTagFromHero({ heroIds: this.heroIds, tag: tag.name }));
      this.toastr.success(`Tag "${tag.name}" removed successfully!`);
    } else {
      this.selectedTags.push(tag);
      this.store.dispatch(addTagToHero({ heroIds: this.heroIds, tag: tag.name }));
      this.toastr.success(`Tag "${tag.name}" added successfully!`);
    }

    this.cdr.markForCheck();
  }

  isSelected(tagId: string): boolean {
    return this.selectedTags.some(t => t._id === tagId);
  }

  isIndeterminate(tag: Tag): boolean {
    if (this.heroIds.length <= 1) return false;

    let hasTag = false;
    let missingTag = false;

    this.store.select(selectAllHeroes).pipe(take(1)).subscribe(heroes => {
      const selectedHeroes = heroes.filter(h => this.heroIds.includes(h._id));
      selectedHeroes.forEach(hero => {
        if (hero.tags.includes(tag.name)) {
          hasTag = true;
        } else {
          missingTag = true;
        }
      });
    });

    return hasTag && missingTag;
  }

  onEnter(): void {
    const newTagName = this.tagInputControl.value?.trim();
    if (newTagName && !this.allTags.some(t => t.name.toLowerCase() === newTagName.toLowerCase())) {
      this.store.dispatch(createTag({ name: newTagName }));
      this.tagInputControl.setValue('');
      this.toastr.success(`Tag "${newTagName}" created successfully!`);
    }
  }

  deleteTag(tagId: string): void {
    const tagToDelete = this.allTags.find(t => t._id === tagId);
    if (tagToDelete) {
      this.store.dispatch(deleteTag({ id: tagId }));
      this.toastr.success(`Tag "${tagToDelete.name}" deleted successfully!`);
    }
  }
}
