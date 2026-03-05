import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { catchError, throwError } from 'rxjs';
import { AccountService } from './account.service';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const dialog = inject(MatDialog);
  const accountService = inject(AccountService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.status === 401) {
        accountService.clearSession();
        errorMessage = 'Session expired. Please log in again.';
        snackBar.open(errorMessage, 'Close', { duration: 5000 });
        dialog.open(LoginDialogComponent);
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
        snackBar.open(errorMessage, 'Close', { duration: 5000 });
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
        snackBar.open(errorMessage, 'Close', { duration: 5000 });
      } else if (error.status >= 500) {
        errorMessage = 'A server error occurred. Please try again later.';
        snackBar.open(errorMessage, 'Close', { duration: 5000 });
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your connection.';
        snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }

      return throwError(() => error);
    })
  );
};
