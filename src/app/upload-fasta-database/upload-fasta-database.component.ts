import { Component } from '@angular/core';
import {WebService} from "../web.service";
import jsSHA from "jssha";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProteinFastaDatabaseQuery} from "../protein-fasta-database";
import {MatDivider} from "@angular/material/divider";
import {
  MatCell, MatCellDef, MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-upload-fasta-database',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatDialogActions,
    MatProgressBar,
    MatDivider,
    MatTable,
    MatHeaderRow,
    MatRow,
    MatHeaderCell,
    MatCell,
    MatHeaderRowDef,
    MatRowDef,
    MatColumnDef,
    MatCellDef,
    MatHeaderCellDef,
    MatIconButton,
    MatIcon,
    MatPaginator
  ],
  templateUrl: './upload-fasta-database.component.html',
  styleUrl: './upload-fasta-database.component.scss'
})
export class UploadFastaDatabaseComponent {
  fileList: File[] = []
  fileProgressMap: any = {}
  fileType: string = ""
  allowFileType = ["fasta", "txt", "fa", "fas"]
  form = this.fb.group({
    name: ["", Validators.required],
    searchTerm: [""]
  })
  displayedColumns: string[] = ["name", "action"]

  limit = 10
  page = 1

  query: ProteinFastaDatabaseQuery|undefined

  constructor(private web: WebService, private fb: FormBuilder, private dialogRef: MatDialogRef<UploadFastaDatabaseComponent>, private sb: MatSnackBar) {
    this.web.getProteinFastaDatabases().subscribe((data) => {
      this.query = data
    })

    this.form.controls.searchTerm.valueChanges.subscribe((value) => {
      if (value) {
        this.web.getProteinFastaDatabases(this.limit, this.page, value).subscribe((data) => {
          this.query = data
        })
      }
    })
  }

  onPaginate(event: PageEvent) {
    this.page = event.pageIndex + 1
    this.limit = event.pageSize
    let term = ""
    if (this.form.value.searchTerm) {
      term = this.form.value.searchTerm
    }
    this.web.getProteinFastaDatabases(this.limit, this.page, term).subscribe((data) => {
      this.query = data
    })

  }

  close() {
    this.dialogRef.close()
  }

  async uploadData(event: Event){
    const files = (event.target as HTMLInputElement).files
    if (files) {
      this.fileList = []
      for (let i = 0; i < files.length; i++) {
        this.fileList.push(files[i])
        this.fileProgressMap[files[i].name] = {progress: 0, total: files[i].size}
      }
      for (let i = 0; i < files.length; i++) {
        await this.uploadFile(files[i]);
      }
    }
  }

  getFileExntension(file: File) {
    const parts = file.name.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1]
    }
    return ""
  }

  private async uploadFile(file: File) {
    const chunkSize = 1024 * 1024;
    const fileSize = file.size;
    const hashObj = new jsSHA("SHA-256", "ARRAYBUFFER");
    this.fileType = this.getFileExntension(file);

    if (this.allowFileType.indexOf(this.fileType) === -1) {
      return;
    }
    if (chunkSize > fileSize) {
      const chunk = await file.arrayBuffer();
      hashObj.update(chunk)
      const hashDigest = hashObj.getHash("HEX");
      const result = await this.web.uploadDataChunkComplete("", hashDigest, file, file.name).toPromise()
      this.fileProgressMap[file.name].progress = fileSize;
      if (result?.completed_at && this.form.value.name) {
        this.web.bindUploadedFile(this.form.value.name, result?.id).subscribe((data) => {
          this.sb.open("File uploaded", "Close", {duration: 2000})
          this.web.getProteinFastaDatabases(this.limit, this.page).subscribe((data) => {
            this.query = data
          })
        })
      }
    } else {
      let currentURL = "";
      let currentOffset = 0;
      while (fileSize > currentOffset) {
        let end = currentOffset + chunkSize;
        if (end >= fileSize) {
          end = fileSize;
        }
        const chunk = await file.slice(currentOffset, end).arrayBuffer();
        hashObj.update(chunk)
        const filePart = new File([chunk], file.name, {type: file.type})
        console.log(filePart.size)
        const contentRange = `bytes ${currentOffset}-${end - 1}/${fileSize}`;
        console.log(contentRange)
        const result = await this.web.uploadDataChunk(currentURL, filePart, file.name, contentRange).toPromise()
        if (result) {
          currentURL = result.url;
          currentOffset = result.offset;
          this.fileProgressMap[file.name].progress = currentOffset;
        }
      }
      if (currentURL !== "") {
        const hashDigest = hashObj.getHash("HEX");
        const result = await this.web.uploadDataChunkComplete(currentURL, hashDigest).toPromise()
        if (result?.completed_at && this.form.value.name) {
          this.web.bindUploadedFile(this.form.value.name, result?.id).subscribe((data) => {
            this.fileProgressMap[file.name].progress = fileSize;
            this.sb.open("File uploaded", "Close", {duration: 2000})
            this.web.getProteinFastaDatabases(this.limit, this.page).subscribe((data) => {
              this.query = data
            })
          })
        }
      }
    }
  }

  delete(id: number) {
    this.web.deleteProteinFastaDatabase(id).subscribe((data) => {
      let term = ""
      if (this.form.value.searchTerm) {
        term = this.form.value.searchTerm
      }
      this.web.getProteinFastaDatabases(this.limit, this.page, term).subscribe((data) => {
        this.query = data

      })
    })
  }
}
