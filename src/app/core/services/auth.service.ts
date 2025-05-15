// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { getUserIdFromToken } from '../../utils/jwt-utils';
import { LoginRequestModel, RegisterRequestModel } from '../../auth/models/auth-request.model';
import { AuthResponseModel } from '../../auth/models/auth-response.model';
import { UserModel } from '../../auth/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5001/api/auth';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(credentials: LoginRequestModel): Observable<AuthResponseModel> {
    return this.http.post<AuthResponseModel>(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }


  register(data: RegisterRequestModel): Observable<UserModel> {
    return this.http.post<UserModel>(`${this.apiUrl}/register`, data, { withCredentials: true });
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true });
  }


  logout(): void {
    this.cookieService.delete('accessToken', '/');
    this.cookieService.delete('refreshToken', '/');
  }


  getAccessToken(): string | null {
    return this.cookieService.get('accessToken') || null;
  }

  setAccessToken(token: string): void {
    this.cookieService.set('accessToken', token, { path: '/' });
  }

  getCurrentUserId(): string | null {
  const token = this.getAccessToken();
  return token ? getUserIdFromToken(token) : null;
}

}
