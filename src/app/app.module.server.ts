import { NgModule } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { App } from './app';
import { AppModule } from './app-module';
import { serverRoutes } from './app.routes.server';
import { provideHttpClient, withFetch } from '@angular/common/http';

@NgModule({
  imports: [AppModule],
  providers: [provideServerRendering(withRoutes(serverRoutes)),
     provideHttpClient(withFetch()),
  ],
  bootstrap: [App],
})
export class AppServerModule {}
