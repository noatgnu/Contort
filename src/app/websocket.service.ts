import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {AccountService} from "./account.service";
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MessageJob} from "./consurf-job";
import {Subject} from "rxjs";
import {WebService} from "./web.service";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  baseURL = environment.baseUrl.replace("http", "ws")
  connectedJobWS: boolean = false
  jobConnection: WebSocketSubject<MessageJob>| undefined
  jobMessage: Subject<MessageJob> = new Subject()
  constructor(private account: AccountService, private sb: MatSnackBar, private web: WebService) { }

  connectJobWS(sessionID: string) {
    let url = `${this.baseURL}/ws/job/${sessionID}/?token=${this.account.getToken()}`
    if (!this.account.getToken()) {
      url = `${this.baseURL}/ws/job/${sessionID}/?token=${this.web.getSessionIDFromCookies()}`
    }
    this.jobConnection = new WebSocketSubject({
      url: `${this.baseURL}/ws/job/${sessionID}/?token=${this.account.getToken()}`,
      openObserver: {
        next: () => {
          this.connectedJobWS = true
          console.log("Connected to job websocket")
        }
      },
      closeObserver: {
        next: () => {
          console.log("Closed connection to job websocket")
          this.connectedJobWS = false
          this.sb.open("Notification connection to server has closed please reconnect", "Close", {duration: 5000})
        }
      }
    })
  }
}
