import { Component } from '@angular/core';
import { DocumentTypeService } from '../../services/document-type/document.type.service';
import { AuthService } from '../../services/auth/auth.service';
import { OtpService } from '../../services/otp/otp.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnimationOptions } from 'ngx-lottie';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  constructor(
    private otpService: OtpService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object

  ) {
    this.forgotPasswordForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
    });

    this.changePasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
        ],
      ],
    });
  }

  showCustomModal = false;
  customModalTitle = '';
  customModalMessage = '';
  customModalType = 'error';
  customModalButtonText = '';


  otpSuccess: boolean = false;
  otpSend: boolean = false;
  codigoFinal: string = '';
  step = 1;
  loading = false;
  isBrowser = false;
  forgotPasswordForm!: FormGroup
  changePasswordForm!: FormGroup
  loadingOptions: AnimationOptions = {
    path: '/loading.json',
    loop: true,
    autoplay: true,
    
  };

  continuar() {
    this.loading = true;

    const email = this.forgotPasswordForm.value.email;
    this.userService.existsEmail(email).subscribe({
      next: (res: any) => {

        if (res.exists) {
          this.otpService.generateOtpPasswordRecovery(email, 'forgot-password').subscribe({
            next: (res) => {

              this.otpSend = true;
              this.loading = false;
              this.step++;
            },
            error: (err) => {
              this.loading = false;
              this.customModalMessage = err.error.message || err.error || err.message;
              this.customModalTitle = 'Error';
              this.customModalButtonText = 'Cerrar';
              this.showCustomModal = true;
            },
          });
        } else {
          this.customModalMessage = 'El correo electrónico no está registrado.';
          this.customModalTitle = 'Error';
          this.customModalButtonText = 'Cerrar';
          this.showCustomModal = true;
          this.otpSend = false;
        }

      },
      error: (err) => {
        this.loading = false;
        this.otpSend = false;
        this.customModalMessage = err.error.message || err.error || err.message;
        this.customModalTitle = 'Error';
        this.customModalButtonText = 'Cerrar';
        this.showCustomModal = true;
        this.loading = false;
      },
    });
  }

  reenviarOtp() {
    const email = this.forgotPasswordForm.value.email;
    this.loading = true;
    this.otpService.generateOtpPasswordRecovery(email, 'forgot-password').subscribe({
      next: (res) => {
      },
      error: (err) => { },
    });
  }

  verificarOtp() {
    const email = this.forgotPasswordForm.value.email;
    this.loading = true;
    this.otpService.verifyOtp(email, this.codigoFinal).subscribe({
      next: (res: { valid: any }) => {

        this.loading = false;
        if (res.valid) {
          this.step++;
        } else {
          this.loading = false;

          this.customModalMessage = 'Código OTP inválido. Por favor, inténtalo de nuevo.';
          this.customModalTitle = 'Error';
          this.customModalButtonText = 'Cerrar';
          this.showCustomModal = true;

        }
      },
      error: (err: any) => {
        this.loading = false;

        this.customModalMessage = err.error.message || err.error || err.message;
        this.customModalTitle = 'Error';
        this.customModalButtonText = 'Cerrar';
        this.showCustomModal = true;

      },
    });
  }

  recibirCodigo(codigo: string) {
    console.log("codigo recibido", codigo);
    this.codigoFinal = codigo.trim();
  }

  onChangePassword(): void {

    if (this.changePasswordForm.value.password !== this.changePasswordForm.value.confirmPassword) {
      this.customModalMessage = 'Las contraseñas no coinciden';
      this.customModalTitle = 'Error de validación';
      this.customModalButtonText = 'Cerrar';
      this.showCustomModal = true;
      return;
    } else {
      const email = this.forgotPasswordForm.value.email;
      const newPassword = this.changePasswordForm.value.password;
      this.userService.resetPassword(email, newPassword).subscribe({
        next: (res) => {
          this.customModalMessage = 'Contraseña cambiada exitosamente.';
          this.customModalTitle = 'Éxito';
          this.customModalType = 'success';
          this.customModalButtonText = 'Cerrar';
          this.showCustomModal = true;
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 3000);
        },
        error: (err) => {
          this.customModalMessage = err.error.message || err.error || err.message;
          this.customModalTitle = 'Error';
          this.customModalButtonText = 'Cerrar';
          this.showCustomModal = true;
        },
      });
    }
  }

  onRetry() {
    this.showCustomModal = false;
  }

  onClose() {
    this.showCustomModal = false;
  }
}
