import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Contract } from '../../models/contract.model';
import { ContractFilter } from '../../models/contract/contract.filter';
import { ContractResponse } from '../../models/contract/contract.response';
import { InvoiceFilter } from '../../models/invoice/invoice.filter';
import { InvoiceResponse } from '../../models/invoice/invoice.response';
import { PendingPaymentFilter } from '../../models/pending-payments/pending.payment.filter';
import { PendingPaymentResponse } from '../../models/pending-payments/pending.payment.response';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

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
    return this.http.delete<void>(`${this.base}/contract/${id}`);
  }

  //alias semántico usado en manage-contracts
  deleteContract(id: number): Observable<void> {
    return this.delete(id);
  }

  // actualiza nombre personalizado y/o dirección de notificación
  updateContract(id: number, payload: {
    name: string;
    newAddress?: any;
  }): Observable<Contract> {
    return this.http.patch<Contract>(`${this.base}/contract/${id}`, payload);
  }

  // consulta cuántos intentos de cambio de notificación se han usado
  getNotificationAttempts(companyId: string | number, agreement: string): Observable<{
    emailAttempts: number;
    addressAttempts: number;
  }> {
    return this.http.get<{ emailAttempts: number; addressAttempts: number }>(
      `${this.base}/notification-update/attempts/${companyId}/${agreement}`
    );
  }

  getInvoices(filters: InvoiceFilter): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(`${this.base}/contract/download-invoices`, {
      filters: filters,
    });
  }

  validateContract(filters: ContractFilter): Observable<ContractResponse> {
    const token = this.authService.getToken();
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<ContractResponse>(
      `${this.base}/contract/validate`,
      { filters },
      { headers }
    );
  }

  pendingPayment(filters: PendingPaymentFilter): Observable<PendingPaymentResponse> {
    return this.http.post<PendingPaymentResponse>(`${this.base}/contract/pending-payments`, {
      filters: filters,
    });
  }
}