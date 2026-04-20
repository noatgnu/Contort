import {Component, EventEmitter, Input, Output, signal, inject, DestroyRef} from '@angular/core';
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
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatCheckbox} from "@angular/material/checkbox";
import {SelectionModel} from "@angular/cdk/collections";
import {ConsurfJob} from "../../consurf-job";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {WebsocketService} from "../../websocket.service";
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {BatchJobService, BatchJob} from '../../batch-job.service';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../shared/confirm-dialog/confirm-dialog.component';
import {SkeletonLoaderComponent} from '../../shared/skeleton-loader/skeleton-loader.component';
import {EmptyStateComponent} from '../../shared/empty-state/empty-state.component';
import {JobProgressComponent} from '../job-progress/job-progress.component';
import {trigger, state, style, transition, animate} from '@angular/animations';

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
    MatButton,
    MatTooltip,
    MatCheckbox,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    JobProgressComponent
  ],
  templateUrl: './job-table.component.html',
  styleUrl: './job-table.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class JobTableComponent {
  private destroyRef = inject(DestroyRef);
  private readonly STORAGE_KEY = 'consurfJobFilters';

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
    "expand",
    "select",
    "id",
    "job_title",
    "uniprot_accession",
    "status",
    "query_name",
    "batch",
    "created_at",
    "updated_at",
    "actions"
  ];

  readonly columnsToDisplayWithExpand = [...this.displayedColumns];

  batches: BatchJob[] = [];
  selection = new SelectionModel<ConsurfJob>(true, []);
  expandedElement: ConsurfJob | null = null;
  isLoading = signal(false);

  form = this.fb.group({
    searchTerm: [""],
    status: ["all"],
    batchId: ["all"]
  });

  private loadSavedFilters(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const filters = JSON.parse(saved);
        if (filters.status) {
          this.form.controls.status.setValue(filters.status, { emitEvent: false });
        }
        if (filters.batchId) {
          this.form.controls.batchId.setValue(filters.batchId, { emitEvent: false });
        }
      }
    } catch (e) {
    }
  }

  private saveFilters(): void {
    try {
      const filters = {
        status: this.form.value.status,
        batchId: this.form.value.batchId
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filters));
    } catch (e) {
    }
  }

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
    private sb: MatSnackBar,
    private dialog: MatDialog,
    public batchJobService: BatchJobService
  ) {
    this.batches = this.batchJobService.getBatches();
    this.loadSavedFilters();
    this.setupWebsocketListener();
    this.loadInitialData();
    this.setupFormListeners();
  }

  getBatchName(jobId: number): string {
    const batch = this.batchJobService.getBatchForJob(jobId);
    return batch?.name || '-';
  }

  private setupWebsocketListener(): void {
    this.websocket.jobMessage
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        if (this.consurfJobQuery?.results) {
          const index = this.consurfJobQuery.results.findIndex(job => job.id === data.job_id);
          if (index !== -1) {
            this.web.getConsurfJob(data.job_id)
              .pipe(takeUntilDestroyed(this.destroyRef))
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
    const term = this.form.value.searchTerm || '';
    const status = this.form.value.status || 'all';
    const batchId = this.form.value.batchId || 'all';

    this.web.getConsurfJobs(this.pageSize, this.offset, term, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        if (batchId !== 'all') {
          const batchJobIds = this.batchJobService.getBatchJobs(batchId);
          data.results = data.results.filter(job => batchJobIds.includes(job.id));
          data.count = data.results.length;
        }
        this.consurfJobQuery = data;
      });
  }

  private setupFormListeners(): void {
    this.form.controls.searchTerm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.refreshData());

    this.form.controls.status.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.saveFilters();
        this.refreshData();
      });

    this.form.controls.batchId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.saveFilters();
        this.refreshData();
      });
  }

  private refreshData(): void {
    this.offset = 0;
    const term = this.form.value.searchTerm || '';
    const status = this.form.value.status || 'all';
    const batchId = this.form.value.batchId || 'all';

    this.web.getConsurfJobs(this.pageSize, this.offset, term, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        if (batchId !== 'all') {
          const batchJobIds = this.batchJobService.getBatchJobs(batchId);
          data.results = data.results.filter(job => batchJobIds.includes(job.id));
          data.count = data.results.length;
        }
        this.consurfJobQuery = data;
      });
  }

  onPageChange(event: any): void {
    const offset = event.pageIndex * event.pageSize;
    const term = this.form.value.searchTerm || '';
    const status = this.form.value.status || 'all';
    
    this.offset = offset;
    this.web.getConsurfJobs(this.pageSize, offset, term, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.consurfJobQuery = data);
  }

  clickRow(row: any): void {
    this.clickedRow.emit(row.id);
  }

  cancelJob(event: Event, jobId: number): void {
    event.stopPropagation();

    const dialogData: ConfirmDialogData = {
      title: 'Cancel Job',
      message: 'Are you sure you want to cancel this job? This action cannot be undone.',
      icon: 'cancel',
      confirmText: 'Cancel Job',
      cancelText: 'Keep Running',
      danger: true
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (!confirmed) return;

        this.web.cancelConsurfJob(jobId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response) => {
              this.sb.open('Job cancelled successfully', 'Close', {duration: 2000});
              if (this.consurfJobQuery?.results) {
                const index = this.consurfJobQuery.results.findIndex(job => job.id === jobId);
                if (index !== -1) {
                  this.consurfJobQuery.results[index] = {...this.consurfJobQuery.results[index], status: response.status};
                  this.consurfJobQuery.results = [...this.consurfJobQuery.results];
                }
              }
            },
            error: (err) => {
              this.sb.open(err.error?.error || 'Failed to cancel job', 'Close', {duration: 3000});
            }
          });
      });
  }

  canCancelJob(status: string): boolean {
    return status === 'pending' || status === 'running';
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.consurfJobQuery?.results.length || 0;
    return numSelected === numRows && numRows > 0;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    if (this.consurfJobQuery?.results) {
      this.selection.select(...this.consurfJobQuery.results);
    }
  }

  getSelectedCancellableJobs(): ConsurfJob[] {
    return this.selection.selected.filter(job => this.canCancelJob(job.status));
  }

  bulkCancelJobs(): void {
    const cancellableJobs = this.getSelectedCancellableJobs();
    if (cancellableJobs.length === 0) {
      this.sb.open('No cancellable jobs selected', 'Close', { duration: 2000 });
      return;
    }

    const dialogData: ConfirmDialogData = {
      title: 'Cancel Selected Jobs',
      message: `Are you sure you want to cancel ${cancellableJobs.length} job(s)? This action cannot be undone.`,
      icon: 'cancel',
      confirmText: 'Cancel Jobs',
      cancelText: 'Keep Running',
      danger: true
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (!confirmed) return;

        let completed = 0;
        let failed = 0;

        cancellableJobs.forEach(job => {
          this.web.cancelConsurfJob(job.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (response) => {
                completed++;
                if (this.consurfJobQuery?.results) {
                  const index = this.consurfJobQuery.results.findIndex(j => j.id === job.id);
                  if (index !== -1) {
                    this.consurfJobQuery.results[index] = {...this.consurfJobQuery.results[index], status: response.status};
                    this.consurfJobQuery.results = [...this.consurfJobQuery.results];
                  }
                }
                if (completed + failed === cancellableJobs.length) {
                  this.sb.open(`${completed} job(s) cancelled successfully`, 'Close', { duration: 2000 });
                  this.selection.clear();
                }
              },
              error: () => {
                failed++;
                if (completed + failed === cancellableJobs.length) {
                  this.sb.open(`${completed} cancelled, ${failed} failed`, 'Close', { duration: 3000 });
                  this.selection.clear();
                }
              }
            });
        });
      });
  }

  clearSelection(): void {
    this.selection.clear();
  }

  toggleExpand(event: Event, element: ConsurfJob): void {
    event.stopPropagation();
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  isExpanded(element: ConsurfJob): boolean {
    return this.expandedElement === element;
  }
}
