import { Component } from '@angular/core';
import { ContractService } from '../../services/contracts/contract.service';
import { AuthService } from '../../services/auth/auth.service';
import { Contract } from '../../models/contract/contract.model';
import { PendingPaymentFilter } from '../../models/pending-payments/pending.payment.filter';
import { PendingPaymentData, PendingPaymentResponse } from '../../models/pending-payments/pending.payment.response';

@Component({
  selector: 'app-pending-payments',
  standalone: false,
  templateUrl: './pending-payments.html',
  styleUrl: './pending-payments.css',
})
export class PendingPayments {
  user: any;
  pendingPayments: PendingPaymentData[] = [];
  loading = true;
  contracts: Contract[] = [];
  openSelect = false;


  filters: PendingPaymentFilter = {
    company: "",
    agreement: "",
    documentType: "",
    document: ""
  };
  constructor(private contractService: ContractService, private authService: AuthService) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();

    this.filters.document = this.user.document;
    this.filters.documentType = this.user.documentType;

    this.loadPendingPayments();
    this.loadContracts();


  }

  onChangeContrato(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    let contratoSeleccionado = this.contracts.find((c) => c.id === Number(value));
    if (contratoSeleccionado) {
      this.filters.company = contratoSeleccionado.companyId;
      this.filters.agreement = contratoSeleccionado.number;

      this.loadPendingPayments();
    }
  }
  onFocus() {
    this.openSelect = true;
  }

  onBlur() {
    setTimeout(() => (this.openSelect = false), 0);
  }
  loadPendingPayments() {
    this.contractService.pendingPayment(this.filters).subscribe((response) => {
      this.pendingPayments = response.data;
    });
  }
  loadContracts() {
    this.contractService.getByUser(this.user.id).subscribe({
      next: (data) => {
        this.contracts = data;
      },
      error: (err) => {

      },
    });
  }
  actualizarTotal() { }

  isGridView = false;
  dots = Array(6).fill(0);

  toggleView() {
    this.isGridView = !this.isGridView;
  }
}
