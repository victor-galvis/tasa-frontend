import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ContractService } from '../../services/contracts/contract.service';
import { CompanyService } from '../../services/company/company.service';
import { S3Service } from '../../services/s3/s3.service';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment';
import { Invoice } from '../../models/invoice/invoice.response';

@Component({
  selector: 'app-admin-invoices',
  standalone: false,
  templateUrl: './admin-invoices.component.html',
  styleUrl: './admin-invoices.component.css',
})
export class AdminInvoicesComponent implements OnInit {
  companies: { id: number; name: string }[] = [];
  selectedCompany = '';
  contractNumber = '';
  loading = false;
  consulted = false;
  lastQueried = '';

  invoices: Invoice[] = [];
  paginatedInvoices: Invoice[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  openCompany = false;

  showCustomModal = false;
  customModalTitle = '';
  customModalMessage = '';
  customModalType = 'error';

  constructor(
    private contractService: ContractService,
    private companyService: CompanyService,
    private s3Service: S3Service,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Protección frontend: solo el admin puede ver esta página
    const user = this.authService.getUser();
    if (!user || !environment.adminEmail.includes(user.email)) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (data) => (this.companies = data),
      error: () => { },
    });
  }

  onConsultar(): void {
    if (!this.selectedCompany || !this.contractNumber.trim()) {
      this.showError('Debes seleccionar una comercializadora e ingresar un número de contrato.');
      return;
    }

    this.loading = true;
    this.consulted = false;
    this.invoices = [];
    this.lastQueried = this.contractNumber.trim();

    this.contractService
      .adminGetInvoices(this.selectedCompany, this.lastQueried)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.consulted = true;

          if (!response?.data?.length) return;

          this.invoices = response.data.map((i: any) => ({
            ...i,
            expirationDate: i.expirationDate?.toString().replace(/(-\d{2}):(\d{2})$/, '$1$2'),
            createdAt: i.createdAt?.toString().replace(/(-\d{2}):(\d{2})$/, '$1$2'),
          }));

          this.currentPage = 1;
          this.totalPages = Math.ceil(this.invoices.length / this.itemsPerPage);
          this.updatePaginatedData();
        },
        error: () => {
          this.loading = false;
          this.consulted = true;
          this.showError('No se pudo consultar las facturas. Verifica los datos e intenta de nuevo.');
        },
      });
  }

  downloadInvoice(invoice: any): void {
    this.s3Service.getPdf(invoice.reference).subscribe({
      next: (res) => window.open(res.url, '_blank'),
      error: () => this.showError('No se pudo descargar la factura. Intenta de nuevo más tarde.'),
    });
  }

  // ── Paginación ────────────────────────────────────────────────────────────
  updatePaginatedData(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedInvoices = this.invoices.slice(start, start + this.itemsPerPage);
  }

  goToFirst(e: Event) { e.preventDefault(); if (this.currentPage !== 1) { this.currentPage = 1; this.updatePaginatedData(); } }
  goToLast(e: Event) { e.preventDefault(); if (this.currentPage !== this.totalPages) { this.currentPage = this.totalPages; this.updatePaginatedData(); } }
  nextPage(e: Event) { e.preventDefault(); if (this.currentPage < this.totalPages) { this.currentPage++; this.updatePaginatedData(); } }
  prevPage(e: Event) { e.preventDefault(); if (this.currentPage > 1) { this.currentPage--; this.updatePaginatedData(); } }

  // ── Helpers ───────────────────────────────────────────────────────────────
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString.replace('-5:00', '-05:00'));
    return date.toISOString().split('T')[0];
  }

  translateStatus(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'PAYED': return 'Pagada';
      case 'RECEIPT': return 'Pagada en Liquidación';
      default: return status;
    }
  }

  onModalClose(): void { this.showCustomModal = false; }

  private showError(message: string): void {
    this.customModalTitle = 'Error';
    this.customModalMessage = message;
    this.customModalType = 'error';
    this.showCustomModal = true;
  }
}
