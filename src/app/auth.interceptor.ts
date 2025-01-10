import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from "@angular/core";
import {AccountService} from "./account.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService)
  const isLoginRequest = req.url.includes('/login')
  const token = accountService.getToken()
  if (token && !isLoginRequest) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  return next(req);
};
