import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartJsComponent } from '../chart-js.component';
import { OnlyJsonDirective } from '../directives/onlyjson.directive';




@NgModule({
  declarations: [ChartJsComponent, OnlyJsonDirective],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports:[
    ChartJsComponent,
    OnlyJsonDirective,
  ]
})
export class ChartJsModule { }
