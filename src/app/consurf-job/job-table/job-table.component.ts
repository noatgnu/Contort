import {Component, EventEmitter, Input, Output, OnDestroy} from '@angular/core';
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
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatSnackBar} from "@angular/material/snack-bar";
import {WebsocketService} from "../../websocket.service";
import {Subject, debounceTime, distinctUntilChanged, takeUntil} from 'rxjs';

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
    MatOption,
    MatIcon,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './job-table.component.html',
  styleUrl: './job-table.component.scss'
})
export class JobTableComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  readonly pageSize = 10;
  offset = 0;
  consurfJobQuery: ConsurfJobQuery | undefined;
  
  readonly columns = [
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
  ];
  
  readonly displayedColumns = [
    "id",
    "job_title",
    "uniprot_accession",
    "status",
    "query_name",
    "created_at",
    "updated_at",
    "actions"
  ];

  form = this.fb.group({
    searchTerm: [""],
    status: ["all"]
  });

  @Output() clickedRow = new EventEmitter<number>();
  
  @Input() set status(value: string) {
    if (value) {
      this.form.controls.status.setValue(value);
    }
  }

  constructor(
    private web: WebService,
    private fb: FormBuilder,
    private websocket: WebsocketService,
    private sb: MatSnackBar
  ) {
    this.setupWebsocketListener();
    this.loadInitialData();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupWebsocketListener(): void {
    this.websocket.jobMessage
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (this.consurfJobQuery?.results) {
          const index = this.consurfJobQuery.results.findIndex(job => job.id === data.job_id);
          if (index !== -1) {
            this.web.getConsurfJob(data.job_id)
              .pipe(takeUntil(this.destroy$))
              .subscribe(job => {
                if (this.consurfJobQuery) {
                  this.consurfJobQuery.results[index] = job;
                  this.consurfJobQuery.results = [...this.consurfJobQuery.results];
                }
              });
          }
        }
      });
  }

  private loadInitialData(): void {
    this.web.getConsurfJobs(this.pageSize, this.offset)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.consurfJobQuery = data);
  }

  private setupFormListeners(): void {
    this.form.controls.searchTerm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.offset = 0;
        const term = value || '';
        const status = this.form.value.status || 'all';
        this.web.getConsurfJobs(this.pageSize, this.offset, term, status)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.consurfJobQuery = data);
      });

    this.form.controls.status.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.offset = 0;
        const term = this.form.value.searchTerm || '';
        const status = value || 'all';
        this.web.getConsurfJobs(this.pageSize, this.offset, term, status)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.consurfJobQuery = data);
      });
  }

  onPageChange(event: any): void {
    const offset = event.pageIndex * event.pageSize;
    const term = this.form.value.searchTerm || '';
    const status = this.form.value.status || 'all';
    
    this.offset = offset;
    this.web.getConsurfJobs(this.pageSize, offset, term, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.consurfJobQuery = data);
  }

  clickRow(row: any): void {
    this.clickedRow.emit(row.id);
  }

  cancelJob(event: Event, jobId: number): void {
    event.stopPropagation();

    if (!confirm('Are you sure you want to cancel this job?')) {
      return;
    }

    this.web.cancelConsurfJob(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.sb.open('Job cancelled successfully', 'Close', {duration: 2000});
          if (this.consurfJobQuery?.results) {
            const index = this.consurfJobQuery.results.findIndex(job => job.id === jobId);
            if (index !== -1) {
              this.consurfJobQuery.results[index].status = response.status;
              this.consurfJobQuery.results = [...this.consurfJobQuery.results];
            }
          }
        },
        error: (err) => {
          this.sb.open(err.error?.error || 'Failed to cancel job', 'Close', {duration: 3000});
        }
      });
  }

  canCancelJob(status: string): boolean {
    return status === 'pending' || status === 'running';
  }
}
