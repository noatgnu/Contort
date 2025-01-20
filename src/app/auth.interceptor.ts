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
    if (accountService.sessionID) {
      req = req.clone({
        setHeaders: {
          'X-Contort-Session-ID': accountService.sessionID
        }
      })
    }
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Token ${token}`
      }
    });
    return next(cloned);
  }
  return next(req);
};
