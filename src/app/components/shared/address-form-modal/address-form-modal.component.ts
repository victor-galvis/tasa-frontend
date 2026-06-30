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
import { CityService } from '../../../services/city/city.service';
import { CityModel } from '../../../models/city.model';

export type AddressKind = 'urban' | 'rural';

export interface StructuredAddress {
  provinceId: number;
  cityId: number;
  provinceName: string;
  cityName: string;
  fullAddress: string;
  // NUEVO — el backend necesita saber si la dirección viene estructurada
  // o como texto libre, para decidir cómo mapearla al payload de SAP.
  addressKind: AddressKind;
}

// FIX #1 — Antioquia siempre fija, no necesitamos ProvinceService ni ProvinceModel
const ANTIOQUIA_NAME = 'ANTIOQUIA';

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
  cities: CityModel[] = [];
  errorMessage = '';
  addressPreview = '';

  readonly streetTypes = [
    'Calle', 'Carrera', 'Avenida', 'Diagonal',
    'Transversal', 'Circular', 'Variante', 'Autopista',
  ];

  readonly quadrants = ['Norte', 'Sur', 'Este', 'Oeste'];

  private destroy$ = new Subject<void>();

  // FIX #1 — Ya no necesita ProvinceService
  constructor(
    private fb: FormBuilder,
    private cityService: CityService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // NUEVO — tipo de dirección: 'urban' (estructurada) | 'rural' (texto libre)
      addressKind:  ['urban', Validators.required],

      // FIX #2 — provinceId fijo, sin Validators.required porque no lo elige el usuario
      provinceId:   [null],
      cityId:       ['', Validators.required],

      // Campos de la estructura urbana
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

      // NUEVO — dirección rural / vereda en texto libre
      ruralAddress: [''],

      additionalInfo: [''],
    });

    this.applyAddressKindValidators('urban');

    // Cambia los validadores activos según urbano/rural
    this.form.get('addressKind')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((kind: AddressKind) => {
        this.applyAddressKindValidators(kind);
        this.addressPreview = this.buildPreview();
      });

    // Preview reactivo: se recalcula con cada cambio
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.addressPreview = this.buildPreview();
      });

    this.loadCitiesAntioquia();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.form) {
      // FIX #2 — provinceId se resetea a null (no es editable)
      this.form.reset({
        addressKind:    'urban',
        provinceId:     null,
        cityId:         '',
        streetType:     '',
        streetNumber:   '',
        streetLetter:   '',
        bis:            false,
        quadrant1:      '',
        crossNumber:    '',
        crossLetter:    '',
        quadrant2:      '',
        doorNumber:     '',
        interior:       '',
        ruralAddress:   '',
        additionalInfo: '',
      });
      this.applyAddressKindValidators('urban');
      this.errorMessage  = '';
      this.addressPreview = '';
      // No vaciamos this.cities porque Antioquia no cambia
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isRural(): boolean {
    return this.form?.get('addressKind')?.value === 'rural';
  }

  /**
   * NUEVO — activa/desactiva validadores requeridos según el tipo de
   * dirección elegido, para no exigir campos estructurados en rural
   * ni el textarea libre en urbano.
   */
  private applyAddressKindValidators(kind: AddressKind): void {
    const structuredControls = [
      'streetType', 'streetNumber', 'crossNumber', 'doorNumber',
    ];

    if (kind === 'rural') {
      structuredControls.forEach((name) => {
        const ctrl = this.form.get(name);
        ctrl?.clearValidators();
        ctrl?.updateValueAndValidity({ emitEvent: false });
      });
      const rural = this.form.get('ruralAddress');
      rural?.setValidators([Validators.required, Validators.minLength(10)]);
      rural?.updateValueAndValidity({ emitEvent: false });
    } else {
      structuredControls.forEach((name) => {
        const ctrl = this.form.get(name);
        ctrl?.setValidators([Validators.required, ...(name !== 'streetType' ? [Validators.pattern(/^\d+$/)] : [])]);
        ctrl?.updateValueAndValidity({ emitEvent: false });
      });
      const rural = this.form.get('ruralAddress');
      rural?.clearValidators();
      rural?.updateValueAndValidity({ emitEvent: false });
    }
  }

  /** Construye la dirección ensamblada campo por campo (urbana) o el texto libre (rural) */
  private buildPreview(): string {
    const v = this.form.value;
    const city = this.cities.find(c => c.id == v.cityId);

    if (v.addressKind === 'rural') {
      if (!v.ruralAddress) return '';
      let addr = v.ruralAddress.trim();
      if (v.additionalInfo) addr += `, ${v.additionalInfo}`;
      if (city?.name) addr += `, ${city.name}`;
      addr += `, ${ANTIOQUIA_NAME}`;
      return addr;
    }

    if (!v.streetType || !v.streetNumber) return '';

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

    // FIX #3 — municipio dinámico, departamento siempre fijo
    if (city?.name)  addr += `, ${city.name}`;
    addr += `, ${ANTIOQUIA_NAME}`;

    return addr;
  }

  onConfirm(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }

    const v    = this.form.value;
    const city = this.cities.find(c => c.id == v.cityId);

    // FIX #3 — provinceName siempre ANTIOQUIA
    this.confirmed.emit({
      provinceId:   0,
      cityId:       v.cityId,
      provinceName: ANTIOQUIA_NAME,
      cityName:     city?.name ?? '',
      fullAddress:  this.addressPreview,
      addressKind:  v.addressKind,
    });

    this.close();
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  onBackdropClick(): void {
    this.close();
  }

  private loadCitiesAntioquia(): void {
    this.cityService
      .getCitiesByCodePrefix('05')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.cities = data),
        error: () => {},
      });
  }
}