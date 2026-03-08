import { Component, signal } from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {WebService} from "../web.service";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel, MatError, MatHint, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-login-dialog',
  imports: [
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatDialogActions,
    MatButton,
    MatError,
    MatHint,
    MatSuffix,
    MatIcon,
    MatIconButton,
    MatProgressSpinner
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss'
})
export class LoginDialogComponent {
  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  errorMessage = '';
  isLoading = signal(false);
  hidePassword = signal(true);

  constructor(
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private webService: WebService,
    private fb: FormBuilder
  ) {}

  login(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    if (this.form.value.username && this.form.value.password) {
      this.isLoading.set(true);
      this.errorMessage = '';
      this.webService.login(this.form.value.username, this.form.value.password).subscribe({
        next: (response) => {
          localStorage.setItem('contortToken', response.token);
          this.isLoading.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage = 'Invalid username or password. Please try again.';
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  getErrorMessage(field: 'username' | 'password'): string {
    const control = this.form.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }

  close() {
    this.dialogRef.close(false);
  }

  connectKeycloak() {
    this.webService.getLoginProviderRedirect()
  }

}
