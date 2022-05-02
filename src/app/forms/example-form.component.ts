import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'example-form',
  templateUrl: 'example-form.component.html',
  styleUrls: ['example-form.component.scss'],
})
export class ExampleFormComponent {

  chipErrorMessage = {
    wrongMinSize: "Must have at least 3"
  }
  phoneErrors = {
    required: "Every phone number must be valid"
  }

  onSubmit(form: NgForm) {
    console.log(form);
  }
}
