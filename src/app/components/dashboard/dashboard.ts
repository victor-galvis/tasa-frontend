import { Component } from '@angular/core';
import { HomeService } from '../../services/home/home.service';
import { ContractService } from '../../services/contracts/contract.service';
@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  user: any;
  showNoContracts = false;
  showContractModal = false;
  showCustomModal = false;

  customModalTitle = '';
  customModalMessage = '';
  customModalType = 'success';
  customModalButtonText = '';

  onRetry() {
    this.showCustomModal = false;
    // lógica para reintentar
  }

  onClose() {
    this.showCustomModal = false;
  }

  onViewContracts() {
    this.showNoContracts = false;
  }

  onRegisterContracts() {
    this.showNoContracts = false;
  }

  constructor(private homeService: HomeService, private contractService: ContractService) { }
  ngOnInit(): void {
    this.user = this.homeService.getUser();
  }

  openContractModal() {

    this.validateAsociateContracts();
  }

  onNoContractsClosed() {
    this.showNoContracts = false;
  }
  onRegisterInvoices() {
    this.showNoContracts = false;
    this.showContractModal = true;
  }

  validateAsociateContracts() {
    this.contractService.getByUser(this.user.id).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.showContractModal = true;
        } else {
          this.showNoContracts = true;
        }
      },
      error: (err) => { },
    });
  }

  onContractSaved(payload: any) {
    if (payload.status == 'success') {
      this.customModalTitle = 'Solicitud exitosa';
      this.customModalMessage = 'El contrato fue asociado exitosamente';
      this.customModalType = 'success';
      this.customModalButtonText = 'Exitoso';
      this.showCustomModal = true;
    }
  }
}
