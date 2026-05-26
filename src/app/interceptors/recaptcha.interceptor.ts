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

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const protectedRoutes = [
      '/auth/login',
      '/users/register',
      '/users/reset-password',
      '/otp/generate-otp',
      '/otp/generate-otp-forgot-password',
      '/otp/verify-otp'
    ];
    const shouldIntercept = protectedRoutes.some(route => req.url.includes(route));

    if (!shouldIntercept) {
      return next.handle(req);
    }

    return from(this.recaptchaService.execute('api_request'))
      .pipe(

        switchMap((token: string) => {

          const clonedRequest = req.clone({
            setHeaders: {
              recaptcha: token
            }
          });

          return next.handle(clonedRequest);

        })

      );

  }

}