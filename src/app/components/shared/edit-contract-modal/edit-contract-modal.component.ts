import {
  Component, Input, Output, EventEmitter,
  OnInit, OnChanges, OnDestroy, SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContractService } from '../../../services/contracts/contract.service';
import { Contract } from '../../../models/contract.model';
import { StructuredAddress } from '../address-form-modal/address-form-modal.component';

const MAX_ATTEMPTS = 2;

@Component({
  selector: 'app-edit-contract-modal',
  standalone: false,
  templateUrl: './edit-contract-modal.component.html',
  styleUrl: './edit-contract-modal.component.css',
})
export class EditContractModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() contract: Contract | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<{ status: string; message?: string }>();

  form!: FormGroup;
  saving = false;
  errorMessage = '';

  // Dirección nueva capturada desde address-form-modal
  showAddressModal = false;
  newAddress = '';
  newAddressData: StructuredAddress | null = null;
  addressRequired = false;

  // Intentos disponibles (se consultan al abrir)
  addressAttemptsLeft = MAX_ATTEMPTS;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:          ['', Validators.required],
      updateAddress: [false],
    });

    // Limpia la dirección si se desmarca el toggle
    this.form.get('updateAddress')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((checked: boolean) => {
        if (!checked) {
          this.newAddress = '';
          this.newAddressData = null;
          this.addressRequired = false;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.contract && this.form) {
      this.resetForm();
      this.loadAttempts();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddressConfirmed(address: StructuredAddress): void {
    this.newAddress = address.fullAddress;
    this.newAddressData = address;
    this.addressRequired = false;
    this.showAddressModal = false;
  }

  onConfirm(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';
    this.addressRequired = false;

    if (this.form.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }

    // Si marcó actualizar dirección pero no ingresó ninguna
    if (this.form.get('updateAddress')?.value && !this.newAddress) {
      this.addressRequired = true;
      return;
    }

    this.saving = true;
    const v = this.form.value;

    this.contractService.updateContract(this.contract!.id, {
      name:       v.name,
      newAddress: v.updateAddress ? this.newAddressData : undefined,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit({ status: 'success' });
        this.close();
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message ?? 'No se pudo actualizar el contrato. Intenta de nuevo.';
        this.errorMessage = msg;
      },
    });
  }

  close(): void { this.visibleChange.emit(false); }
  onBackdropClick(): void { this.close(); }

  private resetForm(): void {
    this.form.reset({
      name:          this.contract?.name ?? '',
      updateAddress: false,
    });
    this.newAddress = '';
    this.newAddressData = null;
    this.errorMessage = '';
    this.addressRequired = false;
    this.saving = false;
  }

  private loadAttempts(): void {
    if (!this.contract) return;
    this.contractService.getNotificationAttempts(
      this.contract.companyId,
      this.contract.number,
    ).subscribe({
      next: (res) => {
        this.addressAttemptsLeft = MAX_ATTEMPTS - (res.addressAttempts ?? 0);
      },
      error: () => {
        this.addressAttemptsLeft = MAX_ATTEMPTS;
      },
    });
  }
}
