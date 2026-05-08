import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ContractService } from '../../services/contracts/contract.service';
import { AuthService } from '../../services/auth/auth.service';
import { Contract } from '../../models/contract/contract.model';
import { PendingPaymentFilter } from '../../models/pending-payments/pending.payment.filter';
import { PendingPaymentData } from '../../models/pending-payments/pending.payment.response';

@Component({
  selector: 'app-pending-payments',
  standalone: false,
  templateUrl: './pending-payments.html',
  styleUrl: './pending-payments.css',
})
export class PendingPayments implements OnInit {
  user: any;
  pendingPayments: PendingPaymentData[] = [];
  loading = true;
  contracts: Contract[] = [];
  openSelect = false;
  isGridView = false;
  dots = Array(6).fill(0);

  filters: PendingPaymentFilter = {
    company: '',
    agreement: '',
    documentType: '',
    document: '',
  };

  constructor(
    private contractService: ContractService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.user = this.authService.getUser();
    if (!this.user) return;

    this.filters.document = this.user.document;
    this.filters.documentType = this.user.documentType;

    this.loadPendingPayments();
    this.loadContracts();
  }

  onChangeContrato(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const contratoSeleccionado = this.contracts.find((c) => c.id === Number(value));
    if (contratoSeleccionado) {
      this.filters.company = contratoSeleccionado.companyId;
      this.filters.agreement = contratoSeleccionado.number;
      this.loadPendingPayments();
    }
  }

  onFocus() { this.openSelect = true; }
  onBlur() { setTimeout(() => (this.openSelect = false), 0); }

  loadPendingPayments() {
    this.contractService.pendingPayment(this.filters).subscribe((response) => {
      this.pendingPayments = response.data;
    });
  }

  loadContracts() {
    this.contractService.getByUser(this.user.id).subscribe({
      next: (data) => { this.contracts = data; },
      error: (err) => {}
    });
  }

  actualizarTotal() {}

  toggleView() {
    this.isGridView = !this.isGridView;
  }
}