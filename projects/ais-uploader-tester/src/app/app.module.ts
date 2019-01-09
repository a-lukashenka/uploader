import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AisUploaderLibModule } from 'ais-uploader-lib';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AisUploaderLibModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
