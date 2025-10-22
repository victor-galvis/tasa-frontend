import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface DocumentTypes {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDocumentTypes(): Observable<DocumentTypes[]> {
    return this.http.get<DocumentTypes[]>(`${this.base}/document-types`).pipe(tap((res) => {}));
  }
}
