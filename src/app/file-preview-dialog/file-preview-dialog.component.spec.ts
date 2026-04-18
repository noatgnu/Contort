import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { FilePreviewDialogComponent, FilePreviewData } from './file-preview-dialog.component';

describe('FilePreviewDialogComponent', () => {
  let component: FilePreviewDialogComponent;
  let fixture: ComponentFixture<FilePreviewDialogComponent>;
  let httpMock: HttpTestingController;

  const mockDialogData: FilePreviewData = {
    fileUrl: 'http://example.com/test.fasta',
    fileName: 'test.fasta',
    fileType: 'database'
  };

  const upgradedUrl = 'https://example.com/test.fasta';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilePreviewDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FilePreviewDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    const req = httpMock.expectOne(upgradedUrl);
    req.flush('>seq1\nACGT\n>seq2\nTGCA');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should upgrade http to https for non-localhost URLs', () => {
    const req = httpMock.expectOne(upgradedUrl);
    req.flush('>seq1\nACGT');
    fixture.detectChanges();
    expect(req.request.url).toBe(upgradedUrl);
  });

  it('should load file content on init', () => {
    const req = httpMock.expectOne(upgradedUrl);
    req.flush('>seq1\nACGT');
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });

  it('should parse FASTA sequences', () => {
    const req = httpMock.expectOne(upgradedUrl);
    req.flush('>seq1\nACGT\n>seq2\nTGCA');
    fixture.detectChanges();
    expect(component.sequenceCount()).toBe(2);
  });
});
