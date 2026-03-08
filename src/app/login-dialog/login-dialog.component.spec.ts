import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';

import { LoginDialogComponent } from './login-dialog.component';

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimations(),
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form with username and password controls', () => {
    expect(component.form.get('username')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should validate username minimum length', () => {
    component.form.get('username')?.setValue('ab');
    expect(component.form.get('username')?.hasError('minlength')).toBeTruthy();
  });

  it('should validate password minimum length', () => {
    component.form.get('password')?.setValue('12345');
    expect(component.form.get('password')?.hasError('minlength')).toBeTruthy();
  });

  it('should mark form valid with correct inputs', () => {
    component.form.get('username')?.setValue('testuser');
    component.form.get('password')?.setValue('password123');
    expect(component.form.valid).toBeTruthy();
  });

  it('should return correct error message for required username', () => {
    component.form.get('username')?.markAsTouched();
    expect(component.getErrorMessage('username')).toBe('Username is required');
  });

  it('should return correct error message for short password', () => {
    component.form.get('password')?.setValue('123');
    component.form.get('password')?.markAsTouched();
    expect(component.getErrorMessage('password')).toBe('Password must be at least 6 characters');
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBeTruthy();
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBeFalsy();
  });

  it('should not call login if form is invalid', () => {
    component.login();
    expect(component.isLoading()).toBeFalsy();
  });
});
