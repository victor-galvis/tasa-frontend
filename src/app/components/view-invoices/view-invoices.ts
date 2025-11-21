import { Component } from '@angular/core';
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
export class ViewInvoices {
  invoices: Invoice[] = [];
  contracts: Contract[] = [];

  paginatedInvoices: Invoice[] = [];

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
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.user = this.authService.getUser();
    console.log('Usuario en facturas', this.user);

    this.filters = {
      company: '',
      agreement: '',
      document: this.user.document,
      documentType: this.user.documentType,
    };

    console.log('******************************');
    console.log(this.filters);
    console.log(this.user);
    console.log('******************************');

    this.loadInvoices();

    this.loadContracts();
  }

 
  onChangeContrato(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    console.log('Valor seleccionado:', value);
    let contratoSeleccionado = this.contracts.find((c) => c.id === Number(value));
    console.log('Valor seleccionado:', contratoSeleccionado);
    if (contratoSeleccionado) {
      this.filters.company = contratoSeleccionado.companyId;
      this.filters.agreement = contratoSeleccionado.number;

      this.loadInvoices();
    }
  }
  loadInvoices() {
    this.contractService.getInvoices(this.filters).subscribe((response) => {
      this.invoices = response.data.map((i) => ({
        ...i,
        expirationDate: i.expirationDate.toString().replace(/(-\d{2}):(\d{2})$/, '$1$2'),
        createdAt: i.createdAt.toString().replace(/(-\d{2}):(\d{2})$/, '$1$2'),
      }));
      this.totalPages = Math.ceil(this.invoices.length / this.itemsPerPage);
      this.updatePaginatedData();
    });
  }

  loadContracts() {
    this.contractService.getByUser(this.user.id).subscribe({
      next: (data) => {
        console.log('Contratos', data);
        this.contracts = data; 
      },
      error: (err) => {
        /*
        this.loading = false;
        console.error('❌ Error al cargar contratos', err);
        */
      },
    });
  }

  downloadInvoice(invoice: any) {
    console.log('Factura seleccionada:', invoice.reference);
    console.log('Factura seleccionada:', this.user.document);
    // Aquí haces la descarga real

     this.s3Service.getPdf(invoice.reference, this.user.document).subscribe({
      next: (res) => {
        window.open(res.url, '_blank');
      },
    });
  }

  updatePaginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedInvoices = this.invoices.slice(start, end);
  }

  goToFirst(event: Event) {
    event.preventDefault();
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.updatePaginatedData();
    }
  }

  goToLast(event: Event) {
    event.preventDefault();
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.updatePaginatedData();
    }
  }

  nextPage(event: Event) {
    event.preventDefault();
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  prevPage(event: Event) {
    event.preventDefault();
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  onFocus() {
    this.openSelect = true;
  }

  onBlur() {
    setTimeout(() => (this.openSelect = false), 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString.replace('-5:00', '-05:00'));
    return date.toISOString().split('T')[0];
  }
}
