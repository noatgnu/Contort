import { Component } from '@angular/core';
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
export class UploadFastaDatabaseComponent {
  fileList: File[] = [];
  fileProgressMap: any = {};
  fileType: string = '';
  allowFileType = ['fasta', 'txt', 'fa', 'fas'];
  allowMSAFileType = ['fasta', 'aln', 'fasta-aln', 'fas', 'txt'];
  allowPDBFileType = ['pdb'];
  form = this.fb.group({
    name: ['', Validators.required],
    searchTerm: ['']
  });
  displayedColumns: string[] = ['name', 'action'];

  limit = 10;
  page = 1;

  query: ProteinFastaDatabaseQuery | undefined;
  msaQuery: MultipleSequenceAlignmentQuery | undefined;

  msaLimit = 10;
  msaPage = 1;

  structureQuery: StructureFileQuery | undefined;
  structureLimit = 10;
  structurePage = 1;

  constructor(
    private web: WebService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UploadFastaDatabaseComponent>,
    private sb: MatSnackBar
  ) {
    this.web.getProteinFastaDatabases().subscribe((data) => {
      this.query = data;
    });

    this.form.controls.searchTerm.valueChanges.subscribe((value) => {
      if (value) {
        this.web.getProteinFastaDatabases(this.limit, this.page, value).subscribe((data) => {
          this.query = data;
        });
      }
    });
  }

  onPaginate(event: PageEvent, type: 'database' | 'msa' | 'structure') {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    let term = '';
    if (this.form.value.searchTerm) {
      term = this.form.value.searchTerm;
    }
    if (type === 'database') {
      this.web.getProteinFastaDatabases(this.limit, this.page, term).subscribe((data) => {
        this.query = data;
      });
    } else if (type === 'msa') {
      this.web.getMSAs(this.msaLimit, this.msaPage, term).subscribe((data) => {
        this.msaQuery = data;
      });
    } else {
      this.web.getStructures(this.structureLimit, this.structurePage, term).subscribe((data) => {
        this.structureQuery = data;
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

  async uploadData(event: Event, type: 'database' | 'msa' | 'structure') {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.fileList = [];
      for (let i = 0; i < files.length; i++) {
        this.fileList.push(files[i]);
        this.fileProgressMap[files[i].name] = { progress: 0, total: files[i].size };
      }
      for (let i = 0; i < files.length; i++) {
        await this.uploadFile(files[i], type);
      }
    }
  }

  getFileExntension(file: File) {
    const parts = file.name.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1];
    }
    return '';
  }

  private async uploadFile(file: File, type: 'database' | 'msa' | 'structure') {
    const chunkSize = 1024 * 1024;
    const fileSize = file.size;
    const hashObj = new jsSHA('SHA-256', 'ARRAYBUFFER');
    this.fileType = this.getFileExntension(file);
    console.log(this.fileType)
    const allowedFileType = type === 'database' ? this.allowFileType : type === 'msa' ? this.allowMSAFileType : this.allowPDBFileType;
    console.log(allowedFileType)
    if (!allowedFileType.includes(this.fileType)) {
      this.sb.open('Invalid file type', 'Close', { duration: 2000 });
      return;
    }

    if (chunkSize > fileSize) {
      const chunk = await file.arrayBuffer();
      hashObj.update(chunk);
      const hashDigest = hashObj.getHash('HEX');
      const result = await this.web.uploadDataChunkComplete('', hashDigest, file, file.name).toPromise();
      this.fileProgressMap[file.name].progress = fileSize;
      if (result?.completed_at && this.form.value.name) {
        this.web.bindUploadedFile(this.form.value.name, result?.id, type).subscribe((data) => {
          this.sb.open('File uploaded', 'Close', { duration: 2000 });
          if (type === 'database') {
            this.web.getProteinFastaDatabases(this.limit, this.page).subscribe((data) => {
              this.query = data;
            });
          } else if (type === 'msa') {
            this.web.getMSAs(this.msaLimit, this.msaPage).subscribe((data) => {
              this.msaQuery = data;
            });
          } else {
            this.web.getStructures(this.structureLimit, this.structurePage).subscribe((data) => {
              this.structureQuery = data;
            });
          }
        });
      }
    } else {
      let currentURL = '';
      let currentOffset = 0;
      while (fileSize > currentOffset) {
        let end = currentOffset + chunkSize;
        if (end >= fileSize) {
          end = fileSize;
        }
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
      if (currentURL !== '') {
        const hashDigest = hashObj.getHash('HEX');
        const result = await this.web.uploadDataChunkComplete(currentURL, hashDigest).toPromise();
        if (result?.completed_at && this.form.value.name) {
          this.web.bindUploadedFile(this.form.value.name, result?.id, type).subscribe((data) => {
            this.fileProgressMap[file.name].progress = fileSize;
            this.sb.open('File uploaded', 'Close', { duration: 2000 });
            if (type === 'database') {
              this.web.getProteinFastaDatabases(this.limit, this.page).subscribe((data) => {
                this.query = data;
              });
            } else if (type === 'msa') {
              this.web.getMSAs(this.msaLimit, this.msaPage).subscribe((data) => {
                this.msaQuery = data;
              });
            } else {
              this.web.getStructures(this.structureLimit, this.structurePage).subscribe((data) => {
                this.structureQuery = data;
              });
            }

          });
        }
      }
    }
  }

  delete(id: number, file_type: 'database' | 'msa' | 'structure') {
    if (file_type === 'database') {
      this.web.deleteProteinFastaDatabase(id).subscribe((data) => {
        let term = '';
        if (this.form.value.searchTerm) {
          term = this.form.value.searchTerm;
        }
        this.web.getProteinFastaDatabases(this.limit, this.page, term).subscribe((data) => {
          this.query = data;
        });
      });
    } else if (file_type === 'msa') {
      this.web.deleteMSA(id).subscribe((data) => {
        let term = '';
        if (this.form.value.searchTerm) {
          term = this.form.value.searchTerm;
        }
        this.web.getMSAs(this.msaLimit, this.msaPage, term).subscribe((data) => {
          this.msaQuery = data;
        });
      });
    } else {
      this.web.deleteStructure(id).subscribe((data) => {
        let term = '';
        if (this.form.value.searchTerm) {
          term = this.form.value.searchTerm;
        }
        this.web.getStructures(this.structureLimit, this.structurePage, term).subscribe((data) => {
          this.structureQuery = data;
        });
      })
    }

  }
}
