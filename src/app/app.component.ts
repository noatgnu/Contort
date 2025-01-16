import { Component } from '@angular/core';
import {fromCSV} from "data-forge";
import {DataService} from "./data.service";
import {MatDialog} from "@angular/material/dialog";
import {CustomScoreDialogComponent} from "./custom-score-dialog/custom-score-dialog.component";
import {LoginDialogComponent} from "./login-dialog/login-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UploadFastaDatabaseComponent} from "./upload-fasta-database/upload-fasta-database.component";
import {AccountService} from "./account.service";
import {WebsocketService} from "./websocket.service";
import {WebService} from "./web.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'CONTORT';

  constructor(private web: WebService, public websocket: WebsocketService, private sb: MatSnackBar, public dataService: DataService, private dialog: MatDialog, public accountService: AccountService) {
    if (this.accountService.isAuthenticated()) {
      this.web.getUniqueSessionID().subscribe((data) => {
        this.accountService.sessionID = data.token.replace(/:/g, "_")
        this.connectWS()
      })
    }
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

  openManageDatabaseDialog() {
    const dialogRef = this.dialog.open(UploadFastaDatabaseComponent);

  }

  connectWS() {
    this.websocket.connectJobWS(this.accountService.sessionID)
    if (this.websocket.jobConnection) {
      this.websocket.jobConnection.subscribe((data) => {
        if (this.accountService.sessionID === data.session_id) {
          this.websocket.jobMessage.next(data)
        }
      }, (error) => {
        //this.connectWS()
      })
    }
  }

  logout() {
    this.accountService.logout()
  }
}
