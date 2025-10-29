import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel, MatError} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

interface DialogData {
  suggestedName?: string;
  chains?: string[];
}

@Component({
  selector: 'app-save-structure-file-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatLabel,
    MatInput,
    MatFormField,
    MatError,
    MatButton,
    MatDialogActions
  ],
  templateUrl: './save-structure-file-dialog.component.html',
  styleUrl: './save-structure-file-dialog.component.scss'
})
export class SaveStructureFileDialogComponent {
  form = this.fb.group({
    name: ['', Validators.required]
  });

  chains: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<SaveStructureFileDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data?.suggestedName) {
      this.form.patchValue({ name: data.suggestedName });
    }
    if (data?.chains) {
      this.chains = data.chains;
    }
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.name);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
