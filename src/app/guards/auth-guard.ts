import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  canActivate(): boolean {
    // Evitar localStorage en el servidor
    if (typeof window === 'undefined') {
      return true; // permitir render SSR
    }

    if (this.auth.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
