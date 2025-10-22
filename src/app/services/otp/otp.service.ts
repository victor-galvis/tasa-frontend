import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OtpService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generateOtp(email: string) {
    return this.http.post<{ otp: string }>(`${this.base}/otp/generate-otp`, { email }).pipe(
      tap((res) => {
        console.log('OTP enviado:', res);
      })
    );
  }

  verifyOtp(email: string, code: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.base}/otp/verify-otp`, { email, code });
  }
}
