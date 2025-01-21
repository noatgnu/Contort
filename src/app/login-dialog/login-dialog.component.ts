import { Component } from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {WebService} from "../web.service";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

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
    MatButton
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss'
})
export class LoginDialogComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  })
  errorMessage = '';
  constructor(
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private webService: WebService,
    private fb: FormBuilder
  ) {}

  login() {
    if (this.form.invalid) {
      return;
    }
    if (this.form.value.username && this.form.value.password) {
      this.webService.login(this.form.value.username, this.form.value.password).subscribe({
        next: (response) => {
          localStorage.setItem('contortToken', response.token);
          this.dialogRef.close(true);

        },
        error: (error) => {
          this.errorMessage = 'Login failed. Please try again.';
        }
      });
    }

  }

  close() {
    this.dialogRef.close(false);
  }

  connectKeycloak() {
    this.webService.getLoginProviderRedirect()
  }

}
