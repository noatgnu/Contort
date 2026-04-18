import { Injectable, signal, computed } from '@angular/core';
import {UserSession} from "./user";

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private tokenKey = 'contortToken';
  private userKey = 'contortUserData';
  private _sessionID: string = '';

  private _userSession = signal<UserSession | undefined>(undefined);
  private _isLogged = signal<boolean>(false);

  readonly isAuthenticated = computed(() => {
    const session = this._userSession();
    if (session && session.status === 200) {
      return true;
    }
    return !!this.getToken();
  });

  get userSession(): UserSession | undefined {
    return this._userSession();
  }

  set userSession(value: UserSession | undefined) {
    this._userSession.set(value);
  }

  get isLogged(): boolean {
    return this._isLogged();
  }

  set isLogged(value: boolean) {
    this._isLogged.set(value);
  }

  set sessionID(value: string) {
    localStorage.setItem('contortSessionID', value);
    this._sessionID = value;
  }

  get sessionID(): string {
    if (this._sessionID === '') {
      this._sessionID = localStorage.getItem('contortSessionID') || '';
    }
    return this._sessionID;
  }

  constructor() {}

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  private setUser(user: any): void {}

  logout(): void {
    this.clearToken();
    this.clearUser();
  }

  clearSession(): void {
    this.clearToken();
    this.clearUser();
    this._userSession.set(undefined);
    this._isLogged.set(false);
  }

  private clearUser(): void {
    localStorage.removeItem(this.userKey);
  }
}
