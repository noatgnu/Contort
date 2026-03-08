import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;

  const mockDialogData: ConfirmDialogData = {
    title: 'Test Title',
    message: 'Test Message',
    icon: 'warning',
    confirmText: 'Yes',
    cancelText: 'No',
    danger: false
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the provided data', () => {
    expect(component.data.title).toBe('Test Title');
    expect(component.data.message).toBe('Test Message');
    expect(component.data.icon).toBe('warning');
    expect(component.data.confirmText).toBe('Yes');
    expect(component.data.cancelText).toBe('No');
  });

  it('should close with true when confirm is called', () => {
    component.confirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should close with false when cancel is called', () => {
    component.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });

  it('should use default values when not provided', async () => {
    const minimalData: ConfirmDialogData = {
      title: 'Minimal',
      message: 'Minimal message'
    };

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: minimalData }
      ]
    }).compileComponents();

    const minimalFixture = TestBed.createComponent(ConfirmDialogComponent);
    const minimalComponent = minimalFixture.componentInstance;
    minimalFixture.detectChanges();

    expect(minimalComponent.data.confirmText).toBe('Confirm');
    expect(minimalComponent.data.cancelText).toBe('Cancel');
    expect(minimalComponent.data.danger).toBe(false);
  });

  it('should apply danger class when danger mode is enabled', async () => {
    const dangerData: ConfirmDialogData = {
      title: 'Delete',
      message: 'Are you sure?',
      danger: true
    };

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: dangerData }
      ]
    }).compileComponents();

    const dangerFixture = TestBed.createComponent(ConfirmDialogComponent);
    const dangerComponent = dangerFixture.componentInstance;
    dangerFixture.detectChanges();

    expect(dangerComponent.data.danger).toBe(true);
  });
});
