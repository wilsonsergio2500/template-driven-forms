import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialComponentsModule } from '@material/material.module';
import { FormControlItemDirective } from './directives/form-control-item.directive';
import { NgxChipsCaComponent } from './form-components/ngx-chips-ca/ngx-chips-ca.component';
import { ExampleFormComponent } from './forms/example-form.component';
import { NgxChipsNoneComponent } from './form-components/ngx-chips-none/ngx-chips-none.component';

@NgModule({
  declarations: [
    AppComponent,
    NgxChipsCaComponent,
    NgxChipsNoneComponent,
    FormControlItemDirective,
    ExampleFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialComponentsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
