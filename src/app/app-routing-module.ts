import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Dashboard } from './components/dashboard/dashboard';
import { ViewInvoices } from './components/view-invoices/view-invoices';
import { PendingPayments } from './components/pending-payments/pending-payments';
import { AuthGuard } from './guards/auth-guard';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { DesbloquearComponent } from './components/desbloquear/desbloquear.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'view-invoices', component: ViewInvoices, canActivate: [AuthGuard] },
  { path: 'pending-payments', component: PendingPayments, canActivate: [AuthGuard] },
  { path: 'desbloquear', component: DesbloquearComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
