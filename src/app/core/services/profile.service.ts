import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from '../../auth/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:5001/api/profile';

  constructor(private http: HttpClient) {}

  getProfileByUserId(userId: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: string, data: Partial<UserModel>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, data);
  }
}
