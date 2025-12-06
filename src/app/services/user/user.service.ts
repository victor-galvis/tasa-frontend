import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) { }

  existsEmail(email: string) {

    return this.http.post<{ otp: string }>(`${this.base}/users/exists-email`, { email }).pipe(
      tap((res) => {
      })
    );
  }

  resetPassword(email: string, password: string) {
    return this.http.post<{ message: string }>(`${this.base}/users/reset-password`, { email, password }).pipe(
      tap((res) => {
      })
    );
  }
}
