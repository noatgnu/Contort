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
  let accountServiceMock: {
    getToken: jasmine.Spy;
    setToken: jasmine.Spy;
  };
  let webServiceMock: {
    getUserTokenThroughSession: jasmine.Spy;
  };
  let snackBarMock: {
    open: jasmine.Spy;
  };

  beforeEach(() => {
    accountServiceMock = {
      getToken: jasmine.createSpy('getToken').and.returnValue(null),
      setToken: jasmine.createSpy('setToken')
    };
    webServiceMock = {
      getUserTokenThroughSession: jasmine.createSpy('getUserTokenThroughSession').and.returnValue(of({ token: '' }))
    };
    snackBarMock = {
      open: jasmine.createSpy('open')
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AccountService, useValue: accountServiceMock },
        { provide: WebService, useValue: webServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock }
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
      expect(service.connectionStatus$.value).toBe(false);
    });
  });

  describe('isReconnecting$', () => {
    it('should initially be false', () => {
      expect(service.isReconnecting$.value).toBe(false);
    });
  });

  describe('connectedJobWS getter', () => {
    it('should return the current connection status', () => {
      expect(service.connectedJobWS).toBe(false);
    });
  });

  describe('jobMessage getter', () => {
    it('should return the jobMessage$ subject', () => {
      expect(service.jobMessage).toBe(service.jobMessage$);
    });
  });

  describe('connectJobWS', () => {
    it('should not connect if no token available', fakeAsync(() => {
      accountServiceMock.getToken.and.returnValue(null);
      webServiceMock.getUserTokenThroughSession.and.returnValue(of({ token: '' }));

      service.connectJobWS('session123');
      tick();

      expect(service.connectionStatus$.value).toBe(false);
    }));

    it('should attempt to get token through session if not stored', fakeAsync(() => {
      accountServiceMock.getToken.and.returnValue(null);
      webServiceMock.getUserTokenThroughSession.and.returnValue(of({ token: 'newToken' }));

      service.connectJobWS('session123');
      tick();

      expect(webServiceMock.getUserTokenThroughSession).toHaveBeenCalled();
      expect(accountServiceMock.setToken).toHaveBeenCalledWith('newToken');
    }));
  });

  describe('disconnect', () => {
    it('should set connection status to false', () => {
      service.disconnect();
      expect(service.connectionStatus$.value).toBe(false);
      expect(service.isReconnecting$.value).toBe(false);
    });
  });

  describe('reconnect', () => {
    it('should disconnect and reconnect', fakeAsync(() => {
      accountServiceMock.getToken.and.returnValue('token123');
      const disconnectSpy = spyOn(service, 'disconnect');

      service.reconnect('session123');
      tick();

      expect(disconnectSpy).toHaveBeenCalled();
    }));
  });

  describe('sendMessage', () => {
    it('should not send message when not connected', () => {
      const message = { type: 'test', job_id: 1, status: 'pending', session_id: 'test', log_data: '', error_data: '', message: '' };
      service.sendMessage(message);
      expect(snackBarMock.open).toHaveBeenCalledWith('Cannot send message: Not connected', 'Close', { duration: 3000 });
    });
  });

  describe('jobMessage$ subscription', () => {
    it('should emit messages to subscribers', () => {
      return new Promise<void>((resolve) => {
        const testMessage = { type: 'status', job_id: 1, status: 'completed', session_id: 'test', log_data: '', error_data: '', message: '' };

        service.jobMessage$.subscribe(message => {
          expect(message).toEqual(testMessage);
          resolve();
        });

        service.jobMessage$.next(testMessage);
      });
    });
  });
});
