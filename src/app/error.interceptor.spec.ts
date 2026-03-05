import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { errorInterceptor } from './error.interceptor';
import { AccountService } from './account.service';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['clearSession']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: AccountService, useValue: accountServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should handle 401 errors by clearing session and opening login dialog', () => {
    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(accountServiceSpy.clearSession).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Session expired. Please log in again.',
      'Close',
      { duration: 5000 }
    );
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should handle 403 errors with permission message', () => {
    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'You do not have permission to perform this action.',
      'Close',
      { duration: 5000 }
    );
  });

  it('should handle 404 errors with not found message', () => {
    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'The requested resource was not found.',
      'Close',
      { duration: 5000 }
    );
  });

  it('should handle 500 errors with server error message', () => {
    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'A server error occurred. Please try again later.',
      'Close',
      { duration: 5000 }
    );
  });

  it('should handle network errors (status 0)', () => {
    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTestingController.expectOne('/api/test');
    req.error(new ProgressEvent('error'));

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Unable to connect to the server. Please check your connection.',
      'Close',
      { duration: 5000 }
    );
  });

  it('should pass through successful requests', () => {
    httpClient.get('/api/test').subscribe(response => {
      expect(response).toEqual({ data: 'test' });
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush({ data: 'test' });

    expect(snackBarSpy.open).not.toHaveBeenCalled();
  });
});
