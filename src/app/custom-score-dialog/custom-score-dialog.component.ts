import { Component } from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {DataService} from "../data.service";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@Component({
    selector: 'app-custom-score-dialog',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        ReactiveFormsModule,
        MatInputModule,
        MatDialogClose,
        MatButtonModule,
        MatDialogActions,
        MatIconModule
    ],
    templateUrl: './custom-score-dialog.component.html',
    styleUrl: './custom-score-dialog.component.scss'
})
export class CustomScoreDialogComponent {

  form: FormGroup[] = []

  constructor(private dialogRef: MatDialogRef<CustomScoreDialogComponent>, private dataService: DataService, private fb: FormBuilder) {
    for (const pos in this.dataService.customScore) {
      this.form.push(this.fb.group({
        position: [pos],
        score: [this.dataService.customScore[pos]]
      }))
    }
  }

  handleSave() {
    for (const f of this.form) {
      this.dataService.customScore[f.value.position] = f.value.score
    }
    this.dataService.aaPerRowSubject.next(true)
    this.dialogRef.close()
  }

  removeForm(form: FormGroup) {
    const index = this.form.indexOf(form)
    this.form.splice(index, 1)
  }

  addForm() {
    this.form.push(this.fb.group({
      position: [0],
      score: [1]
    }))
  }

}
