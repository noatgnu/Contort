import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { KeyboardShortcutsService } from './keyboard-shortcuts.service';

describe('KeyboardShortcutsService', () => {
  let service: KeyboardShortcutsService;
  let router: Router;
  let dialogMock: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogMock = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MatDialog, useValue: dialogMock }
      ]
    });

    service = TestBed.inject(KeyboardShortcutsService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('shortcuts list', () => {
    it('should have defined shortcuts', () => {
      expect(service.shortcuts.length).toBeGreaterThan(0);
    });

    it('should have categories', () => {
      const categories = [...new Set(service.shortcuts.map(s => s.category))];
      expect(categories).toContain('General');
      expect(categories).toContain('Navigation');
      expect(categories).toContain('Actions');
    });

    it('should have shortcut for showing help dialog', () => {
      const helpShortcut = service.shortcuts.find(s => s.key === '?');
      expect(helpShortcut).toBeTruthy();
      expect(helpShortcut?.description).toContain('keyboard shortcuts');
    });
  });

  describe('keyboard event handling', () => {
    const createKeyboardEvent = (key: string, target: HTMLElement = document.body): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', { key });
      Object.defineProperty(event, 'target', { value: target });
      return event;
    };

    it('should open shortcuts dialog when ? is pressed', () => {
      const event = createKeyboardEvent('?', document.body);
      service.handleKeydown(event);
      expect(dialogMock.open).toHaveBeenCalled();
    });

    it('should close all dialogs when Escape is pressed', () => {
      const event = createKeyboardEvent('Escape', document.body);
      service.handleKeydown(event);
      expect(dialogMock.closeAll).toHaveBeenCalled();
    });

    it('should not trigger shortcuts when typing in input', () => {
      const input = document.createElement('input');
      const event = createKeyboardEvent('?', input);

      service.handleKeydown(event);
      expect(dialogMock.open).not.toHaveBeenCalled();
    });

    it('should not trigger shortcuts when typing in textarea', () => {
      const textarea = document.createElement('textarea');
      const event = createKeyboardEvent('?', textarea);

      service.handleKeydown(event);
      expect(dialogMock.open).not.toHaveBeenCalled();
    });
  });

  describe('navigation shortcuts', () => {
    it('should navigate to dashboard with g then h', fakeAsync(() => {
      const routerSpy = spyOn(router, 'navigate');

      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'target', { value: document.body });
      service.handleKeydown(gEvent);

      const hEvent = new KeyboardEvent('keydown', { key: 'h' });
      Object.defineProperty(hEvent, 'target', { value: document.body });
      service.handleKeydown(hEvent);

      tick();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('should navigate to jobs with g then j', fakeAsync(() => {
      const routerSpy = spyOn(router, 'navigate');

      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'target', { value: document.body });
      service.handleKeydown(gEvent);

      const jEvent = new KeyboardEvent('keydown', { key: 'j' });
      Object.defineProperty(jEvent, 'target', { value: document.body });
      service.handleKeydown(jEvent);

      tick();
      expect(routerSpy).toHaveBeenCalledWith(['/consurf-job']);
    }));

    it('should navigate to visualization with g then v', fakeAsync(() => {
      const routerSpy = spyOn(router, 'navigate');

      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'target', { value: document.body });
      service.handleKeydown(gEvent);

      const vEvent = new KeyboardEvent('keydown', { key: 'v' });
      Object.defineProperty(vEvent, 'target', { value: document.body });
      service.handleKeydown(vEvent);

      tick();
      expect(routerSpy).toHaveBeenCalledWith(['/consurf-view']);
    }));

    it('should timeout g sequence after 1 second', fakeAsync(() => {
      const routerSpy = spyOn(router, 'navigate');

      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'target', { value: document.body });
      service.handleKeydown(gEvent);

      tick(1100);

      const hEvent = new KeyboardEvent('keydown', { key: 'h' });
      Object.defineProperty(hEvent, 'target', { value: document.body });
      service.handleKeydown(hEvent);

      expect(routerSpy).not.toHaveBeenCalled();
    }));
  });

  describe('enable/disable', () => {
    it('should be enabled by default', () => {
      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'target', { value: document.body });
      service.handleKeydown(event);
      expect(dialogMock.open).toHaveBeenCalled();
    });

    it('should not handle events when disabled', () => {
      dialogMock.open.calls.reset();
      service.disable();

      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'target', { value: document.body });
      service.handleKeydown(event);

      expect(dialogMock.open).not.toHaveBeenCalled();
    });

    it('should handle events after re-enabling', () => {
      service.disable();
      service.enable();

      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'target', { value: document.body });
      service.handleKeydown(event);

      expect(dialogMock.open).toHaveBeenCalled();
    });
  });

  describe('showShortcutsDialog', () => {
    it('should open the keyboard shortcuts dialog', () => {
      service.showShortcutsDialog();
      expect(dialogMock.open).toHaveBeenCalled();
    });
  });
});
