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
  email: string = 'nelsonperlaza@gmail.com';
  btnDisabled: boolean = true;
  loading = false;
  documentTypes: DocumentTypes[] = [];
  selectedDocumentType: number | null = null;
  regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  provinces: ProvinceModel[] = [];
  cities: CityModel[] = [];

  loadingOptions: AnimationOptions = {
    path: '/loading.json', // pon aquí tu .json de Lottie
    loop: true,
    autoplay: true,
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
      email: [this.email, [Validators.required, Validators.email]],

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

  inputs = Array(5);
  codigo: string[] = ['', '', '', '', ''];

  validateEmail(value: string): void {
    this.email = value;

    let result = this.regex.test(this.email);
    this.btnDisabled = !result;
  }

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

  siguiente() {
    if (this.step === 1 && this.regex.test(this.email)) {
      this.loading = true;

      this.otpService.generateOtp(this.email).subscribe({
        next: (res) => {
          this.step++;
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

  enviar() {
    if (this.form.valid) {
      alert('Registro completado con éxito ✅');
    }
  }
  onSubmit(): void {
    console.log('Formulario de registro enviado:', this.registerForm.value);
    if (this.registerForm.value.password == this.registerForm.value.confirmPassword) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user || {}));

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error en login:', err);
        },
      });

      if (this.registerForm.valid) {
        console.log(this.registerForm.value);
      }
    } else {
      alert('Las contraseñas no coinciden');
    }
  }

  verificarOtp() {
    const codigoFinal = this.getCodigoFinal();
    console.log('Código OTP ingresado:', codigoFinal);
    this.loading = true;
    this.otpService.verifyOtp(this.email, codigoFinal).subscribe({
      next: (res: { valid: any }) => {
        console.log('OTP verificado:', res);
        this.loading = false;
        if (res.valid) {
          this.step++;
        } else {
          alert('Código OTP inválido. Por favor, inténtalo de nuevo.');
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error al verificar OTP:', err);
        alert('Error al verificar el código OTP. Por favor, inténtalo de nuevo.');
      },
    });
  }
  reenviarOtp() {
    console.log('Reenviando OTP a', this.email);

    this.loading = true;
    this.otpService.generateOtp(this.email).subscribe({
      next: (res) => {
        console.log('OTP reenviado:', res);
        this.loading = false;
        alert('Código OTP reenviado con éxito.');
      },
    });
  }
  toggleTerminos() {
    this.aceptaTerminos = !this.aceptaTerminos;
  }
  loadDocumentTypes(): void {
    this.documentTypeService.getDocumentTypes().subscribe({
      next: (data) => {
        this.documentTypes = data;
      },
      error: (err) => {
        console.error('Error al cargar tipos de documento', err);
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
  onProvinceChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log('Provincia seleccionada:', selectedValue);
    this.loadCities(Number(selectedValue));
  }
}
