import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  user: any;

  initials: string = '';
  showSesionContainer = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) this.getInitials(this.user.name + ' ' + this.user.lastname);
  }
  toggleSesionContainer() {
    this.showSesionContainer = !this.showSesionContainer;
  }
  logout(): void {
    this.authService.logout();
  }
  getInitials(fullName: string): void {
    if (!fullName) this.initials = '';

    const parts = fullName
      .trim()
      .split(' ')
      .filter((p) => p.length > 0);

    if (parts.length === 1) {
      this.initials = parts[0].charAt(0).toUpperCase();
    }

    this.initials = (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
}
