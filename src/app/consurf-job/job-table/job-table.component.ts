import {Component, EventEmitter, Input, Output} from '@angular/core';
import {WebService} from "../../web.service";
import {ConsurfJobQuery} from "../../consurf-job";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {DatePipe} from "@angular/common";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {WebsocketService} from "../../websocket.service";

@Component({
  selector: 'app-job-table',
  imports: [
    MatTable,
    MatColumnDef,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    DatePipe,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatSelect,
    MatOption
  ],
  templateUrl: './job-table.component.html',
  styleUrl: './job-table.component.scss'
})
export class JobTableComponent {
  pageSize: number = 10
  currentPage: number = 1
  consurfJobQuery: ConsurfJobQuery|undefined
  columns = [
    'user',
  'job_title',
    'query_sequence',
  'alignment_program',
  'fasta_database',
  'created_at',
  'status',
  'updated_at',
  'log_data',
  'error_data',
  'process_cmd',
  'max_homologs',
  'max_iterations',
  'substitution_model',
  'maximum_likelihood',
  'max_id',
  'min_id',
  'closest',
  'cutoff',
  'algorithm',
  'email_notification',
  'id',
  'structure_file',
  'msa',
  'chain',
  'uniprot_accession',
  'query_name'
  ]
  displayedColumns = [
    "id",
    "job_title",
    "uniprot_accession",
    "status",
    "query_name",
    "created_at",
    "updated_at",
    ]

  form = this.fb.group({
    searchTerm: [""],
    status: ["all"]
  })

  @Output() clickedRow: EventEmitter<number> = new EventEmitter<number>()
  @Input() set status(value: string) {
    if (value) {
      this.form.controls.status.setValue(value)
    }
  }

  constructor(private web: WebService, private fb: FormBuilder, private websocket: WebsocketService) {
    this.websocket.jobMessage.subscribe((data) => {
      if (this.consurfJobQuery) {
        if (this.consurfJobQuery.results) {
          const index = this.consurfJobQuery.results.findIndex((job) => job.id === data.job_id)
          if (index !== -1) {
            this.web.getConsurfJob(data.job_id).subscribe((job) => {
              if (this.consurfJobQuery) {
                this.consurfJobQuery.results[index] = job
                this.consurfJobQuery.results = [...this.consurfJobQuery.results]
              }

            })
          }
        }
      }
    })
    this.web.getConsurfJobs(this.pageSize, this.currentPage).subscribe((data) => {
      this.consurfJobQuery = data
    })
    this.form.controls.searchTerm.valueChanges.subscribe((value) => {
      if (value) {
        // @ts-ignore
        this.web.getConsurfJobs(this.pageSize, this.currentPage, value, this.form.value.status).subscribe((data) => {
          this.consurfJobQuery = data
        })
      }
    })
    this.form.controls.status.valueChanges.subscribe((value) => {
      if (value) {
        // @ts-ignore
        this.web.getConsurfJobs(this.pageSize, this.currentPage, this.form.value.searchTerm, value).subscribe((data) => {
          this.consurfJobQuery = data
        })
      }

    })
  }

  onPageChange(event: any) {
    let term = ""
    if (this.form.value.searchTerm) {
      term = this.form.value.searchTerm
    }
    this.currentPage = event.pageIndex+1
    this.web.getConsurfJobs(this.pageSize, event.pageIndex+1, term).subscribe((data) => {
      this.consurfJobQuery = data
    })
  }

  clickRow(row: any) {
    this.clickedRow.emit(row.id)
  }
}
