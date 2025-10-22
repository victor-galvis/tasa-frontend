import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Contract } from '../../models/contract.model';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.base);
  }

  getByUser(userId: number): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.base}/contract/user/${userId}`);
  }

  create(contract: Contract): Observable<Contract> {
    return this.http.post<Contract>(`${this.base}/contract`, contract);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getInvoices(): Observable<any> {
    const mockResponse = {
      status: {
        status: 'OK',
        reason: '00',
        message: 'La petición se ha procesado correctamente',
        date: '2025-09-30T14:31:26-05:00',
      },
      data: [
        {
          id: 402930612,
          status: 'ACTIVE',
          debtor: {
            document: '',
            documentType: '',
            name: 'CR 29 A CL 7 B -91 (INTERIOR 23**)',
            surname: '',
            email: 'gerencia@activosoperativos.com.co',
          },
          payment: {
            reference: '000000004029306112',
            description:
              'Liquidación Tasa de Seguridad julio 2025 Contrato 6587164 - Consumo 195,00KM²',
            amount: {
              taxes: [],
              details: [{ kind: 'subtotal', amount: 17000.0 }],
              currency: 'COP',
              total: 17000.0,
            },
            allowPartial: false,
            subscribe: false,
          },
          altReference: null,
          createdAt: '2025-09-07T11:42:28-05:00',
          expirationDate: '2025-12-31T17:33:19-05:00',
        },
      ],
    };

    return of(mockResponse);
  }
}
