import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface Company {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.base}/companies`).pipe(tap((res) => {}));
  }
}
