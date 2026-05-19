import { Component, inject, signal } from '@angular/core';
import { AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, firstValueFrom, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly formBuilder = inject(FormBuilder);

  private readonly addressSubmitAsyncValidator: AsyncValidatorFn = async (control) => {
    const addressValue = (control.value ?? '').toString().trim();
    if (!addressValue) {
      return null;
    }

    // Placeholder for future async address verification flow.
    const isConfirmed = window.confirm('Are you sure?');
    await Promise.resolve();
    return isConfirmed ? null : { addressNotConfirmed: true };
  };

  protected readonly title = signal('angular-async-form-test');

  protected readonly form = this.formBuilder.group({
    address: this.formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(5)],
      asyncValidators: [this.addressSubmitAsyncValidator],
      updateOn: 'submit',
    }),
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    age: [null as number | null, [Validators.required, Validators.min(0), Validators.max(120)]],
  });

  protected submitted = false;

  protected hasError(controlName: 'address' | 'firstName' | 'lastName' | 'age', errorName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }

    const shouldShowError = control.touched || control.dirty || this.submitted;
    return shouldShowError && control.hasError(errorName);
  }

  protected async onSubmit(): Promise<void> {
    this.submitted = true;
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.pending) {
      await firstValueFrom(
        this.form.statusChanges.pipe(
          startWith(this.form.status),
          filter((status) => status !== 'PENDING')
        )
      );
    }

    if (this.form.invalid) {
      return;
    }

    console.log('Form submitted', this.form.value);
  }
}
