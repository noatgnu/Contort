import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebsocketService } from './websocket.service';
import { AccountService } from './account.service';
import { WebService } from './web.service';
import { of } from 'rxjs';

describe('WebsocketService', () => {
  let service: WebsocketService;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let webServiceSpy: jasmine.SpyObj<WebService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['getToken', 'setToken']);
    webServiceSpy = jasmine.createSpyObj('WebService', ['getUserTokenThroughSession']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: WebService, useValue: webServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    service = TestBed.inject(WebsocketService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connectionStatus$', () => {
    it('should initially be false', () => {
      expect(service.connectionStatus$.value).toBeFalse();
    });
  });

  describe('isReconnecting$', () => {
    it('should initially be false', () => {
      expect(service.isReconnecting$.value).toBeFalse();
    });
  });

  describe('connectedJobWS getter', () => {
    it('should return the current connection status', () => {
      expect(service.connectedJobWS).toBeFalse();
    });
  });

  describe('jobMessage getter', () => {
    it('should return the jobMessage$ subject', () => {
      expect(service.jobMessage).toBe(service.jobMessage$);
    });
  });

  describe('connectJobWS', () => {
    it('should not connect if no token available', fakeAsync(() => {
      accountServiceSpy.getToken.and.returnValue(null);
      webServiceSpy.getUserTokenThroughSession.and.returnValue(of({ token: '' }));

      service.connectJobWS('session123');
      tick();

      expect(service.connectionStatus$.value).toBeFalse();
    }));

    it('should attempt to get token through session if not stored', fakeAsync(() => {
      accountServiceSpy.getToken.and.returnValue(null);
      webServiceSpy.getUserTokenThroughSession.and.returnValue(of({ token: 'newToken' }));

      service.connectJobWS('session123');
      tick();

      expect(webServiceSpy.getUserTokenThroughSession).toHaveBeenCalled();
      expect(accountServiceSpy.setToken).toHaveBeenCalledWith('newToken');
    }));
  });

  describe('disconnect', () => {
    it('should set connection status to false', () => {
      service.disconnect();
      expect(service.connectionStatus$.value).toBeFalse();
      expect(service.isReconnecting$.value).toBeFalse();
    });
  });

  describe('reconnect', () => {
    it('should disconnect and reconnect', fakeAsync(() => {
      accountServiceSpy.getToken.and.returnValue('token123');
      spyOn(service, 'disconnect').and.callThrough();

      service.reconnect('session123');
      tick();

      expect(service.disconnect).toHaveBeenCalled();
    }));
  });

  describe('sendMessage', () => {
    it('should not send message when not connected', () => {
      const message = { type: 'test', job_id: 1, status: 'pending', session_id: 'test', log_data: '', error_data: '', message: '' };
      service.sendMessage(message);
      expect(snackBarSpy.open).toHaveBeenCalledWith('Cannot send message: Not connected', 'Close', { duration: 3000 });
    });
  });

  describe('jobMessage$ subscription', () => {
    it('should emit messages to subscribers', (done) => {
      const testMessage = { type: 'status', job_id: 1, status: 'completed', session_id: 'test', log_data: '', error_data: '', message: '' };

      service.jobMessage$.subscribe(message => {
        expect(message).toEqual(testMessage);
        done();
      });

      service.jobMessage$.next(testMessage);
    });
  });
});
