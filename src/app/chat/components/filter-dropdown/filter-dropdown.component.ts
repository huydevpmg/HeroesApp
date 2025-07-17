import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Label } from '../../../shared/enums/models/label.model';

@Component({
  selector: 'app-filter-dropdown',
  templateUrl: './filter-dropdown.component.html',
  styleUrls: ['./filter-dropdown.component.css'],
})
export class FilterDropdownComponent {
  @Input() labels: Label[] = [];
  @Output() filterChange = new EventEmitter<{
    status: string;
    labels: string[];
  }>();

  selectedStatus: string = 'all';
  selectedLabel: Label | undefined;
  selectedLabels: string[] = [];

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.emitFilter();
  }

  selectLabel(label: any) {
    this.selectedLabel = label;
    this.emitFilter();
  }

  toggleLabel(labelId: string) {
    if (this.selectedLabels.includes(labelId)) {
      this.selectedLabels = this.selectedLabels.filter((id) => id !== labelId);
    } else {
      this.selectedLabels = [...this.selectedLabels, labelId];
    }
    this.emitFilter();
  }

  emitFilter() {
    this.filterChange.emit({
      status: this.selectedStatus,
      labels: this.selectedLabels,
    });
  }
}
