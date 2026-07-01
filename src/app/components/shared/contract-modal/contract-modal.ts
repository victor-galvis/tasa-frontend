import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ContractService } from '../../../services/contracts/contract.service';
import { AuthService } from '../../../services/auth/auth.service';
import { CityModel } from '../../../models/city.model';
import { ProvinceModel } from '../../../models/provice.model';
import { CityService } from '../../../services/city/city.service';
import { ProvinceService } from '../../../services/province/province.service';
import { Company, CompanyService } from '../../../services/company/company.service';
import { AddressValidateService } from '../../../services/address-validate';

@Component({
  selector: 'app-contract-modal',
  standalone: false,
  templateUrl: './contract-modal.html',
  styleUrl: './contract-modal.css',
})
export class ContractModal implements OnInit, OnChanges, OnDestroy {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<any>();

  form!: FormGroup;
  verifying = false;
  address = '';
  contractVerified = false;
  contrato: string = '';
  showAddressModal = false;
  addressList: string[] = [];
  addressFromServerList: string[] = [];
  errorMessage: string = '';

  correctAddress: string = '';
  showValidationModal = false;
  loading = false;

  provinces: ProvinceModel[] = [];
  cities: CityModel[] = [];
  companies: Company[] = [];
  openSelect = false;

  showCustomModal = false;
  customModalTitle = '';
  customModalMessage = '';
  customModalType = 'error';
  customModalButtonText = '';
  userEmail = '';
  showAddressFormModal = false;

  // FIX #2 — Subject para switchMap (cancela llamadas en vuelo)
  private verifySubject = new Subject<{ company: any; agreement: any }>();
  // FIX #3 — Subject para desuscribirse al destruir el componente
  private destroy$ = new Subject<void>();

  get deliveryMethod(): string {
    return this.form?.get('deliveryMethod')?.value ?? 'digital';
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private contractService: ContractService,
    private provinceService: ProvinceService,
    private cityService: CityService,
    private companyService: CompanyService,
    private addressValidateService: AddressValidateService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userEmail = user?.email ?? '';

    this.form = this.fb.group({
      number: ['', Validators.required],
      name: ['', Validators.required],
      provinceId: [1, Validators.required],
      cityId: [1, Validators.required],
      companyId: [14, Validators.required],
      deliveryMethod: ['digital', Validators.required],
      address: [this.correctAddress],
    });

    // Cuando cambia el departamento, recargar ciudades
    this.form.get('provinceId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((provinceId) => {
        this.form.get('cityId')?.setValue(null);
        this.cities = [];
        if (provinceId) {
          this.loadCities(provinceId);
        }
      });

    // Validación dinámica según método de entrega
    this.form.get('deliveryMethod')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((method) => {
        const addressControl = this.form.get('address');
        if (method === 'physical') {
          addressControl?.setValidators([Validators.required]);
        } else {
          addressControl?.clearValidators();
          addressControl?.setValue('');
        }
        addressControl?.updateValueAndValidity();
      });

    // FIX #2 — Pipeline con switchMap: si llega una nueva petición cancela la anterior
    this.verifySubject
      .pipe(
        switchMap((filters) => this.contractService.validateContract(filters)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.status === 'OK') {
            if (response.addresses && response.addresses.length > 0) {
              this.addressList = response.addresses;
              this.showAddressModal = true;
            } else {
              this.customModalMessage = 'El contrato no existe o no está activo.';
              this.customModalTitle = 'Contrato inválido';
              this.customModalButtonText = 'Cerrar';
              this.showCustomModal = true;
            }
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = `Error en la petición: ${err.message}`;
        },
      });

    this.loadProvinces();
    this.loadCities(1);
    this.loadCompanies();
  }

  // FIX #3 — Limpiar suscripciones al destruir el componente
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFocus() {
    this.openSelect = true;
  }

  onBlur() {
    setTimeout(() => (this.openSelect = false), 0);
  }

  onCloseModal() {
    this.showValidationModal = false;
    this.contractVerified = false;
  }

  onValidate(contract: string) {
    this.onSaveContract();
  }

  onRetry() {
    this.showCustomModal = false;
    this.close();
  }

  onCloseCustomModel() {
    this.showCustomModal = false;
    this.close();
  }

  verificarContrato() {
    this.contrato = this.form.get('number')?.value;

    if (!this.contrato) {
      this.errorMessage = 'Debe ingresar un número de contrato';
      return;
    }

    // FIX #1 — Guard: si ya hay una petición en curso, no lanzar otra
    if (this.loading) return;

    this.errorMessage = '';
    this.loading = true;

    // FIX #2 — Emite al subject en lugar de llamar directamente al servicio
    this.verifySubject.next({
      company: this.form.get('companyId')?.value,
      agreement: this.form.get('number')?.value,
    });
  }

  onAddressSelected(address: string) {
    this.address = address;
    const company = this.form.get('companyId')?.value;
    const agreement = this.form.get('number')?.value;

    this.addressValidateService
      .validateAddress({ company, agreement, address })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data.isValid) {
            this.contractVerified = true;
            this.form.patchValue({ address: data.correctedAddress });
            this.showAddressModal = false;
          } else {
            this.contractVerified = false;
            this.errorMessage = data.message;
            this.showAddressModal = false;
          }
        },
        error: (err) => {
          console.error('Error al validar la dirección:', err);
          this.contractVerified = false;
          this.errorMessage = '❌ Error al validar la dirección.';
          this.showAddressModal = false;
        },
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>('input[formControlName="number"]');
        el?.focus();
      }, 0);
    }
  }

  close() {
    this.visibleChange.emit(false);
  }

  backdropClick() {
    this.close();
  }

  onVerifyAddress() {
    if (this.form.get('number')?.invalid) {
      this.form.get('number')?.markAsTouched();
      return;
    }
    this.verifying = true;
    this.contractVerified = false;

    setTimeout(() => {
      this.address = 'CR 45 CL 86 - 25';
      this.form.get('address')?.setValue(this.address);
      this.verifying = false;
      this.contractVerified = true;
    }, 1200);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.contractVerified) {
      this.errorMessage = 'Por favor verifica la dirección antes de inscribir el contrato.';
      return;
    }

    this.showValidationModal = true;
  }

  onSaveContract() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.contractVerified) {
      this.errorMessage = 'Por favor verifica la dirección antes de inscribir el contrato.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = this.form.value;
    const user = this.authService.getUser();
    payload.user_id = user.id;

    this.contractService
      .create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.loading = false;
          this.contractVerified = false;
          this.form.reset();
          this.showValidationModal = false;

          this.form.get('provinceId')?.setValue(1);
          this.form.get('cityId')?.setValue(1);
          this.form.get('companyId')?.setValue(14);

          if (data) {
            if (data.notificationSyncError) {
              this.customModalTitle = 'Contrato inscrito con novedad';
              this.customModalMessage =
                'Tu contrato fue inscrito correctamente. Sin embargo, no fue posible ' +
                'actualizar el método de recepción de factura (correo o dirección física) ' +
                'porque ya alcanzaste el máximo de actualizaciones permitidas para este contrato. ' +
                'Contacta al administrador si necesitas hacer más cambios.';
              this.customModalType = 'warning';
              this.customModalButtonText = 'Entendido';
              this.showCustomModal = true;
              this.saved.emit({ status: 'warning', data });
            } else {
              this.saved.emit({ status: 'success', data });
              this.close();
            }
          }
        },
        error: (err) => {
          this.loading = false;
          this.contractVerified = false;
          this.errorMessage = err.error.message;
          this.saved.emit({ status: 'error', err });
        },
      });
  }

  loadProvinces(): void {
    this.provinceService
      .getProvinces()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.provinces = data),
        error: () => { },
      });
  }

  loadCities(provinceId: number): void {
    this.cityService
      .getCities(provinceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.cities = data),
        error: () => { },
      });
  }

  loadCompanies(): void {
    this.companyService
      .getCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.companies = data),
        error: () => { },
      });
  }

  onOpenAddressForm(): void {
    this.showAddressFormModal = true;
  }

  onAddressConfirmed(address: any): void {
    this.form.get('address')?.setValue(address.fullAddress);
    this.showAddressFormModal = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEsc(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (this.visible && keyboardEvent.key === 'Escape') {
      this.close();
    }
  }
}