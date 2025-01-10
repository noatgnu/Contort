import { Component } from '@angular/core';
import {fromCSV} from "data-forge";
import {DataService} from "./data.service";
import {MatDialog} from "@angular/material/dialog";
import {CustomScoreDialogComponent} from "./custom-score-dialog/custom-score-dialog.component";
import {LoginDialogComponent} from "./login-dialog/login-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'CONTORT';

  constructor(private sb: MatSnackBar, public dataService: DataService, private dialog: MatDialog) {
  }

  handleFileImport(event: Event) {
    if (event.target) {
      const target = event.target as HTMLInputElement
      if (target.files) {
        const file = target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target) {
            const text =  <string>reader.result
            // skip 4 first line
            const lines = text.split("\n")
            lines.splice(0, 4)
            lines[0] = lines[0].replace(/\s/g, "_")
            const data = lines.join("\n")
            this.dataService.dataMSA = fromCSV(data)
          }
        }
        reader.readAsText(file)
      }
    }
  }

  openCustomScoreEditor() {
    this.dialog.open(CustomScoreDialogComponent)
  }

  openLoginDialog() {
    const dialogRef = this.dialog.open(LoginDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sb.open('Login successful', 'Close')
      } else {
        console.log('Login cancelled');
      }
    });
  }
}
