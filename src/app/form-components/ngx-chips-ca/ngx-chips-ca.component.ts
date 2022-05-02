import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NgControl,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Observable, of, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'ngx-chips-ca',
  templateUrl: './ngx-chips-ca.component.html',
  styleUrls: ['./ngx-chips-ca.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: NgxChipsCaComponent }
  ],
})
export class NgxChipsCaComponent
  implements
    ControlValueAccessor,
    OnInit,
    OnDestroy,
    Validator,
    MatFormFieldControl<NgxChipsCaComponent>
{
  @Input() placeholder: string = 'Add elements..';
  @Input() optionLabel: string | null = null;
  @Input() optionKey: string | null = null;
  @Input() options: Observable<any[]> = of([]);
  @Input() forceOptionValue: boolean = false;
  @Input() maxItems: number | null = null;
  @Input() min: number = 3;

  @Input() required: boolean = false;

  static nextId = 0;
  @HostBinding() id = `ngx-chips-ca-${NgxChipsCaComponent.nextId++}`;
  stateChanges = new Subject<void>();

  _options: any[] = [];
  _disable: boolean = false;
  _array: any[] = [];
  removable = true;
  addOnBlur = true;
  selectable = true;
  focused: boolean = false;
  autofilled?: boolean;
  userAriaDescribedBy?: string;
  shouldPlaceholderFloat: boolean = false;
  disabled: boolean = false;
  controlType?: string;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  propagateChange = (_: any) => ({});
  propagateTouched = () => ({});
  private touched = false;


  @ViewChild('elementInput') elementInput: ElementRef | null = null;
  @ViewChild('auto') matAutocomplete: MatAutocomplete | null = null;

  onOptions$: Subscription  | null= null;

  constructor(@Optional() @Self() public ngControl: NgControl) {}
  value: NgxChipsCaComponent | null = null;
  registerOnValidatorChange(fn: () => void): void { }


  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  setDescribedByIds(ids: string[]): void { }

  get componentInputEelement() {
    return this.elementInput as ElementRef;
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() == 'input') {
      this.componentInputEelement.nativeElement.focus();
      this.focused = true;
    }
  }

  get errorState(): boolean {
    return (this.touched || ((this.ngControl as any)?._parent?.submitted ?? false)) && (!!this.ngControl?.control?.errors ?? false);
  }

  get empty() {
    return (this._array?.length ?? 0) == 0;
  }


  add(event: MatChipInputEvent): void {
    if (!(this.matAutocomplete as MatAutocomplete).isOpen) {
      const value = event.value;

      if (!!value) {
        if (!!this.optionLabel && !!this.optionKey) {
          const exist = this._array.find((g) => (g[this.optionLabel as string] as string).toLowerCase() === value.toLowerCase());
          if (!exist) {
            const option = this._options.find( (x) => (x[this.optionLabel as string] as string).toLowerCase() === value.toLowerCase() );
            if (option) {
              this.addItem(option);
            }
          }
        } else {
          const exist = this._array.find( (g) => (g as string).toLowerCase() === value.toLowerCase() );
          if (!exist) {
            if (this.forceOptionValue) {
              const option = this._options.find((g) => (g as string).toLowerCase() === value.toLowerCase());
              if (option) {
                this.addItem(option);
              }
            } else {
              this.addItem(value);
            }
          }
        }
      }

      this.propagateChange(this._array);
      this.markControlAsTouched();
      this.markInputAsEmpty();
    }
  }

  onBlur() {
    this.focused = false;
    this.markControlAsTouched();
  }

  addItem(item: any) {
    if (this.maxItems) {
      if (this._array.length < +this.maxItems) {
        this._array.push(item);
      }
    } else {
      this._array.push(item);
    }
  }

  markInputAsEmpty() {
    this.componentInputEelement.nativeElement.value = '';
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;

    if (!!this.optionLabel && !!this.optionKey) {
      const exist = this._array.find((g) => (g[this.optionLabel as string] as string).toLowerCase() === value.toLowerCase());
      if (!exist) {
        const option = this._options.find((x) => (x[this.optionLabel as string] as string).toLowerCase() === value.toLowerCase());
        if (option) {
          this._array.push(option);
        }
      }
    } else {
      const exist = this._array.find((g) => (g as string).toLowerCase() === value.toLowerCase());
      if (!exist) {
        if (this.forceOptionValue) {
          const option = this._options.find((g) => (g as string).toLowerCase() === value.toLowerCase());
          if (option) {
            this._array.push(option);
          }
        } else {
          this._array.push(value);
        }
      }
    }

    this.propagateChange(this._array);
    this.propagateTouched();
    this.markInputAsEmpty();
  }

  remove(obj: any): void {
    if (!!this.optionKey) {
      const filtered = this._array.filter(
        (g) => g[this.optionKey as string] != obj[this.optionKey as string]
      );
      this._array = filtered;
      this.propagateChange(this._array);
      this.propagateTouched();
    } else {
      const filtered = this._array.filter((g) => g != obj);
      this._array = filtered;
      this.propagateChange(this._array);
      this.propagateTouched();
    }
  }

  label(obj: any) {
    if (!!this.optionLabel) {
      return obj[this.optionLabel];
    } else {
      return obj;
    }
  }

  writeValue(values: any[]): void {
    if (values?.length) {
      this._array = values;
      this.stateChanges.next();
    }
  }
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this._disable = isDisabled;
    this.removable = false;
  }

  markControlAsTouched() {
    this.touched = true;
    this.propagateTouched();
    if (this.ngControl?.control) {
      this.ngControl.control.markAsTouched();
    }
    
  }

  ngOnInit() {
    this.onOptions$ = this.options.subscribe((x) => (this._options = x));
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    this.registerValidator();
  }

  registerValidator() {
    if (this.ngControl?.control) {
      this.ngControl.control.validator = this.validate();
    }
  }

  validate(): ValidatorFn {
    return (control: AbstractControl) : ValidationErrors | null => {
      const size = this._array?.length ?? 0;
      const hasNoItems = size == 0;
      if (hasNoItems && this.required) {
        return { required: true };
      }
      if (size < this.min) {
        return { wrongMinSize: true }
      }

      return null;
    }
  }

  ngOnDestroy() {
    if (this.onOptions$) {
      this.onOptions$.unsubscribe();
    }
  }
}
