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
  let snackBarMock: { open: jasmine.Spy };
  let dialogMock: { open: jasmine.Spy };
  let accountServiceMock: { clearSession: jasmine.Spy };

  beforeEach(() => {
    snackBarMock = { open: jasmine.createSpy('open') };
    dialogMock = { open: jasmine.createSpy('open') };
    accountServiceMock = { clearSession: jasmine.createSpy('clearSession') };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: AccountService, useValue: accountServiceMock }
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

    expect(accountServiceMock.clearSession).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Session expired. Please log in again.',
      'Close',
      { duration: 5000 }
    );
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should handle 403 errors with permission message', () => {
    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(snackBarMock.open).toHaveBeenCalledWith(
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

    expect(snackBarMock.open).toHaveBeenCalledWith(
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

    expect(snackBarMock.open).toHaveBeenCalledWith(
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

    expect(snackBarMock.open).toHaveBeenCalledWith(
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

    expect(snackBarMock.open).not.toHaveBeenCalled();
  });
});
