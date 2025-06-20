// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { LoginRequestModel, RegisterRequestModel } from '../../auth/models/auth-request.model';
import { AuthResponseModel } from '../../auth/models/auth-response.model';
import { User } from '../../auth/models/user.model';
import { getUserIdFromToken } from '../../shared/utils/jwt-utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  login(credentials: LoginRequestModel): Observable<AuthResponseModel> {
    return this.http.post<AuthResponseModel>(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }


  register(data: RegisterRequestModel): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data, { withCredentials: true });
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true });
  }


  logout(): void {
    this.cookieService.delete('accessToken', '/');
    this.cookieService.delete('refreshToken', '/');
    window.location.href = '/auth/login'
  }


  getAccessToken(): string | null {
    return this.cookieService.get('accessToken') || null;
  }

  setAccessToken(token: string): void {
    this.cookieService.set('accessToken', token, {
      path: '/',
      secure: false, // Set to true in production with HTTPS
      sameSite: 'Strict',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  getCurrentUserId(): string | null {
    const token = this.getAccessToken();
    return token ? getUserIdFromToken(token) : null;
  }
}
