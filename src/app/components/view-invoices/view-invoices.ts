import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ContractService } from '../../services/contracts/contract.service';
import { S3Service } from '../../services/s3/s3.service';
import { AuthService } from '../../services/auth/auth.service';
import { Contract } from '../../models/contract.model';
import { InvoiceFilter } from '../../models/invoice/invoice.filter';
import { Invoice } from '../../models/invoice/invoice.response';

@Component({
  selector: 'app-view-invoices',
  standalone: false,
  templateUrl: './view-invoices.html',
  styleUrl: './view-invoices.css',
})
export class ViewInvoices implements OnInit {
  invoices: Invoice[] = [];
  contracts: Contract[] = [];
  paginatedInvoices: Invoice[] = [];
  showCustomModal = false;
  customModalTitle = '';
  customModalMessage = '';
  customModalType = 'error';
  customModalButtonText = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  openSelect = false;
  user: any;
  filters: InvoiceFilter = {
    company: '',
    agreement: '',
    documentType: '',
    document: '',
  };

  constructor(
    private contractService: ContractService,
    private s3Service: S3Service,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.user = this.authService.getUser();
    if (!this.user) return;

    this.filters = {
      company: '',
      agreement: '',
      document: this.user.document,
      documentType: this.user.documentType,
    };

    this.loadInvoices();
    this.loadContracts();
  }

  onChangeContrato(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === '0') {
      this.filters = {
        company: '',
        agreement: '',
        document: this.user.document,
        documentType: this.user.documentType,
      };
      this.loadInvoices();
      return;
    }
    const contratoSeleccionado = this.contracts.find(c => c.id === Number(value));
    if (contratoSeleccionado) {
      this.filters = {
        company: contratoSeleccionado.companyId,
        agreement: contratoSeleccionado.number,
        document: '',
        documentType: '',
      };
      this.loadInvoices();
    }
  }

  loadInvoices() {
    this.contractService.getInvoices(this.filters).subscribe({
      next: (response) => {
        if (response.data.length === 0) {
          if (
            this.contracts.length > 0 &&
            this.filters.company === '' &&
            this.filters.agreement === ''
          ) {
            return;
          }
          if (this.contracts.length === 0) {
            this.customModalTitle = 'Información';
            this.customModalMessage = 'No se encontraron contratos asociados al usuario.';
            this.customModalType = 'error';
            this.customModalButtonText = 'Aceptar';
            this.showCustomModal = true;
            return;
          }
          this.customModalTitle = 'Información';
          this.customModalMessage = 'No se encontraron facturas para los filtros seleccionados.';
          this.customModalType = 'error';
          this.customModalButtonText = 'Aceptar';
          this.showCustomModal = true;
          return;
        } else {
          this.currentPage = 1;
        }

        this.invoices = response.data.map((i) => ({
          ...i,
          expirationDate: i.expirationDate.toString().replace(/(-\d{2}):(\d{2})$/, '$1$2'),
          createdAt: i.createdAt.toString().replace(/(-\d{2}):(\d{2})$/, '$1$2'),
        }));

        this.totalPages = Math.ceil(this.invoices.length / this.itemsPerPage);
        this.updatePaginatedData();
      },
      error: (error) => {
        this.customModalTitle = 'Error';
        this.customModalMessage = 'Ocurrió un error al cargar las facturas. No se pudo obtener la información.';
        this.customModalType = 'error';
        this.customModalButtonText = 'Aceptar';
        this.showCustomModal = true;
      }
    });
  }

  loadContracts() {
    this.contractService.getByUser(this.user.id).subscribe({
      next: (data) => { this.contracts = data; },
      error: (err) => {}
    });
  }

  downloadInvoice(invoice: any) {
    this.s3Service.getPdf(invoice.reference).subscribe({
      next: (res) => { window.open(res.url, '_blank'); },
      error: (err) => {
        this.customModalTitle = 'Error';
        this.customModalMessage = 'No se pudo descargar la factura. Por favor, inténtelo de nuevo más tarde.';
        this.customModalType = 'error';
        this.customModalButtonText = 'Aceptar';
        this.showCustomModal = true;
      }
    });
  }

  updatePaginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedInvoices = this.invoices.slice(start, end);
  }

  goToFirst(event: Event) {
    event.preventDefault();
    if (this.currentPage !== 1) { this.currentPage = 1; this.updatePaginatedData(); }
  }

  goToLast(event: Event) {
    event.preventDefault();
    if (this.currentPage !== this.totalPages) { this.currentPage = this.totalPages; this.updatePaginatedData(); }
  }

  nextPage(event: Event) {
    event.preventDefault();
    if (this.currentPage < this.totalPages) { this.currentPage++; this.updatePaginatedData(); }
  }

  prevPage(event: Event) {
    event.preventDefault();
    if (this.currentPage > 1) { this.currentPage--; this.updatePaginatedData(); }
  }

  onFocus() { this.openSelect = true; }
  onBlur() { setTimeout(() => (this.openSelect = false), 0); }

  formatDate(dateString: string): string {
    const date = new Date(dateString.replace('-5:00', '-05:00'));
    return date.toISOString().split('T')[0];
  }

  onRetry() { this.showCustomModal = false; }
  onClose() { this.showCustomModal = false; }

  translateStatus(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'PAYED': return 'Pagada';
      case 'RECEIPT': return 'Pagada en Liquidación';
      default: return status;
    }
  }
}