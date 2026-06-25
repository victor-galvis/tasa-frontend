import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';

interface AddressValidate {
  id: number;
  company: string;
  agreement: string;
  user_id: number;
  correct_address: string;
  status: string;
  attempts: number;
}

@Component({
  selector: 'app-desbloquear',
  standalone: false,
  templateUrl: './desbloquear.component.html',
  styleUrls: ['./desbloquear.component.scss'],
})
export class DesbloquearComponent implements OnInit {
  records: AddressValidate[] = [];
  filtered: AddressValidate[] = [];
  searchText = '';
  loading = false;
  toastMsg = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;
  confirmId: number | null = null;
  confirmText = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadBlocked();
    }
  }

  get headers() {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadBlocked() {
    this.loading = true;
    this.http
      .get<AddressValidate[]>(`${environment.apiUrl}/contract/blocked`, {
        headers: this.headers,
      })
      .subscribe({
        next: (data) => {
          this.records = data;
          this.filtered = [...data]; // ← spread para evitar referencia
          this.loading = false;
        },
        error: () => {
          this.toast('error', 'No se pudo cargar la lista');
          this.loading = false;
        },
      });
  }

  filter() {
    const q = this.searchText.toLowerCase().trim();
    if (!q) {
      this.filtered = [...this.records];
      return;
    }
    this.filtered = this.records.filter(
      (r) =>
        String(r.agreement).toLowerCase().includes(q) ||
        String(r.company).toLowerCase().includes(q) ||
        String(r.user_id).includes(q) ||
        (r.correct_address || '').toLowerCase().includes(q)
    );
  }

  openConfirm(r: AddressValidate) {
    this.confirmId = r.id;
    this.confirmText = `Agreement ${r.agreement} · Usuario ${r.user_id}`;
  }

  cancelConfirm() {
    this.confirmId = null;
  }

  deleteRecord() {
    if (!this.confirmId) return;
    const id = this.confirmId;
    this.http
      .delete<{ message: string }>(
        `${environment.apiUrl}/contract/unblock/${id}`,
        { headers: this.headers }
      )
      .subscribe({
        next: (res) => {
          this.records = this.records.filter((r) => r.id !== id);
          this.filtered = [...this.records];
          this.confirmId = null;
          this.toast('success', res.message || 'Contrato desbloqueado correctamente');
        },
        error: () => {
          this.confirmId = null;
          this.toast('error', 'No se pudo desbloquear el registro');
        },
      });
  }

  toast(type: 'success' | 'error', msg: string) {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3500);
  }
}