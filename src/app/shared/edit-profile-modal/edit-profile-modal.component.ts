import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { emailValidator } from '../utils/validators';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html'
})
export class EditProfileModalComponent implements OnInit {
  profileForm!: FormGroup;
  loading: boolean = true;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, emailValidator()]],
      fullName: ['', Validators.required]
    });

    const userId = this.authService.getCurrentUserId();

    if (userId) {
      this.profileService.getProfileByUserId(userId).subscribe({
        next: (profile) => {
          console.log(profile);
          this.profileForm.patchValue({
            username: profile.username || '',
            email: profile.email || '',
            fullName: profile.fullName || ''
          });
          this.loading = false;
        },
        error: () => {
          alert('Failed to load profile');
          this.loading = false;
        }
      });
    } else {
      alert('User ID not found.');
      this.modal.dismiss();
    }
  }

  updateProfile(): void {
    const userId = this.authService.getCurrentUserId();

    if (userId && this.profileForm.valid) {
      this.profileService.updateProfile(userId, this.profileForm.value).subscribe({
        next: () => {
          alert('Profile updated!');
          this.modal.close();
        },
        error: () => alert('Failed to update profile')
      });
    }
  }
}
