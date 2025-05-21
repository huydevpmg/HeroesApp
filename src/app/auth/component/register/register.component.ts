import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterRequestModel } from '../../models/auth-request.model';
import { AuthService } from '../../../core/services/auth.service';
import { emailExistsValidator, nameValidator, strongPasswordValidator, usernameValidator } from '../../../shared/validators/validators';
import { ProfileService } from '../../../core/services/profile.service'; // 💡 phải inject service check email
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, usernameValidator()]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      email: ['', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [emailExistsValidator(this.profileService)],
        updateOn: 'blur'
      }],
      fullName: ['', [Validators.required, nameValidator()]]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  firstErrorKey(errors: any): string | null {
    if (!errors) return null;
    const keys = Object.keys(errors);
    return keys.length > 0 ? keys[0] : null;
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    const credentials: RegisterRequestModel = this.registerForm.value;
    this.authService.register(credentials).subscribe({
      next: () => {
        this.toastr.success('Registration successful!');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed';
        this.toastr.error(this.errorMessage);
      }
    });
  }
}
