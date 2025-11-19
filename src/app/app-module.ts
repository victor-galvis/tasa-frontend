import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Register } from './components/register/register';
import { Login } from './components/login/login';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Home } from './components/home/home';
import { Header } from './components/shared/header/header';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { provideLottieOptions, LottieComponent } from 'ngx-lottie';
import player from 'lottie-web';
import { Dashboard } from './components/dashboard/dashboard';
import { ContractModal } from './components/shared/contract-modal/contract-modal';
import { ViewInvoices } from './components/view-invoices/view-invoices';
import { NoContractsModal } from './components/shared/no-contracts-modal/no-contracts-modal';
import { AddressSelectModal } from './components/shared/address-select-modal/address-select-modal';
import { SuccessModal } from './components/shared/success-modal/success-modal';
import { CustomModal } from './components/shared/custom-modal/custom-modal';
import { ConfirmContractModal } from './components/shared/confirm-contract-modal/confirm-contract-modal';
import { PendingPayments } from './components/pending-payments/pending-payments';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    App,
    Register,
    Login,
    Home,
    Header,
    Dashboard,
    ContractModal,
    ViewInvoices,
    NoContractsModal,
    AddressSelectModal,
    SuccessModal,
    CustomModal,
    ConfirmContractModal,
    PendingPayments,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule, LottieComponent],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),
    provideLottieOptions({
      player: playerFactory,
    }),
  ],
  bootstrap: [App],
})
export class AppModule {}
