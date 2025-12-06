import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtpService } from '../../services/otp/otp.service';
import { AnimationOptions } from 'ngx-lottie';
import { AuthService } from '../../services/auth/auth.service';

import {
  DocumentTypes,
  DocumentTypeService,
} from '../../services/document-type/document.type.service';
import { Router } from '@angular/router';
import { ProvinceService } from '../../services/province/province.service';
import { CityService } from '../../services/city/city.service';
import { ProvinceModel } from '../../models/provice.model';
import { CityModel } from '../../models/city.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {


  registerForm!: FormGroup;

  step = 1;
  form: FormGroup;
  aceptaTerminos: boolean = false;
  email: string = '';
  codigoFinal: string = '';

  btnDisabled: boolean = true;
  loading = false;
  documentTypes: DocumentTypes[] = [];
  selectedDocumentType: number | null = null;
  regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  provinces: ProvinceModel[] = [];
  cities: CityModel[] = [];

  loadingOptions: AnimationOptions = {
    path: '/loading.json',
    loop: true,
    autoplay: true,
  };

  showCustomModal = false;
  customModalTitle = '';
  customModalMessage = '';
  customModalType = 'error';
  customModalButtonText = '';

  inputs = Array(5);
  codigo: string[] = ['', '', '', '', ''];

  validationMessages: any = {
    email: {
      required: 'El email es obligatorio',
      email: 'El email no es válido'
    },
    documentTypeId: {
      required: 'Debe seleccionar el tipo de documento'
    },
    identificationNumber: {
      required: 'Debe ingresar su número de identificación'
    },
    name: {
      required: 'Debe ingresar su nombre'
    },
    lastname: {
      required: 'Debe ingresar su apellido'
    },
    password: {
      required: 'Debe ingresar una contraseña'
    },
    confirmPassword: {
      required: 'Debe confirmar la contraseña'
    },
    aceptaTerminos: {
      required: 'Debe aceptar los términos y condiciones'
    }
  };

  constructor(
    private fb: FormBuilder,
    private otpService: OtpService,
    private documentTypeService: DocumentTypeService,
    private authService: AuthService,
    private provinceService: ProvinceService,
    private cityService: CityService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      nombre: ['', Validators.required],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
  }

  ngOnInit(): void {
    this.loadDocumentTypes();
    this.loadProvinces();
    this.loadCities(1);

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      documentTypeId: ['', Validators.required],
      province_id: [1, Validators.required],
      cityId: [1, Validators.required],
      identificationNumber: ['', Validators.required],
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue],
    });
  }

  validateEmail(value: string): void {
    this.email = value;

    let result = this.regex.test(this.email);
    this.btnDisabled = !result;
  }

  /*
  moverFoco(event: any, index: number) {
    const input = event.target;
    if (input.value && index < this.inputs.length - 1) {
      const next = input.nextElementSibling;
      if (next) next.focus();
    }
  }

  retrocederFoco(event: any, index: number) {
    if (event.key === 'Backspace') {
      if (this.codigo[index]) {
        this.codigo[index] = '';
      } else if (index > 0) {
        const prev = (event.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
        if (prev) {
          this.codigo[index - 1] = '';
          prev.focus();
        }
      }
    }
  }

  onInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;

    if (input.value && index < this.inputs.length - 1) {
      const next = input.nextElementSibling as HTMLInputElement;
      if (next) next.focus();
    }

    if (!input.value && index > 0) {
      const prev = input.previousElementSibling as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  getCodigoFinal(): string {
    return this.codigo.join('');
  }
  */
  recibirCodigo(codigo: string) {
    this.codigoFinal = codigo.trim();
  }

  siguiente() {
    if (this.step === 1 && this.regex.test(this.email)) {
      this.loading = true;

      this.registerForm.get('email')?.setValue(this.email);

      this.otpService.generateOtp(this.email, 'register').subscribe({
        next: (res) => {
          this.step++;
        },
        error: (err) => {

          this.customModalMessage = err.error.message || err.error || err.message;
          this.customModalTitle = 'Error de registro';
          this.customModalButtonText = 'Cerrar';
          this.showCustomModal = true;
          this.loading = false;

        },
      });
    } else if (this.step === 2 && this.form.controls['nombre'].valid) {
      this.step++;
    } else {
      this.step++;
    }
  }

  anterior() {
    if (this.step > 1) {
      this.step--;
    }
  }

  onSubmit(): void {

    if (this.registerForm.valid) {
      if (this.registerForm.value.password == this.registerForm.value.confirmPassword) {
        this.authService.register(this.registerForm.value).subscribe({
          next: (res) => {
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(res.user || {}));

            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.customModalMessage = err.error.message || err.error || err.message;
            this.customModalTitle = 'Error de registro';
            this.customModalButtonText = 'Cerrar';
            this.showCustomModal = true;
          },
        });

      } else {
        this.customModalMessage = 'Las contraseñas no coinciden';
        this.customModalTitle = 'Error de validación';
        this.customModalButtonText = 'Cerrar';
        this.showCustomModal = true;
      }
    } else {
      this.showFormErrors();
    }
  }

  showFormErrors() {
    this.customModalMessage = ''

    this.customModalMessage += `<ul class="error-list">`;
    this.customModalButtonText = 'Cerrar';
    this.customModalTitle = 'Errores en el formulario';
    Object.entries(this.registerForm.controls).forEach(([key, control]) => {
      if (control.errors) {
        const errors = control.errors;
        const messages = this.validationMessages[key];


        Object.keys(errors).forEach(errorKey => {
          this.customModalMessage += `<li>${messages[errorKey]} </li>`;

        });
      }
    });
    this.customModalMessage += `</ul>`;

    this.showCustomModal = true;
  }

  verificarOtp() {
    this.loading = true;
    this.otpService.verifyOtp(this.email, this.codigoFinal).subscribe({
      next: (res: { valid: any }) => {
        this.loading = false;
        if (res.valid) {
          this.step++;
        } else {
          this.loading = false;
          this.customModalMessage = 'Código OTP inválido. Por favor, inténtalo de nuevo.';
          this.customModalTitle = 'Error de registro';
          this.customModalButtonText = 'Cerrar';
          this.showCustomModal = true;
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.customModalMessage = err.error.message || err.error || err.message;
        this.customModalTitle = 'Error de registro';
        this.customModalButtonText = 'Cerrar';
        this.showCustomModal = true;
      },
    });
  }

  reenviarOtp() {

    this.loading = true;
    this.otpService.generateOtp(this.email, 'register').subscribe({
      next: (res) => {
        this.loading = false;
      },
    });
  }

  onTerminosChange(event: any) {
    const checked = event.target.checked;
    this.registerForm.get('aceptaTerminos')?.setValue(checked);
  }

  loadDocumentTypes(): void {
    this.documentTypeService.getDocumentTypes().subscribe({
      next: (data) => {
        this.documentTypes = data;
      },
      error: (err) => {
      },
    });
  }

  loadProvinces(): void {
    this.provinceService.getProvinces().subscribe({
      next: (data) => {
        this.provinces = data;
      },
      error: (err) => {
      },
    });
  }

  loadCities(provinceId: number): void {
    this.cityService.getCities(provinceId).subscribe({
      next: (data) => {
        this.cities = data;
      },
      error: (err) => {
      },
    });
  }

  onProvinceChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.loadCities(Number(selectedValue));
  }

  onRetry() {
    this.showCustomModal = false;
    // lógica para reintentar
  }

  onClose() {
    this.showCustomModal = false;
  }
}
