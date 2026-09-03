import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ContractService } from '../../services/contracts/contract.service';
import { AuthService } from '../../services/auth/auth.service';
import { Contract } from '../../models/contract.model';

@Component({
  selector: 'app-manage-contracts',
  standalone: false,
  templateUrl: './manage-contracts.html',
  styleUrl: './manage-contracts.css',
})
export class ManageContracts implements OnInit {
  contracts: Contract[] = [];
  loading = true;
  user: any;
  viewMode: 'cards' | 'table' = 'cards';

  showEditModal = false;
  selectedContract: Contract | null = null;

  showCustomModal = false;
  customModalTitle = '';
  customModalMessage = '';
  customModalType = 'success';
  customModalButtonText = 'Aceptar';

  private contractToDelete: Contract | null = null;
  private pendingAction: 'delete' | 'none' = 'none';

  constructor(
    private contractService: ContractService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.user = this.authService.getUser();
    if (!this.user) return;
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading = true;
    this.contractService.getByUser(this.user.id).subscribe({
      next: (data) => { this.contracts = data; this.loading = false; },
      error: () => { this.loading = false; this.showError('No se pudieron cargar los contratos.'); },
    });
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'cards' ? 'table' : 'cards';
  }

  onEdit(contract: Contract): void {
    this.selectedContract = contract;
    this.showEditModal = true;
  }

  onContractUpdated(result: { status: string; message?: string }): void {
    if (result.status === 'success') {
      this.loadContracts();
      this.showSuccess('Contrato actualizado correctamente.');
    } else {
      this.showError(result.message ?? 'Ocurrió un error al actualizar el contrato.');
    }
  }

  onDeleteConfirm(contract: Contract): void {
    this.contractToDelete = contract;
    this.pendingAction = 'delete';
    this.customModalTitle = 'Eliminar contrato';
    this.customModalMessage = `¿Estás seguro de que deseas eliminar el contrato "${contract.name}" (${contract.number})? Esta acción no se puede deshacer.`;
    this.customModalType = 'warning';
    this.customModalButtonText = 'Sí, eliminar';
    this.showCustomModal = true;
  }

  onModalConfirmed(): void {
    if (this.pendingAction === 'delete' && this.contractToDelete) {
      this.contractService.deleteContract(this.contractToDelete.id).subscribe({
        next: () => {
          this.contracts = this.contracts.filter(c => c.id !== this.contractToDelete!.id);
          this.resetModal();
          this.showSuccess('Contrato eliminado correctamente.');
        },
        error: () => { this.resetModal(); this.showError('No se pudo eliminar el contrato.'); },
      });
    } else {
      this.resetModal();
    }
  }

  onModalClosed(): void { this.resetModal(); }

  private showSuccess(message: string): void {
    this.customModalTitle = 'Operación exitosa';
    this.customModalMessage = message;
    this.customModalType = 'success';
    this.customModalButtonText = 'Aceptar';
    this.showCustomModal = true;
  }

  private showError(message: string): void {
    this.customModalTitle = 'Error';
    this.customModalMessage = message;
    this.customModalType = 'error';
    this.customModalButtonText = 'Aceptar';
    this.showCustomModal = true;
  }

  private resetModal(): void {
    this.showCustomModal = false;
    this.contractToDelete = null;
    this.pendingAction = 'none';
  }
}
