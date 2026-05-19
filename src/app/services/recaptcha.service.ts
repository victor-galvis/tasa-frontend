import { Injectable } from '@angular/core';

declare var grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {

  siteKey = '6LdBTfIsAAAAAE1Gmgp-fQS_0Hev3mdbzNsLXCpS';

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