import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private tokenKey = 'contortToken';
  private userKey = 'contortUserData';
  private _sessionID: string = ''
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
  constructor() { }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  private setUser(user: any): void {
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.clearToken();
    this.clearUser();
  }

  private clearUser(): void {
    localStorage.removeItem(this.userKey);
  }
}
