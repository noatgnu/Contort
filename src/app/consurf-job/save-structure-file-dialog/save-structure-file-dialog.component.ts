import { Component } from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-save-structure-file-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatLabel,
    MatInput,
    MatFormField,
    MatButton,
    MatDialogActions
  ],
  templateUrl: './save-structure-file-dialog.component.html',
  styleUrl: './save-structure-file-dialog.component.scss'
})
export class SaveStructureFileDialogComponent {
  form = this.fb.group({
    name: ['', Validators.required]
  })
  constructor(private dialogRef: MatDialogRef<SaveStructureFileDialogComponent>, private fb: FormBuilder) { }

  save() {
    this.dialogRef.close(this.form.value.name)
  }
  cancel() {
    this.dialogRef.close()
  }
}
