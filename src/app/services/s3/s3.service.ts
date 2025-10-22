import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PdfResponse } from '../../models/pdf.model';

@Injectable({
  providedIn: 'root',
})
export class S3Service {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPdf(): Observable<PdfResponse> {
    return this.http.get<PdfResponse>(this.base + '/files/pdf');
  }
}
