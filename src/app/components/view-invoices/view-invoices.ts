import { Component } from '@angular/core';
import { ContractService } from '../../services/contracts/contract.service';
import { S3Service } from '../../services/s3/s3.service';

interface Factura {
  periodo: string;
  numero: string;
  valor: string;
  pagoSinRecargo: string;
  pagadoEn: string;
  fechaPago: string;
}

@Component({
  selector: 'app-view-invoices',
  standalone: false,
  templateUrl: './view-invoices.html',
  styleUrl: './view-invoices.css',
})
export class ViewInvoices {
  invoices: any[] = [];
  paginatedInvoices: any[] = [];

  // Paginación
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;

  tipoConsulta = 'Facturas Inscritas';
  facturaSeleccionada = '1056228 - Esmeraldas Víctor Galvis';

  openSelect = false;

  opciones = [
    { value: '', label: 'Seleccione...' },
    { value: '1', label: 'Primero' },
    { value: '2', label: 'Segundo' },
    { value: '3', label: 'Tercero' },
  ];

  constructor(private contractService: ContractService, private s3Service: S3Service) {}
  ngOnInit() {
    this.loadInvoices();
  }

  generarPdf() {
    this.s3Service.getPdf().subscribe({
      next: (res) => {
        window.open(res.url, '_blank');
      },
    });
  }

  loadInvoices() {
    this.contractService.getInvoices().subscribe((response) => {
      this.invoices = response.data;
      this.totalPages = Math.ceil(this.invoices.length / this.itemsPerPage);
      this.updatePaginatedData();
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

  // Se activan con focus/blur del <select>
  onFocus() {
    this.openSelect = true;
  }

  onBlur() {
    setTimeout(() => (this.openSelect = false), 0);
  }

  facturas: Factura[] = [
    {
      periodo: '2025/ABRIL',
      numero: '1448664244',
      valor: '$514,986.11',
      pagoSinRecargo: '13/05/2025',
      pagadoEn: 'BANCOLOMBIA',
      fechaPago: '02/05/2025',
    },
    {
      periodo: '2025/MAYO',
      numero: '1453275287',
      valor: '$509,044.00',
      pagoSinRecargo: '11/06/2025',
      pagadoEn: 'BANCOLOMBIA',
      fechaPago: '03/06/2025',
    },
    {
      periodo: '2025/JUNIO',
      numero: '1457934710',
      valor: '$423,520.00',
      pagoSinRecargo: '11/07/2025',
      pagadoEn: 'BANCOLOMBIA',
      fechaPago: '01/07/2025',
    },
    {
      periodo: '2025/JULIO',
      numero: '1462593390',
      valor: '$412,882.00',
      pagoSinRecargo: '11/08/2025',
      pagadoEn: 'BANCOLOMBIA',
      fechaPago: '29/07/2025',
    },
    {
      periodo: '2025/AGOSTO',
      numero: '1467354661',
      valor: '$494,878.00',
      pagoSinRecargo: '09/09/2025',
      pagadoEn: 'BANCOLOMBIA',
      fechaPago: '02/09/2025',
    },
    {
      periodo: '2025/SEPTIEMBRE',
      numero: '1471997150',
      valor: '$413,185.73',
      pagoSinRecargo: '19/09/2025',
      pagadoEn: 'BANCOLOMBIA',
      fechaPago: '15/09/2025',
    },
  ];
}
