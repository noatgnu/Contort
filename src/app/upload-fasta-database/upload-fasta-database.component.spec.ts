import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { UploadFastaDatabaseComponent } from './upload-fasta-database.component';
import { WebService } from '../web.service';

describe('UploadFastaDatabaseComponent', () => {
  let component: UploadFastaDatabaseComponent;
  let fixture: ComponentFixture<UploadFastaDatabaseComponent>;
  let webServiceMock: jasmine.SpyObj<WebService>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<UploadFastaDatabaseComponent>>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    webServiceMock = jasmine.createSpyObj('WebService', [
      'getProteinFastaDatabases',
      'getMSAs',
      'getStructures',
      'deleteProteinFastaDatabase',
      'deleteMSA',
      'deleteStructure'
    ]);
    webServiceMock.getProteinFastaDatabases.and.returnValue(of({ count: 0, results: [], next: null, previous: null }));
    webServiceMock.getMSAs.and.returnValue(of({ count: 0, results: [], next: null, previous: null }));
    webServiceMock.getStructures.and.returnValue(of({ count: 0, results: [], next: null, previous: null }));

    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [UploadFastaDatabaseComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WebService, useValue: webServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadFastaDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data on creation', () => {
    expect(webServiceMock.getProteinFastaDatabases).toHaveBeenCalled();
    expect(webServiceMock.getMSAs).toHaveBeenCalled();
    expect(webServiceMock.getStructures).toHaveBeenCalled();
  });

  it('should open confirm dialog when deleting a database', () => {
    dialogMock.open.and.returnValue({
      afterClosed: () => of(false)
    } as any);

    component.delete(1, 'database');

    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should close dialog when close is called', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should reset file inputs and form on tab change', () => {
    const resetSpy = spyOn(component.form, 'reset');
    component.onTabChange({});
    expect(resetSpy).toHaveBeenCalled();
  });
});
