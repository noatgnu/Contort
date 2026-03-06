import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from './account.service';
import { WebsocketService } from './websocket.service';
import { WebService } from './web.service';
import { DataService } from './data.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let webServiceMock: any;
  let websocketServiceMock: any;
  let accountServiceMock: any;

  beforeEach(() => {
    webServiceMock = {
      getUniqueSessionID: jasmine.createSpy('getUniqueSessionID').and.returnValue(of({ token: 'test-session' })),
      getCSRFToken: jasmine.createSpy('getCSRFToken').and.returnValue(of({ status: 200 })),
      getAuthenticationStatus: jasmine.createSpy('getAuthenticationStatus').and.returnValue(of({ status: 200 })),
      userLogoutProvider: jasmine.createSpy('userLogoutProvider').and.returnValue(of({})),
      logoutProvider: jasmine.createSpy('logoutProvider').and.returnValue(of({}))
    };

    websocketServiceMock = {
      connectJobWS: jasmine.createSpy('connectJobWS').and.resolveTo(undefined),
      connectionStatus$: { value: false },
      isReconnecting$: { value: false }
    };

    accountServiceMock = {
      getToken: jasmine.createSpy('getToken').and.returnValue(null),
      sessionID: '',
      isLogged: false,
      userSession: undefined,
      logout: jasmine.createSpy('logout')
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: WebService, useValue: webServiceMock },
        { provide: WebsocketService, useValue: websocketServiceMock },
        { provide: AccountService, useValue: accountServiceMock },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        DataService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'CONTORT'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('CONTORT');
  });
});
