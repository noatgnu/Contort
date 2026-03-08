import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ShareFileDialogComponent, ShareFileDialogData } from './share-file-dialog.component';

describe('ShareFileDialogComponent', () => {
  let component: ShareFileDialogComponent;
  let fixture: ComponentFixture<ShareFileDialogComponent>;

  const mockDialogData: ShareFileDialogData = {
    id: 1,
    name: 'Test File',
    type: 'database',
    is_public: false,
    shared_with_usernames: ['user1', 'user2']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareFileDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShareFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with shared users', () => {
    expect(component.sharedUsers()).toEqual(['user1', 'user2']);
  });

  it('should initialize with public status', () => {
    expect(component.isPublic()).toBe(false);
  });
});
