import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AddressValidateService {

  private base = `${environment.apiUrl}/address-validate`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  validateAddress(payload: {
    company: string;
    agreement: string;
    address: string;
  }): Observable<any> {

    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.base}/validate`, payload, { headers });
  }
}
