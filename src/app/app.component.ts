import {Component, OnInit, HostListener, signal} from '@angular/core';
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
import {ThemeService} from "./theme.service";
import {ConfirmDialogComponent, ConfirmDialogData} from "./shared/confirm-dialog/confirm-dialog.component";
import {KeyboardShortcutsService} from "./keyboard-shortcuts.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'CONTORT';
  ready = signal(false);

  constructor(
    private web: WebService,
    public websocket: WebsocketService,
    private sb: MatSnackBar,
    public dataService: DataService,
    private dialog: MatDialog,
    public accountService: AccountService,
    public themeService: ThemeService,
    public keyboardShortcuts: KeyboardShortcutsService
  ) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    this.keyboardShortcuts.handleKeydown(event);
  }

  ngOnInit() {
    this.initialize().then(() => {
      this.ready.set(true);
    });
  }

  async initialize() {
    try {
      const uniqueSessionID = await this.web.getUniqueSessionID().toPromise()
      if (uniqueSessionID) {
        this.accountService.sessionID = uniqueSessionID.token.replace(/:/g, "_")

      }
    } catch (e) {
      console.error(e)
    }

    if (!this.accountService.getToken()) {
      const resp = await this.web.getCSRFToken().toPromise()
      if (resp) {
        if (resp.status === 200) {
          const userSession = await this.web.getAuthenticationStatus().toPromise()
          if (userSession) {
            if (userSession.status === 200) {
              this.accountService.userSession = userSession
              this.accountService.isLogged = true
            }
          }
        }
      }
    } else {
      this.accountService.isLogged = true
    }
    this.connectWS()
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
        // refresh website
        window.location.reload()
      }
    });
  }

  openManageDatabaseDialog() {
    const dialogRef = this.dialog.open(UploadFastaDatabaseComponent);

  }

  connectWS() {
    this.websocket.connectJobWS(this.accountService.sessionID).then(
      () => {},
      (error) => {
        console.error("Failed to establish WebSocket connection:", error);
      }
    )

  }

  logout() {
    const dialogData: ConfirmDialogData = {
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      icon: 'logout',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      danger: false
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.web.userLogoutProvider().subscribe({
        next: (response) => {
          this.web.logoutProvider().subscribe((data) => {
            this.accountService.userSession = undefined
            this.accountService.isLogged = false
          }, (error) => {
            this.accountService.logout()
            this.accountService.userSession = undefined
            this.accountService.isLogged = false
          })
        },
        error: (err) => {
          console.error('Error logging out:', err);
        }
      })
    });
  }
}
