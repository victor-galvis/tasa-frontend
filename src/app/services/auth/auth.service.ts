import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: any): Observable<any> {
    return this.http.post(`${this.base}/users/register`, payload);
  }

  login(email: string, password: string) {
    return this.http
      .post<{ access_token: string; user?: any }>(`${this.base}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res && res.access_token) {
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(res.user || {}));

            this.router.navigate(['/home']);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

 getToken(): string | null {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

 isLoggedIn(): boolean {
  return typeof window !== 'undefined' && !!this.getToken();
}
  getUser() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  }
}
