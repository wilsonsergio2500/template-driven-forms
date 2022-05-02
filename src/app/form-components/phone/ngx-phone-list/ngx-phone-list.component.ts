import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { ElementRef, Optional, Self, ViewChildren } from '@angular/core';
import { Component, HostBinding, Input } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl, NgForm, ValidationErrors, ValidatorFn } from '@angular/forms';
import {  MatFormFieldControl } from '@angular/material/form-field';
import { delay, of } from 'rxjs';
import { Subject, Subscription, tap } from 'rxjs';
import { AbstractControlExtendedForPhone, MyTel } from '../ngx-phone/ngx-phone.component';

export type PhoneItem = string | MyTel | null
export type PhoneListValue = PhoneItem[];

const OnDelay = (p: () => void) => of(1).pipe(
  delay(100),
  tap(p)
);


@Component({
  selector: 'ngx-phone-list',
  templateUrl: 'ngx-phone-list.component.html',
  styleUrls: [`ngx-phone-list.component.scss`],
  providers: [{ provide: MatFormFieldControl, useExisting: NgxPhoneListComponent }],
  host: {
    '[attr.aria-invalid]': '(required) ? null : errorState',
    '[attr.aria-required]': 'required',
  }
})
export class NgxPhoneListComponent implements MatFormFieldControl<PhoneListValue>, ControlValueAccessor {

  static nextId = 0;
  focused: boolean = false;
  touched: boolean = false;
 //sortOptionsByField = 'name';
  controlType?: string = 'ngx-phone-list';
  autofilled?: boolean | undefined;
  propagateChange = (_: any) => ({});
  propagateTouched = () => ({});
  stateChanges = new Subject<void>();
  private val: PhoneListValue = [];

  protected _placeholder: string = 'List of Phone Numbers';
  private _disabled = false;
  private _required = false;

  get name() { return 'ngx-phone-list'; }
  @ViewChildren('ngForm') ngForms: Array<NgForm> = new Array<NgForm>();
  ngFormSubs: Subscription[] = [];
  delaySubs: Subscription[] = [];


  @HostBinding() id = `${this.name}-${NgxPhoneListComponent.nextId++}`;
  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.hasAnyFormControlFocus;
  }

  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean { return this._required; }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get value() { return this.val; }
  set value(val: PhoneListValue) {
    this.writeValue(val);
    this.stateChanges.next();
  }

  constructor(
    protected _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    protected _platform: Platform,
    @Optional() @Self() public ngControl: NgControl,
  ) {

    this.id = this.id;

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    this.registerValidator();
  }

  ngOnInit() {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  registerValidator() {
    if (this.ngControl?.control) {
      this.ngControl.control.validator = this.validate();
    }
  }

  validate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      if (this.required) {
        if (this.hasAnyFormBeenInvalid) {
          return { required: true };
        }
      }

      return null;
    }
  }

  remove(i: number) {
    const delg = (g: PhoneItem, index: number) => index !== i;
    this.phones = this.phones.filter(delg);
    this.value = this.value.filter(delg);
    this.propagateChange(this.value);

    this.delayThis(() => {
      this.ngControl?.control?.updateValueAndValidity();
      this.stateChanges.next();

    })
    
  }

  delayThis(p: () => void) {
    const doDelayed$ = OnDelay(p);
    this.delaySubs = [...this.delaySubs, doDelayed$.subscribe()];
  }



  phones: PhoneItem[] = [];
  add() {
    this.phones = [...this.phones, new MyTel('', '', '')];
    console.log(this.ngForms);
    setTimeout(() => this.subscribeFormChanges());
    this.stateChanges.next();
  }

  subscribeFormChanges() {
    this.destroyNgForms();
    this.ngForms.forEach((ngF, index) => {

      const { controls: { phone } } = ngF.form;
      const { valueChanges } = phone;

      const forcedArrary = () => this.value = !!this.value ? this.value : [];

      const onchange$ = valueChanges.pipe(
        tap((phone: MyTel) => {
          forcedArrary();
          if (phone) {
            const { area, exchange, subscriber } = phone;
            this.value[index] = `${area}${exchange}${subscriber}`;
          } else {
            this.value[index] = null;
          }
          this.propagateChange(this.value);

          
        }),
        delay(100),
        tap(() => {
          this.ngControl.control?.updateValueAndValidity();
          this.stateChanges.next();
        })
      )

      this.ngFormSubs = [...this.ngFormSubs, onchange$!.subscribe()];

    })

  }
  destroyNgForms() {
    if (this.ngFormSubs?.length) {
      this.ngFormSubs.forEach(s => s.unsubscribe());
    }
  }


  onContainerClick(event: MouseEvent) {
    this.focused = true;
  }

  setDescribedByIds(ids: string[]) {
    if (ids.length) {
      this._elementRef.nativeElement.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this._elementRef.nativeElement.removeAttribute('aria-describedby');
    }
  }


  get errorState(): boolean {
    return ((this.ngControl?.control?.touched ?? false) || ((this.ngControl as any)?._parent?.submitted ?? false) || this.touched)
      && (!!this.ngControl?.control?.errors ?? false);
  }


  get hasAnyFormBeenTouched() {
    return this.ngForms?.some(g => g.form.touched) ?? false;
  }
  get hasAnyFormBeenInvalid() {
    return this.ngForms?.some(g => !!g.form.invalid)
  }
  get hasAnyFormControlFocus() {
    return this.ngForms?.some(g => (g.form.controls?.['phone'] as AbstractControlExtendedForPhone)?.focused ?? false)
  }

  ngDoCheck() {

    if ((this.ngControl as any)?._parent?.submitted ?? false) {
      this.touched = true;
      this.propagateTouched();
      this.ngForms.forEach(x => x.form.controls?.['phone'].markAsTouched());
      this.delayThis(() => {
        this.stateChanges.next();
      })
    }

  }

  get empty() {
    return !!!this.val?.length;
  }

  writeValue(obj: PhoneListValue): void {
    this.val = obj;
  }
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.destroyNgForms();
    if (this.delaySubs?.length) {
      this.delaySubs.forEach(s => s.unsubscribe());
    }
  }


}
