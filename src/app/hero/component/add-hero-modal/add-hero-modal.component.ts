import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HeroService } from '../../service/hero.service';
import { HeroEventsService } from '../../service/hero-events.service';
import { AuthService } from '../../../core/services/auth.service';
import { ageValidator, emailExistsValidator, nameValidator } from '../../../shared/validators/validators';
import { HeroModel } from '../../models/hero.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-hero-modal',
  templateUrl: './add-hero-modal.component.html'
})
export class AddHeroModalComponent {
  heroForm!: FormGroup;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private heroService: HeroService,
    private heroEvents: HeroEventsService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.heroForm = this.fb.group({
      name: ['', [Validators.required, nameValidator()]],
      gender: ['', Validators.required],
      email: ['', {
        validators: [Validators.required],
        asyncValidators: [emailExistsValidator(this.heroService)],
        updateOn: 'blur'
      }],
      age: ['', [Validators.required, ageValidator()]],
      address: ['', Validators.required]
    });
  }

  onSubmit(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId || this.heroForm.invalid) { return };

    const newHero: HeroModel = {
      ...this.heroForm.value,
      owner: userId
    };

    this.heroService.createHero(newHero).subscribe({
      next: () => {
        this.heroEvents.notifyHeroAdded();
        this.toastr.success('Hero added successfully!');
        this.modal.close();
      },
      error: () => {
        this.toastr.error('Failed to add hero');
      }
    });
  }

  firstErrorKey(errors: any): string | null {
    if (!errors) return null;
    const keys = Object.keys(errors);
    return keys.length > 0 ? keys[0] : null;
  }

}
