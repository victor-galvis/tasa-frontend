import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContractService } from '../../../services/contracts/contract.service';
import { log } from 'console';
import { AuthService } from '../../../services/auth/auth.service';
import { CityModel } from '../../../models/city.model';
import { ProvinceModel } from '../../../models/provice.model';
import { CityService } from '../../../services/city/city.service';
import { ProvinceService } from '../../../services/province/province.service';

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
  openSelect = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private contractService: ContractService,
    private provinceService: ProvinceService,
    private cityService: CityService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      number: ['', Validators.required],
      name: ['', Validators.required],
      provinceId: [1, Validators.required],
      cityId: [1, Validators.required],
      deliveryMethod: ['digital', Validators.required],
      address: [this.correctAddress],
    });
    this.form.get('name')?.valueChanges.subscribe((value) => {
      console.log('Nombre personalizado:', value);
    });
    this.loadProvinces();
    this.loadCities(1);
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

  verificarContrato() {
    this.contrato = this.form.get('number')?.value;
    if (!this.contrato) {
      this.errorMessage = 'Debe ingresar un número de contrato';
      console.warn('Debe ingresar un número de contrato');
      return;
    }
    this.errorMessage = '';

    this.loading = true;
    this.contractService.getInvoices().subscribe((response) => {
      this.loading = false;

      const randomIndex = Math.floor(Math.random() * response.data.length);
      this.addressFromServerList = response.data.map((data: any) => {
        return data.debtor.name;
      });

      this.correctAddress = response.data[randomIndex].debtor.name;

      const randomFakes = Array.from({ length: 4 }, () => this.generateRandomAddress());

      const allAddresses = this.shuffleArray([...randomFakes, this.correctAddress]);

      this.addressList = allAddresses;

      this.showAddressModal = true;
    });
  }
  private generateRandomAddress(): string {
    const calle = this.randomInt(1, 100);
    const carrera = this.randomInt(1, 120);
    const letras = ['A', 'B', 'C', 'D', 'E', 'SUR', 'NORTE'];
    const sufijoCalle = Math.random() > 0.5 ? ` ${this.randomItem(letras)}` : '';
    const sufijoCarrera = Math.random() > 0.5 ? ` ${this.randomItem(letras)}` : '';
    const numero = this.randomInt(1, 80);
    const interior = Math.random() > 0.3 ? ` (INTERIOR ${this.randomInt(100, 900)})` : '';

    return `CL ${calle}${sufijoCalle} CR ${carrera}${sufijoCarrera} -${numero}${interior}`;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  onAddressSelected(address: string) {
    console.log('Dirección seleccionada:', address);
    this.address = address;

    const exists = this.addressFromServerList.includes(address);

    if (exists) {
      this.contractVerified = true;
      this.form.patchValue({
        address: this.correctAddress,
      });
      console.log('✅ Dirección correcta:', address);
    } else {
      this.contractVerified = false;
      this.errorMessage = '❌ Dirección incorrecta: ' + address;
      console.log('❌ Dirección incorrecta:', address);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      // foco en el input del contrato cuando se abra
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
    // cerrar al hacer click fuera del modal
    this.close();
  }

  onVerifyAddress() {
    if (this.form.get('number')?.invalid) {
      this.form.get('number')?.markAsTouched();
      return;
    }
    this.verifying = true;
    this.contractVerified = false;

    // Simulación de verificación remota (reemplaza con petición real)
    setTimeout(() => {
      // respuesta simulada
      this.address = 'CR 45 CL 86 - 25';

      this.form.get('address')?.setValue(this.address);

      this.verifying = false;
      this.contractVerified = true;
    }, 1200);
  }

  onSubmit() {
    console.log('this.form.invalid', this.form.invalid);
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      // Mostrar qué campos están inválidos y sus errores
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          console.warn(`Campo inválido: ${key}`, control.errors);
        }
      });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('this.contractVerified', this.contractVerified);

    if (!this.contractVerified) {
      this.errorMessage = 'Por favor verifica la dirección antes de inscribir el contrato.';
      return;
    }

    console.log(this.showValidationModal);
    this.showValidationModal = true;
  }
  onSaveContract() {
    console.log('this.form.invalid', this.form.invalid);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('this.contractVerified', this.contractVerified);

    if (!this.contractVerified) {
      this.errorMessage = 'Por favor verifica la dirección antes de inscribir el contrato.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = this.form.value;

    let user = this.authService.getUser();
    payload.user_id = user.id;

    this.contractService.create(payload).subscribe({
      next: (data) => {
        this.loading = false;
        this.contractVerified = false;
        this.form.reset();
        this.showValidationModal = false;

        console.log('✅ Response:', data);
        if (data) {
          this.saved.emit({
            status: 'success',
            data,
          });
          this.close();
        }
      },
      error: (err) => {
        this.loading = false;

        this.contractVerified = false;
        this.errorMessage = err.error.message;
        this.saved.emit({
          status: 'error',
          err,
        });
      },
    });
  }

  loadProvinces(): void {
    this.provinceService.getProvinces().subscribe({
      next: (data) => {
        this.provinces = data;
      },
      error: (err) => {
        console.error('Error al cargar los departamentos', err);
      },
    });
  }
  loadCities(provinceId: number): void {
    this.cityService.getCities(provinceId).subscribe({
      next: (data) => {
        this.cities = data;
      },
      error: (err) => {
        console.error('Error al cargar las ciudades', err);
      },
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEsc(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (this.visible && keyboardEvent.key === 'Escape') {
      this.close();
    }
  }
}
