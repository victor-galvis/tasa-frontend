import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProvinceModel } from '../../models/provice.model';
import { CityModel } from '../../models/city.model';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCities(provinceId: number): Observable<CityModel[]> {
    return this.http
      .get<CityModel[]>(`${this.base}/cities/province/${provinceId}`)
      .pipe(tap((res) => {}));
  }
}
