import { Injectable, OnDestroy } from '@angular/core';
import { environment } from "../environments/environment";
import { AccountService } from "./account.service";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MessageJob } from "./consurf-job";
import { Subject, BehaviorSubject, firstValueFrom, timer } from "rxjs";
import { WebService } from "./web.service";
import { retry, tap, takeUntil } from "rxjs/operators";

interface WebSocketConfig {
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly baseURL: string;
  
  private jobConnection: WebSocketSubject<MessageJob> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 3000;
  
  readonly jobMessage$ = new Subject<MessageJob>();
  readonly connectionStatus$ = new BehaviorSubject<boolean>(false);
  
  // Legacy support
  get jobMessage(): Subject<MessageJob> {
    return this.jobMessage$;
  }
  
  get connectedJobWS(): boolean {
    return this.connectionStatus$.value;
  }

  constructor(
    private account: AccountService,
    private sb: MatSnackBar,
    private web: WebService
  ) {
    this.baseURL = environment.baseUrl.replace(/^http/, "ws");
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

  async connectJobWS(sessionID: string): Promise<void> {
    if (this.jobConnection && !this.jobConnection.closed) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      const token = await this.getToken();
      if (!token) {
        this.sb.open("Unable to establish connection: No authentication token", "Close", { duration: 5000 });
        return;
      }

      const url = `${this.baseURL}/ws/job/${sessionID}/?token=${token}`;
      this.createConnection(url);
    } catch (error) {
      console.error("Failed to connect to job websocket:", error);
      this.sb.open("Failed to establish WebSocket connection", "Close", { duration: 5000 });
    }
  }

  private async getToken(): Promise<string | null> {
    let token = this.account.getToken();
    
    if (!token) {
      try {
        const response = await firstValueFrom(this.web.getUserTokenThroughSession());
        if (response?.token) {
          token = response.token;
          this.account.setToken(token);
        }
      } catch (error) {
        console.error("Failed to get token through session:", error);
        return null;
      }
    }
    
    return token;
  }

  private createConnection(url: string): void {
    this.jobConnection = webSocket<MessageJob>({
      url: url,
      openObserver: {
        next: () => {
          this.connectionStatus$.next(true);
          this.reconnectAttempts = 0;
          console.log("✓ Connected to job websocket");
          this.sb.open("Connected to job notifications", "Close", { duration: 2000 });
        }
      },
      closeObserver: {
        next: (event) => {
          console.log("WebSocket closed:", event);
          this.connectionStatus$.next(false);
          this.handleDisconnection();
        }
      },
      closingObserver: {
        next: () => {
          console.log("WebSocket closing...");
        }
      }
    });

    this.jobConnection
      .pipe(
        tap(message => {
          console.log("WebSocket message received:", message);
          this.jobMessage$.next(message);
        }),
        retry({
          count: this.maxReconnectAttempts,
          delay: (error, retryCount) => {
            console.error(`WebSocket error (attempt ${retryCount}/${this.maxReconnectAttempts}):`, error);
            this.reconnectAttempts = retryCount;
            
            this.sb.open(
              `Reconnecting... (${retryCount}/${this.maxReconnectAttempts})`,
              "Close",
              { duration: 2000 }
            );
            
            return timer(this.reconnectInterval);
          },
          resetOnSuccess: true
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error) => {
          console.error("WebSocket subscription error after all retry attempts:", error);
          this.connectionStatus$.next(false);
          this.sb.open(
            "Failed to maintain connection after multiple attempts",
            "Close",
            { duration: 5000 }
          );
        },
        complete: () => {
          console.log("WebSocket subscription completed");
        }
      });
  }

  private handleDisconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.sb.open(
        "Connection lost. Attempting to reconnect...",
        "Close",
        { duration: 3000 }
      );
    } else {
      this.sb.open(
        "Connection to server has closed. Please refresh the page to reconnect.",
        "Close",
        { duration: 5000 }
      );
    }
  }

  disconnect(): void {
    if (this.jobConnection && !this.jobConnection.closed) {
      this.jobConnection.complete();
      this.jobConnection = null;
      this.connectionStatus$.next(false);
      console.log("WebSocket disconnected");
    }
  }

  sendMessage(message: MessageJob): void {
    if (this.jobConnection && !this.jobConnection.closed) {
      this.jobConnection.next(message);
    } else {
      console.warn("Cannot send message: WebSocket is not connected");
      this.sb.open("Cannot send message: Not connected", "Close", { duration: 3000 });
    }
  }

  reconnect(sessionID: string): Promise<void> {
    this.disconnect();
    this.reconnectAttempts = 0;
    return this.connectJobWS(sessionID);
  }
}
