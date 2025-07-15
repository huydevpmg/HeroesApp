import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Label } from '../../../shared/enums/models/label.model';
import { LabelService } from '../../services/labels/label.service';

export enum LabelModalState {
  Main = 'main',
  Edit = 'edit',
  Add = 'add',
}

@Component({
  selector: 'app-label-management',
  templateUrl: './label-management.component.html',
  styleUrls: ['./label-management.component.css'],
})
export class LabelManagementComponent {
  @Input() labels: Label[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() labelUpdated = new EventEmitter<void>();

  labelForm: Partial<Label> = { name: '', color: '#FFD600' };
  loading = false;
  showColorTooltip = false;
  modalState: LabelModalState = LabelModalState.Main;
  colors: string[] = [
    '#FFD600',
    '#FF6F61',
    '#4CAF50',
    '#2196F3',
    '#9C27B0',
    '#FF9800',
    '#E91E63',
    '#00B8D9',
    '#FFAB00',
  ];
  public LabelModalState = LabelModalState;

  constructor(private labelService: LabelService) {}

  openEditLabelModal(label: Label) {
    this.labelForm = { ...label };
    this.showColorTooltip = false;
    this.modalState = LabelModalState.Edit;
  }

  openAddLabelModal() {
    this.labelForm = { name: '', color: '#FFD600' };
    this.showColorTooltip = false;
    this.modalState = LabelModalState.Add;
  }

  closeEditLabelModal() {
    this.modalState = LabelModalState.Main;
    this.labelForm = { name: '', color: '#FFD600' };
    this.showColorTooltip = false;
  }

  closeAddLabelModal() {
    this.modalState = LabelModalState.Main;
    this.labelForm = { name: '', color: '#FFD600' };
    this.showColorTooltip = false;
  }

  closeAllModals() {
    this.modalState = LabelModalState.Main;
    this.labelForm = { name: '', color: '#FFD600' };
    this.showColorTooltip = false;
    this.close.emit();
  }

  saveLabel() {
    this.loading = true;
    const isUpdate = !!this.labelForm._id;
    const labelObs = isUpdate
      ? this.labelService.updateLabel(this.labelForm as Label)
      : this.labelService.addLabel(this.labelForm as Label);
    labelObs.subscribe({
      next: () => {
        this.labelUpdated.emit();
        this.loading = false;
        this.modalState = LabelModalState.Main;
      },
      error: () => { this.loading = false; }
    });
  }

  deleteLabel(label: Label) {
    if (!label._id) { return; }
    this.loading = true;
    this.labelService.deleteLabel(label._id).subscribe({
      next: () => {
        this.labelUpdated.emit();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
