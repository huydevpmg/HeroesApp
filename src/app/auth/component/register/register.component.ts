import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterRequestModel } from '../../models/auth-request.model';
import { AuthService } from '../../../core/services/auth.service';
import { emailValidator, nameValidator } from '../../../shared/validators/validators';

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
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, emailValidator()]],
      fullName: ['', [Validators.required, nameValidator()]],
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    const credentials: RegisterRequestModel = this.registerForm.value;
    this.authService.register(credentials).subscribe({
      next: () => {
        alert('Register successfully!');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.errorMessage = 'Login failed';
      },
    });
  }
}
