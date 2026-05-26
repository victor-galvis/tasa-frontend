import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {

  siteKey = environment.recaptchaSiteKey;

  execute(action: string): Promise<string> {

    return new Promise((resolve, reject) => {

      grecaptcha.ready(() => {

        grecaptcha.execute(this.siteKey, { action })
          .then((token: string) => {
            resolve(token);
          })
          .catch((error: any) => {
            reject(error);
          });

      });

    });

  }

}