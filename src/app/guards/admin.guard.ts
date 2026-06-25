import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private readonly ADMIN_EMAIL = '{process.env.ADMIN_EMAIL}';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(): boolean {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const payload = jwtDecode<{ email: string }>(token);
      if (payload.email === this.ADMIN_EMAIL) return true;
    } catch {}

    this.router.navigate(['/']);
    return false;
  }
}