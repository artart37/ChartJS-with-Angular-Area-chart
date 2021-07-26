import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[isagoodfile]',
  providers: [{provide: NG_VALIDATORS, useExisting: OnlyJsonDirective, multi: true}]
})
export class OnlyJsonDirective implements Validator{
  @Input() isagoodfile:any;
  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
    let filetype = control.value.split(".").pop().toLowerCase()   
    return filetype === "json"?null:{"isjsonerror":true}
    }
    return null
  }
}