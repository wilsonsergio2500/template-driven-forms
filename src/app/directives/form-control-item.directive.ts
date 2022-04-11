import {
  Directive,
  Inject,
  Input,
  ElementRef,
  OnInit,
  HostBinding,
  OnDestroy,
  Optional,
} from '@angular/core';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { defaultErrorMessages } from './default-error-messages';

@Directive({
  selector: 'mat-error[formControlItem]',
})
export class FormControlItemDirective implements OnInit, OnDestroy {
  @Input() formControlItem: string | null = null;
  @Input() errors: any = null;
  @Input() showOnFormTouched: boolean = false;

  tracker: Subscription | null = null;

  @HostBinding('hidden') hidden: boolean = true;

  constructor( @Optional() @Inject(FormGroupDirective) private formGroupService: FormGroupDirective, private ngForm: NgForm, private element: ElementRef ) {}

  private _errors: any = defaultErrorMessages;

  ngOnInit(): void {
    const fgroup: any = this.ParentForm;

    if (!!this.errors) {
      this._errors = { ...this._errors, ...this.errors };
    }
    if (!!fgroup.__errors) {
      this._errors = { ...this._errors, ...fgroup.__errors };
    }
    if (
      !!fgroup.__contractErrors &&
      !!fgroup.__contractErrors[this.formControlItem as string]
    ) {
      this._errors = {
        ...this._errors,
        ...fgroup.__contractErrors[this.formControlItem as string],
      };
    }

    this.changeTracker();
  }

  get ParentForm() {
    return this.formGroupService?.form ?? this.ngForm.form;
  }

  changeTracker() {
    const onHappen = (x: boolean) => {
      this.hidden = !x;
      const msg = this.hidden ? '' : this.errorMessage;
      if (!!msg) {
        this.element.nativeElement.innerText = msg;
      }
    };

    this.tracker = interval(250)
      .pipe(map((ev) => this.errorMessage && this.ControlTouched))
      .subscribe(onHappen);
  }
  get errorMessage() {
    const formControl = this.ParentForm.get(this.formControlItem as string);
    if (!!formControl && !!formControl.errors) {
      const keys = Object.keys(formControl.errors);
      return this._errors[keys[0]] || null;
    }
    return null;
  }

  get ControlTouched() {
    const formControl = this.ParentForm.get(this.formControlItem as string);
    if (this.showOnFormTouched) {
      if (formControl) {
        return formControl?.parent?.touched ?? false;
      }
    } else {
      if (formControl) {
        return formControl.touched || (this.ngForm?.submitted ?? false);
      }
    }
    return true;
  }

  ngOnDestroy() {
    (this.tracker as Subscription).unsubscribe();
  }
}
