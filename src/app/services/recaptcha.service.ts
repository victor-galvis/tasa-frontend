import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {

  private siteKey = environment.recaptchaSiteKey;
  private loaded = false;

  private loadScript(): Promise<void> {
    return new Promise((resolve) => {
      if (this.loaded) return resolve();
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async execute(action: string): Promise<string> {
    await this.loadScript();
    return new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(this.siteKey, { action })
          .then((token: string) => resolve(token))
          .catch((error: any) => reject(error));
      });
    });
  }
}