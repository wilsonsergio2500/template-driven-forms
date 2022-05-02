import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ViewChild, Input, Optional, Inject, OnDestroy, HostBinding, ElementRef, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NgControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';
import { Subject } from 'rxjs';

type HtmlElementOrNull = HTMLInputElement | null;
export interface AbstractControlExtendedForPhone extends AbstractControl { focused: boolean}

export class MyTel {
  constructor(public area: string, public exchange: string, public subscriber: string) { }
}

@Component({
  selector: 'ngx-phone',
  templateUrl: 'ngx-phone.component.html',
  styleUrls: [`ngx-phone.component.scss`],
  providers: [{ provide: MatFormFieldControl, useExisting: NgxPhoneComponent }],
})
export class NgxPhoneComponent implements MatFormFieldControl<MyTel>, ControlValueAccessor, OnDestroy {
  static nextId = 0;
  @ViewChild('area') areaInput: HtmlElementOrNull = null;
  @ViewChild('exchange') exchangeInput: HtmlElementOrNull = null;
  @ViewChild('subscriber') subscriberInput: HtmlElementOrNull = null;

  parts: FormGroup;
  stateChanges = new Subject<void>();
  focused = false;
  touched = false;
  controlType = 'tel-input';
  id = `tel-input-${NgxPhoneComponent.nextId++}`;
  onChange = (_: any) => { };
  onTouched = () => { };

  get empty() {
    const {
      value: { area, exchange, subscriber },
    } = this.parts;

    return !area && !exchange && !subscriber;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input('aria-describedby') userAriaDescribedBy: string = "add phone number";

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder: string = "Phone Number";

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.parts.disable() : this.parts.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): MyTel | null {
    if (this.parts.valid) {
      const {
        value: { area, exchange, subscriber },
      } = this.parts;
      return new MyTel(area, exchange, subscriber);
    }
    return null;
  }
  set value(tel: MyTel | null) {
    const { area, exchange, subscriber } = tel || new MyTel('', '', '');
    this.parts.setValue({ area, exchange, subscriber });
    this.stateChanges.next();
  }

  get errorState(): boolean {
    return this.parts.invalid && (this.touched || this.ngControl.touched || ((this.ngControl as any)?._parent?.submitted ?? false));
  }

  constructor(
    formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    this.parts = formBuilder.group({
      area: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      exchange: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      subscriber: [null, [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    });

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

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngDoCheck() {
    if (((this.ngControl as any)?._parent?.submitted ?? false) || (this.ngControl.touched)) {
      this.onTouched();
      this.stateChanges.next();
    }
  }

  get partControls() {
    const { area, exchange, subscriber } = this.parts.controls;
    return { area, exchange, subscriber };
  }

  get hasEmptyStateValue() {
    return !!!`${this.partControls.area.value}${this.partControls.exchange.value}${this.partControls.subscriber.value}`;
  }

  validate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (this.required) {
        if (this.hasEmptyStateValue) {
          return { required: true }
        }
      }

      return null;
    }
  }


  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      (this.ngControl?.control as AbstractControlExtendedForPhone).focused = this.focused;
      this.stateChanges.next();
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched = true;
      this.focused = false;
      (this.ngControl?.control as AbstractControlExtendedForPhone).focused = this.focused;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  autoFocusNext(control: AbstractControl, nextElement?: HTMLInputElement): void {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, 'program');
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, 'program');
    }
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.tel-input-container',
    )!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

   get formControls() {
    const controls = this.parts.controls;
    const { subscriber, exchange, area } = controls as any;
    return { subscriber, exchange, area }
  }

  onContainerClick() {
    const controls = this.parts.controls;
    const { subscriber, exchange, area } = controls as any;

    if (subscriber.valid) {
      this._focusMonitor.focusVia(this.subscriberInput as HTMLInputElement, 'program');
    } else if (exchange.valid) {
      this._focusMonitor.focusVia(this.subscriberInput as HTMLInputElement, 'program');
    } else if (area.valid) {
      this._focusMonitor.focusVia(this.exchangeInput as HTMLInputElement, 'program');
    } else {
      this._focusMonitor.focusVia(this.areaInput as HTMLInputElement, 'program');
    }
  }

  writeValue(tel: MyTel | null): void {
    this.value = tel;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
    this.stateChanges.next();
  }


}
