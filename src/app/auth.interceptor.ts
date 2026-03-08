import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from "@angular/core";
import {AccountService} from "./account.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService)
  const isLoginRequest = req.url.includes('/login')
  const token = accountService.getToken()
  if (accountService.isAuthenticated()) {
    req = req.clone({
      withCredentials: true
    })
  }
  if (token && !isLoginRequest) {
    const headers: Record<string, string> = {
      Authorization: `Token ${token}`
    };
    if (accountService.sessionID) {
      headers['X-Contort-Session-ID'] = accountService.sessionID;
    }
    req = req.clone({
      setHeaders: headers
    });
    return next(req);
  }
  return next(req);
};
