import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProvinceModel } from '../../models/provice.model';

@Injectable({
  providedIn: 'root',
})
export class ProvinceService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProvinces(): Observable<ProvinceModel[]> {
    return this.http.get<ProvinceModel[]>(`${this.base}/provinces`).pipe(tap((res) => {}));
  }
}
