import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Label } from '../../../shared/enums/models/label.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private apiUrl = `${environment.apiUrl}/labels`;

  constructor(private http: HttpClient) {}

  getLabels(): Observable<Label[]> {
    return this.http.get<Label[]>(this.apiUrl);
  }

  addLabel(label: Label): Observable<Label> {
    return this.http.post<Label>(this.apiUrl, label);
  }

  updateLabel(label: Label): Observable<Label> {
    return this.http.put<Label>(`${this.apiUrl}/${label._id}`, label);
  }

  deleteLabel(labelId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${labelId}`);
  }

  reloadLabels(): Observable<Label[]> {
    return this.getLabels();
  }
}
