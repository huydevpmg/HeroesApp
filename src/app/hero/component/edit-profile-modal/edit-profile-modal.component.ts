import { AuthService } from './../../../core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileService } from '../../../core/services/profile.service';
import { emailExistsValidator } from '../../../shared/validators/validators';
import { HeroService } from '../../service/hero.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html'
})
export class EditProfileModalComponent implements OnInit {
  profileForm!: FormGroup;
  loading: boolean = true;
  originalEmail: string = '';
  constructor(
    private heroService: HeroService,
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [emailExistsValidator(this.profileService)],
        updateOn: 'blur'
      }],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      originalEmail: ['']
    });

    const userId = this.authService.getCurrentUserId();

    if (userId) {
      this.profileService.getProfileByUserId(userId).subscribe({
        next: (profile) => {
          this.profileForm.patchValue({
            username: profile.username || '',
            email: profile.email || '',
            fullName: profile.fullName || '',
            originalEmail: profile.email || ''
          });
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Failed to load profile information');
          this.loading = false;
        }
      });
    } else {
      this.toastr.error('User ID not found');
      this.modal.dismiss();
    }
  }

  updateProfile(): void {
    const userId = this.authService.getCurrentUserId();

    if (userId && this.profileForm.valid) {
      const formData = this.profileForm.value;
      delete formData.originalEmail;

      this.profileService.updateProfile(userId, formData).subscribe({
        next: () => {
          this.toastr.success('Profile updated successfully!');
          this.modal.close();
        },
        error: () => {
          this.toastr.error('Failed to update profile');
        }
      });
    }
  }

  firstErrorKey(errors: any): string | null {
    if (!errors) return null;
    const keys = Object.keys(errors);
    return keys.length > 0 ? keys[0] : null;
  }
}
