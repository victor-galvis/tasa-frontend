import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    console.log('Intentando iniciar sesión con:', this.email, this.password);
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);

        this.successMessage = 'Inicio de sesión exitoso ✅';
        this.errorMessage = '';

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorMessage = 'Usuario o contraseña incorrectos ❌';
        this.successMessage = '';
      },
    });
  }
}
