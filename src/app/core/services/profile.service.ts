import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from '../../auth/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:4000/api/profile';

  constructor(private http: HttpClient) { }

  getProfileByUserId(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: string, data: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, data);
  }
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email`, {
      params: { email }
    }).pipe(
      map(res => res.exists)
    );
  }
}