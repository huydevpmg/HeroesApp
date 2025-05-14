// src/app/auth/components/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequestModel } from '../../models/auth-request.model';

@Component({
  selector: 'app-login',
  styleUrl:'./login.component.css',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const credentials: LoginRequestModel = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: (res) => {
        console.log('Login response:', res);
        this.authService.setAccessToken(res.accessToken);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);  // ✅ Debug error
        this.errorMessage = err.error?.message || 'Login failed';
      },
    });
  }
}
