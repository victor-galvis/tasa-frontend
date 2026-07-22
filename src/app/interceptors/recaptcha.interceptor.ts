import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { RecaptchaService } from '../services/recaptcha.service';

@Injectable()
export class RecaptchaInterceptor implements HttpInterceptor {

  constructor(private recaptchaService: RecaptchaService) {}

  // ✅ Mapeo ruta → acción (debe coincidir exactamente con el backend)
  private readonly protectedRoutes: Record<string, string> = {
    '/auth/login':                        'login',
    '/users/register':                    'register',
    '/users/reset-password':              'reset_password',
    '/otp/generate-otp-forgot-password':  'otp_forgot_password', // ← va antes
    '/otp/generate-otp':                  'generate_otp',
    '/otp/verify-otp':                    'verify_otp',
  };

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const matchedRoute = Object.keys(this.protectedRoutes)
      .find(route => req.url.includes(route));

    if (!matchedRoute) {
      return next.handle(req);
    }

    const action = this.protectedRoutes[matchedRoute]; // ✅ acción específica

    return from(this.recaptchaService.execute(action)).pipe(
      switchMap((token: string) => {
        const clonedRequest = req.clone({
          setHeaders: { recaptcha: token }
        });
        return next.handle(clonedRequest);
      })
    );
  }
}