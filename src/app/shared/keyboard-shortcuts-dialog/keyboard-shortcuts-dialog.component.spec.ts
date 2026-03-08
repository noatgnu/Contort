import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { KeyboardShortcutsDialogComponent } from './keyboard-shortcuts-dialog.component';

describe('KeyboardShortcutsDialogComponent', () => {
  let component: KeyboardShortcutsDialogComponent;
  let fixture: ComponentFixture<KeyboardShortcutsDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<KeyboardShortcutsDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [KeyboardShortcutsDialogComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KeyboardShortcutsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('shortcuts data', () => {
    it('should have shortcuts defined', () => {
      expect(component.shortcuts.length).toBeGreaterThan(0);
    });

    it('should have categories', () => {
      expect(component.categories.length).toBeGreaterThan(0);
    });

    it('should include General category', () => {
      expect(component.categories).toContain('General');
    });

    it('should include Navigation category', () => {
      expect(component.categories).toContain('Navigation');
    });

    it('should include Actions category', () => {
      expect(component.categories).toContain('Actions');
    });
  });

  describe('getShortcutsByCategory', () => {
    it('should return shortcuts for General category', () => {
      const generalShortcuts = component.getShortcutsByCategory('General');
      expect(generalShortcuts.length).toBeGreaterThan(0);
    });

    it('should return shortcuts for Navigation category', () => {
      const navShortcuts = component.getShortcutsByCategory('Navigation');
      expect(navShortcuts.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown category', () => {
      const unknownShortcuts = component.getShortcutsByCategory('Unknown');
      expect(unknownShortcuts.length).toBe(0);
    });

    it('should only return shortcuts matching the category', () => {
      const generalShortcuts = component.getShortcutsByCategory('General');
      const allGeneral = generalShortcuts.every(s => s.category === 'General');
      expect(allGeneral).toBeTruthy();
    });
  });

  describe('DOM rendering', () => {
    it('should render dialog title', () => {
      const title = fixture.debugElement.query(By.css('h2[mat-dialog-title]'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Keyboard Shortcuts');
    });

    it('should render close button', () => {
      const closeBtn = fixture.debugElement.query(By.css('button[mat-dialog-close]'));
      expect(closeBtn).toBeTruthy();
    });

    it('should render category sections', () => {
      const sections = fixture.debugElement.queryAll(By.css('.shortcut-category'));
      expect(sections.length).toBe(component.categories.length);
    });

    it('should render shortcut items', () => {
      const items = fixture.debugElement.queryAll(By.css('.shortcut-item'));
      expect(items.length).toBe(component.shortcuts.length);
    });

    it('should display shortcut keys in kbd elements', () => {
      const keys = fixture.debugElement.queryAll(By.css('kbd.shortcut-key'));
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should display shortcut descriptions', () => {
      const descriptions = fixture.debugElement.queryAll(By.css('.shortcut-description'));
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should render keyboard icon in title', () => {
      const icon = fixture.debugElement.query(By.css('h2 mat-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent.trim()).toBe('keyboard');
    });
  });
});
