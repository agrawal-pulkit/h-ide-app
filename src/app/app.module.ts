
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { CodeEditorModule } from './code-editor';

import { AppComponent } from './app.component';
import { MainPageComponent } from './pages/main-page/main-page.component';

import { servicesArray } from './../services/';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CodeEditorModule,
    AppRoutingModule,
  ],
  providers: [servicesArray],
  bootstrap: [AppComponent]
})
export class AppModule { }