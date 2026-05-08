import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
export class ContractModal implements OnInit, OnChanges {
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private contractService: ContractService,
    private provinceService: ProvinceService,
    private cityService: CityService,
    private companyService: CompanyService,
    private addressValidateService: AddressValidateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
  this.form = this.fb.group({
    number: ['', Validators.required],
    name: ['', Validators.required],
    provinceId: [1, Validators.required],
    cityId: [1, Validators.required],
    companyId: [14, Validators.required],
    deliveryMethod: ['digital', Validators.required],
    address: [this.correctAddress],
  });

  if (isPlatformBrowser(this.platformId)) {
    this.loadProvinces();
    this.loadCities(1);
    this.loadCompanies();
  }
}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const el = document.querySelector<HTMLInputElement>('input[formControlName="number"]');
          el?.focus();
        }, 0);
      }
    }
  }

  onFocus() { this.openSelect = true; }
  onBlur() { setTimeout(() => (this.openSelect = false), 0); }
  onCloseModal() { this.showValidationModal = false; this.contractVerified = false; }
  onValidate(contract: string) { this.onSaveContract(); }
  onRetry() { this.showCustomModal = false; }
  onCloseCustomModel() { this.showCustomModal = false; }

  verificarContrato() {
    this.contrato = this.form.get('number')?.value;
    if (!this.contrato) {
      this.errorMessage = 'Debe ingresar un número de contrato';
      return;
    }
    this.errorMessage = '';
    this.loading = true;

    this.contractService.validateContract({
      company: this.form.get('companyId')?.value,
      agreement: this.form.get('number')?.value,
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.status === 'OK') {
          if (response.addresses && response.addresses.length > 0) {
            this.addressList = response.addresses;
            this.showAddressModal = true;
          } else {
            this.customModalTitle = 'Contrato inválido';
            this.customModalMessage = 'El contrato no tiene direcciones asociadas.';
            this.customModalType = 'error';
            this.customModalButtonText = 'Cerrar';
            this.showCustomModal = true;
          }
        } else if (response.status === 'NOT_FOUND') {
          this.customModalTitle = 'Contrato no encontrado';
          this.customModalMessage = 'El contrato ingresado no existe o no está activo. Verifique el número e intente nuevamente.';
          this.customModalType = 'error';
          this.customModalButtonText = 'Intentar de nuevo';
          this.showCustomModal = true;
        } else if (response.status === 'MAX_ATTEMPTS') {
          this.customModalTitle = 'Acceso bloqueado';
          this.customModalMessage = response.message ?? 'Ha superado el número máximo de intentos.';
          this.customModalType = 'error';
          this.customModalButtonText = 'Cerrar';
          this.showCustomModal = true;
        } else {
          this.errorMessage = response.message ?? 'Error desconocido.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 429) {
          const msg = err.error?.message ?? 'Ha superado el límite de consultas permitidas.';
          this.customModalTitle = '⏳ Límite de consultas alcanzado';
          this.customModalMessage = msg;
          this.customModalType = 'warning';
          this.customModalButtonText = 'Entendido';
          this.showCustomModal = true;
        } else {
          this.errorMessage = err.error?.message ?? err.message ?? 'Error en la petición.';
        }
      },
    });
  }

  onAddressSelected(address: string) {
    this.address = address;
    const company = this.form.get('companyId')?.value;
    const agreement = this.form.get('number')?.value;
    this.addressValidateService.validateAddress({ company, agreement, address }).subscribe({
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
        this.contractVerified = false;
        this.errorMessage = '❌ Error al validar la dirección.';
        this.showAddressModal = false;
      }
    });
  }

  close() { this.visibleChange.emit(false); }
  backdropClick() { this.close(); }

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
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.contractVerified) {
      this.errorMessage = 'Por favor verifica la dirección antes de inscribir el contrato.';
      return;
    }
    this.showValidationModal = true;
  }

  onSaveContract() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.contractVerified) {
      this.errorMessage = 'Por favor verifica la dirección antes de inscribir el contrato.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const payload = this.form.value;
    const user = this.authService.getUser();
    payload.user_id = user.id;

    this.contractService.create(payload).subscribe({
      next: (data) => {
        this.loading = false;
        this.contractVerified = false;
        this.form.reset();
        this.showValidationModal = false;
        this.form.get('provinceId')?.setValue(1);
        this.form.get('cityId')?.setValue(1);
        this.form.get('companyId')?.setValue(14);
        if (data) { this.saved.emit({ status: 'success', data }); this.close(); }
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
    this.provinceService.getProvinces().subscribe({ next: (data) => { this.provinces = data; } });
  }
  loadCities(provinceId: number): void {
    this.cityService.getCities(provinceId).subscribe({ next: (data) => { this.cities = data; } });
  }
  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({ next: (data) => { this.companies = data; } });
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEsc(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (this.visible && keyboardEvent.key === 'Escape') { this.close(); }
  }
}