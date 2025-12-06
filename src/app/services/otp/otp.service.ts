import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OtpService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) { }

  generateOtp(email: string, type: string) {

    return this.http.post<{ otp: string }>(`${this.base}/otp/generate-otp`, { email, type }).pipe(
      tap((res) => {
      })
    );
  }

  generateOtpPasswordRecovery(email: string, type: string) {

    return this.http.post<{ otp: string }>(`${this.base}/otp/generate-otp-forgot-password`, { email, type }).pipe(
      tap((res) => {
      })
    );
  }

  verifyOtp(email: string, code: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.base}/otp/verify-otp`, { email, code });
  }
}
