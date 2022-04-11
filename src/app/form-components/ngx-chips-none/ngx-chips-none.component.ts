import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input, HostBinding, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, of, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'ngx-chips-none',
  templateUrl: 'ngx-chips-none.component.html',
  styleUrls: [`ngx-chips-none.component.scss`]
})
export class NgxChipsNoneComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Add elements..';
  @Input() optionLabel: string | null = null;
  @Input() optionKey: string | null = null;
  @Input() options: Observable<any[]> = of([]);
  @Input() forceOptionValue: boolean = false;
  @Input() maxItems: number | null = null;
  @Input() min: number = 3;

  @Input() required: boolean = false;

  static nextId = 0;
  @HostBinding() id = `ngx-chips-ca-${NgxChipsNoneComponent.nextId++}`;
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


  @ViewChild('elementInput') elementInput: ElementRef | null = null;
  @ViewChild('auto') matAutocomplete: MatAutocomplete | null = null;

  onOptions$: Subscription | null = null;

  constructor() { }
  value: NgxChipsNoneComponent | null = null;
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
            const option = this._options.find((x) => (x[this.optionLabel as string] as string).toLowerCase() === value.toLowerCase());
            if (option) {
              this.addItem(option);
            }
          }
        } else {
          const exist = this._array.find((g) => (g as string).toLowerCase() === value.toLowerCase());
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

      this.markInputAsEmpty();
    }
  }

  onBlur() {
    this.focused = false;
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

    this.markInputAsEmpty();
  }

  remove(obj: any): void {
    if (!!this.optionKey) {
      const filtered = this._array.filter(
        (g) => g[this.optionKey as string] != obj[this.optionKey as string]
      );
      this._array = filtered;
    } else {
      const filtered = this._array.filter((g) => g != obj);
      this._array = filtered;
    }
  }

  label(obj: any) {
    if (!!this.optionLabel) {
      return obj[this.optionLabel];
    } else {
      return obj;
    }
  }

  setDisabledState?(isDisabled: boolean): void {
    this._disable = isDisabled;
    this.removable = false;
  }

  ngOnInit() {
    this.onOptions$ = this.options.subscribe((x) => (this._options = x));
  }

  ngOnDestroy() {
    if (this.onOptions$) {
      this.onOptions$.unsubscribe();
    }
  }
}
