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