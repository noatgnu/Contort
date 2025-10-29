import {Component, ViewChild, OnDestroy, signal} from '@angular/core';
import { WebService } from '../web.service';
import jsSHA from 'jssha';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProteinFastaDatabaseQuery } from '../protein-fasta-database';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MultipleSequenceAlignmentQuery} from "../msa";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatInput} from "@angular/material/input";
import {MatDivider} from "@angular/material/divider";
import {MatButton, MatIconButton} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef, MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef, MatRow,
  MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {StructureFile, StructureFileQuery} from "../structure";
import {Subject, debounceTime, distinctUntilChanged, takeUntil} from 'rxjs';

@Component({
  selector: 'app-upload-fasta-database',
  templateUrl: './upload-fasta-database.component.html',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatProgressBar,
    MatInput,
    MatDivider,
    MatButton,
    MatTable,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRowDef,
    MatColumnDef,
    MatCellDef,
    MatHeaderCellDef,
    MatIconButton,
    MatIcon,
    MatCell,
    MatHeaderCell,
    MatRow,
    MatPaginator,
    MatTabGroup,
    MatTab,
    MatDialogActions
  ],
  styleUrls: ['./upload-fasta-database.component.scss']
})
export class UploadFastaDatabaseComponent implements OnDestroy {
  @ViewChild("fileInput") fileInput: any;
  @ViewChild("fileInputMSA") fileInputMSA: any;
  @ViewChild("fileInputStructure") fileInputStructure: any;
  
  private destroy$ = new Subject<void>();
  
  fileList = signal<File[]>([]);
  fileProgressMap: Record<string, { progress: number; total: number }> = {};
  isUploading = signal(false);
  
  private readonly allowFileType = ['fasta', 'txt', 'fa', 'fas'] as const;
  private readonly allowMSAFileType = ['fasta', 'aln', 'fasta-aln', 'fas', 'txt'] as const;
  private readonly allowPDBFileType = ['pdb'] as const;
  
  form = this.fb.group({
    name: ['', Validators.required],
    searchTerm: ['']
  });
  
  readonly displayedColumns: string[] = ['name', 'action'];
  readonly limit = 10;
  offset = 0;

  query: ProteinFastaDatabaseQuery | undefined;
  msaQuery: MultipleSequenceAlignmentQuery | undefined;

  readonly msaLimit = 10;
  msaOffset = 0;

  structureQuery: StructureFileQuery | undefined;
  readonly structureLimit = 10;
  structureOffset = 0;

  constructor(
    private web: WebService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UploadFastaDatabaseComponent>,
    private sb: MatSnackBar
  ) {
    this.loadInitialData();
    this.setupSearchListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.web.getProteinFastaDatabases(this.limit, this.offset)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.query = data);
    
    this.web.getStructures(this.structureLimit, this.structureOffset)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.structureQuery = data);
    
    this.web.getMSAs(this.msaLimit, this.msaOffset)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.msaQuery = data);
  }

  private setupSearchListener(): void {
    this.form.controls.searchTerm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.offset = 0;
        const term = value || '';
        this.web.getProteinFastaDatabases(this.limit, this.offset, term)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.query = data);
      });
  }

  onPaginate(event: PageEvent, type: 'database' | 'msa' | 'structure'): void {
    const limit = event.pageSize;
    const offset = event.pageIndex * event.pageSize;
    const term = this.form.value.searchTerm || '';

    const handlers = {
      database: () => {
        this.offset = offset;
        this.web.getProteinFastaDatabases(limit, offset, term)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.query = data);
      },
      msa: () => {
        this.msaOffset = offset;
        this.web.getMSAs(limit, offset, term)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.msaQuery = data);
      },
      structure: () => {
        this.structureOffset = offset;
        this.web.getStructures(limit, offset, term)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.structureQuery = data);
      }
    };

    handlers[type]();
  }

  close(): void {
    this.dialogRef.close();
  }

  async uploadData(event: Event, type: 'database' | 'msa' | 'structure'): Promise<void> {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    this.isUploading.set(true);
    const fileArray = Array.from(files);
    this.fileList.set(fileArray);
    
    fileArray.forEach(file => {
      this.fileProgressMap[file.name] = { progress: 0, total: file.size };
    });

    try {
      for (const file of fileArray) {
        await this.uploadFile(file, type);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      this.sb.open('Upload failed', 'Close', { duration: 3000 });
    } finally {
      this.isUploading.set(false);
      this.resetFileInputs();
    }
  }

  private resetFileInputs(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    if (this.fileInputMSA?.nativeElement) {
      this.fileInputMSA.nativeElement.value = '';
    }
    if (this.fileInputStructure?.nativeElement) {
      this.fileInputStructure.nativeElement.value = '';
    }
  }

  private getFileExtension(file: File): string {
    const parts = file.name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  private getAllowedFileTypes(type: 'database' | 'msa' | 'structure'): readonly string[] {
    const typeMap = {
      database: this.allowFileType,
      msa: this.allowMSAFileType,
      structure: this.allowPDBFileType
    };
    return typeMap[type];
  }

  private async uploadFile(file: File, type: 'database' | 'msa' | 'structure'): Promise<void> {
    const fileExtension = this.getFileExtension(file);
    const allowedFileTypes = this.getAllowedFileTypes(type);
    
    if (!allowedFileTypes.includes(fileExtension as any)) {
      this.sb.open(`Invalid file type. Allowed: ${allowedFileTypes.join(', ')}`, 'Close', { duration: 3000 });
      return;
    }

    const chunkSize = 1024 * 1024;
    const fileSize = file.size;
    const hashObj = new jsSHA('SHA-256', 'ARRAYBUFFER');

    try {
      if (chunkSize > fileSize) {
        await this.uploadSmallFile(file, hashObj, type);
      } else {
        await this.uploadLargeFile(file, hashObj, type, chunkSize, fileSize);
      }
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  private async uploadSmallFile(file: File, hashObj: jsSHA, type: 'database' | 'msa' | 'structure'): Promise<void> {
    const chunk = await file.arrayBuffer();
    hashObj.update(chunk);
    const hashDigest = hashObj.getHash('HEX');
    const result = await this.web.uploadDataChunkComplete('', hashDigest, file, file.name).toPromise();
    
    this.fileProgressMap[file.name].progress = file.size;
    
    if (result?.completed_at && this.form.value.name) {
      await this.bindAndRefreshData(this.form.value.name, result.id, type);
    }
  }

  private async uploadLargeFile(
    file: File, 
    hashObj: jsSHA, 
    type: 'database' | 'msa' | 'structure',
    chunkSize: number,
    fileSize: number
  ): Promise<void> {
    let currentURL = '';
    let currentOffset = 0;
    
    while (fileSize > currentOffset) {
      const end = Math.min(currentOffset + chunkSize, fileSize);
      const chunk = await file.slice(currentOffset, end).arrayBuffer();
      hashObj.update(chunk);
      
      const filePart = new File([chunk], file.name, { type: file.type });
      const contentRange = `bytes ${currentOffset}-${end - 1}/${fileSize}`;
      const result = await this.web.uploadDataChunk(currentURL, filePart, file.name, contentRange).toPromise();
      
      if (result) {
        currentURL = result.url;
        currentOffset = result.offset;
        this.fileProgressMap[file.name].progress = currentOffset;
      }
    }
    
    if (currentURL && this.form.value.name) {
      const hashDigest = hashObj.getHash('HEX');
      const result = await this.web.uploadDataChunkComplete(currentURL, hashDigest).toPromise();
      
      if (result?.completed_at) {
        this.fileProgressMap[file.name].progress = fileSize;
        await this.bindAndRefreshData(this.form.value.name, result.id, type);
      }
    }
  }

  private async bindAndRefreshData(name: string, fileId: string, type: 'database' | 'msa' | 'structure'): Promise<void> {
    await this.web.bindUploadedFile(name, fileId, type)
      .pipe(takeUntil(this.destroy$))
      .toPromise();
    
    this.sb.open('File uploaded successfully', 'Close', { duration: 2000 });
    this.refreshData(type);
  }

  private refreshData(type: 'database' | 'msa' | 'structure'): void {
    const refreshHandlers = {
      database: () => this.web.getProteinFastaDatabases(this.limit, this.offset)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => this.query = data),
      msa: () => this.web.getMSAs(this.msaLimit, this.msaOffset)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => this.msaQuery = data),
      structure: () => this.web.getStructures(this.structureLimit, this.structureOffset)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => this.structureQuery = data)
    };

    refreshHandlers[type]();
  }

  delete(id: number, fileType: 'database' | 'msa' | 'structure'): void {
    const term = this.form.value.searchTerm || '';
    
    const deleteHandlers = {
      database: () => this.web.deleteProteinFastaDatabase(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.web.getProteinFastaDatabases(this.limit, this.offset, term)
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
              this.query = data;
              this.sb.open('Database deleted', 'Close', { duration: 2000 });
            });
        }),
      msa: () => this.web.deleteMSA(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.web.getMSAs(this.msaLimit, this.msaOffset, term)
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
              this.msaQuery = data;
              this.sb.open('MSA deleted', 'Close', { duration: 2000 });
            });
        }),
      structure: () => this.web.deleteStructure(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.web.getStructures(this.structureLimit, this.structureOffset, term)
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
              this.structureQuery = data;
              this.sb.open('Structure deleted', 'Close', { duration: 2000 });
            });
        })
    };

    deleteHandlers[fileType]();
  }

  onTabChange(event: any): void {
    this.form.reset();
    this.fileList.set([]);
    this.fileProgressMap = {};
    this.resetFileInputs();
  }
}
