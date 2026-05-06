import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProvinceService } from '../../../services/province/province.service';
import { CityService } from '../../../services/city/city.service';
import { ProvinceModel } from '../../../models/provice.model';
import { CityModel } from '../../../models/city.model';

export interface StructuredAddress {
  provinceId: number;
  cityId: number;
  provinceName: string;
  cityName: string;
  fullAddress: string;
}

@Component({
  selector: 'app-address-form-modal',
  standalone: false,
  templateUrl: './address-form-modal.component.html',
  styleUrl: './address-form-modal.component.css',
})
export class AddressFormModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<StructuredAddress>();

  form!: FormGroup;
  provinces: ProvinceModel[] = [];
  cities: CityModel[] = [];
  errorMessage = '';

  // Propiedad reactiva — se actualiza con valueChanges
  addressPreview = '';

  readonly streetTypes = [
    'Calle', 'Carrera', 'Avenida', 'Diagonal',
    'Transversal', 'Circular', 'Variante', 'Autopista',
  ];

  readonly quadrants = ['Norte', 'Sur', 'Este', 'Oeste'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private provinceService: ProvinceService,
    private cityService: CityService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      provinceId:   ['', Validators.required],
      cityId:       ['', Validators.required],
      streetType:   ['', Validators.required],
      streetNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      streetLetter: [''],
      bis:          [false],
      quadrant1:    [''],
      crossNumber:  ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      crossLetter:  [''],
      quadrant2:    [''],
      doorNumber:   ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      interior:     [''],
      additionalInfo: [''],
    });

    // Preview reactivo: se recalcula con cada cambio en el formulario
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.addressPreview = this.buildPreview();
      });

    this.loadProvinces();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.form) {
      this.form.reset({
        provinceId: '',
        cityId: '',
        streetType: '',
        streetNumber: '',
        streetLetter: '',
        bis: false,
        quadrant1: '',
        crossNumber: '',
        crossLetter: '',
        quadrant2: '',
        doorNumber: '',
        interior: '',
        additionalInfo: '',
      });
      this.cities = [];
      this.errorMessage = '';
      this.addressPreview = '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Construye la dirección ensamblada campo por campo */
  private buildPreview(): string {
  const v = this.form.value;
  if (!v.streetType || !v.streetNumber) return '';

  // Nombres de departamento y municipio
  const province = this.provinces.find(p => p.id == v.provinceId);
  const city     = this.cities.find(c => c.id == v.cityId);

  let addr = `${v.streetType} ${v.streetNumber}`;
  if (v.streetLetter)  addr += ` ${v.streetLetter.toUpperCase()}`;
  if (v.bis)           addr += ' Bis';
  if (v.quadrant1)     addr += ` ${v.quadrant1}`;

  if (v.crossNumber) {
    addr += ` # ${v.crossNumber}`;
    if (v.crossLetter) addr += ` ${v.crossLetter.toUpperCase()}`;
    if (v.quadrant2)   addr += ` ${v.quadrant2}`;
  }

  if (v.doorNumber)     addr += ` - ${v.doorNumber}`;
  if (v.interior)       addr += ` ${v.interior}`;
  if (v.additionalInfo) addr += `, ${v.additionalInfo}`;

  // Agrega municipio y departamento al final
  if (city?.name)     addr += `, ${city.name}`;
  if (province?.name) addr += `, ${province.name}`;

  return addr;
}

  onProvinceChange(): void {
    const provinceId = this.form.get('provinceId')?.value;
    this.form.get('cityId')?.setValue('');
    this.cities = [];
    if (provinceId) {
      this.loadCities(provinceId);
    }
  }

  onConfirm(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }

    const v = this.form.value;
    const province = this.provinces.find(p => p.id == v.provinceId);
    const city     = this.cities.find(c => c.id == v.cityId);

    this.confirmed.emit({
      provinceId:   v.provinceId,
      cityId:       v.cityId,
      provinceName: province?.name ?? '',
      cityName:     city?.name ?? '',
      fullAddress:  this.addressPreview,
    });

    this.close();
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  onBackdropClick(): void {
    this.close();
  }

  private loadProvinces(): void {
    this.provinceService
      .getProvinces()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.provinces = data),
        error: () => {},
      });
  }

  private loadCities(provinceId: number): void {
    this.cityService
      .getCities(provinceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.cities = data),
        error: () => {},
      });
  }
}