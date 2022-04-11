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

  onSubmit(form : NgForm) {
    console.log(form);
  }
}
