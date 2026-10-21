import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(): boolean {
    // Evitar localStorage en el servidor
    if (typeof window === 'undefined') {
      return true;
    }

    if (this.authService.isAdmin()) return true;

    this.router.navigate(['/dashboard']);
    return false;
  }
}
