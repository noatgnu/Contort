import {Component, Input, signal, computed, inject, DestroyRef} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {WebService} from "../web.service";
import {ProteinFastaDatabaseQuery} from "../protein-fasta-database";
import {MultipleSequenceAlignment, MultipleSequenceAlignmentQuery} from "../msa";
import {StructureFileQuery} from "../structure";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {MatDialog} from "@angular/material/dialog";
import {SaveStructureFileDialogComponent} from "./save-structure-file-dialog/save-structure-file-dialog.component";
import {Router} from "@angular/router";
import {WebsocketService} from "../websocket.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {forkJoin, Observable, debounceTime, distinctUntilChanged, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ConsurfJob} from "../consurf-job";
import {AccountService} from "../account.service";
import {BatchJobService} from "../batch-job.service";
import {CustomValidators} from "../shared/validators";

@Component({
  selector: 'app-consurf-job',
  templateUrl: './consurf-job.component.html',
  styleUrl: './consurf-job.component.scss',
  standalone: false,
})
export class ConsurfJobComponent {
  private destroyRef = inject(DestroyRef);

  private _jobid: string = "";
  status = signal<string>("unsubmitted");
  log_data = signal<string>("");
  error_data = signal<string>("");
  uniprot: any = {};

  chainArray = signal<string[]>([]);
  currentTabIndex: number = 0;
  sequence_names = signal<string[]>([]);
  numberOfSequences = signal<number>(0);
  isSubmitting = signal<boolean>(false);
  isFetchingSequence = signal<boolean>(false);
  isFetchingStructure = signal<boolean>(false);

  @Input() set jobid(value: string) {
    this._jobid = value;
    if (value) {
      this.currentTabIndex = 1;
      this.loadJobData(parseInt(value));
    }
  }

  get jobid(): string {
    return this._jobid;
  }

  readonly model_options = ["BEST", "JTT", "LG", "mtREV", "cpREV", "WAG", "Dayhoff"] as const;
  readonly alignment_options = ["MAFFT", "CLUSTALW", "PRANK", "MUSCLE"] as const;
  readonly algorithm_options = ["HMMER", "BLAST", "MMseqs2"] as const;

  mode = signal<'db' | 'msa'>('db');

  form = this.fb.group({
    uniprot_id: this.fb.control('', [CustomValidators.uniprotAccession()]),
    query_sequence: this.fb.control('', [Validators.required, CustomValidators.fastaFormat()]),
    alignment_program: this.fb.control('MAFFT'),
    fasta_database_id: this.fb.control<any[]>([], [Validators.required, CustomValidators.minArrayLength(1)]),
    model: this.fb.control("BEST", Validators.required),
    iterations: this.fb.control(1, [Validators.required, Validators.min(1), Validators.max(10)]),
    cutoff: this.fb.control(0.0001, [Validators.required, Validators.min(0), Validators.max(1)]),
    max_homologs: this.fb.control(150, [Validators.required, Validators.min(1), Validators.max(500)]),
    closest: this.fb.control(false),
    max_id: this.fb.control(95, [Validators.required, Validators.min(0), Validators.max(100)]),
    min_id: this.fb.control(35, [Validators.required, Validators.min(0), Validators.max(100)]),
    maximum_likelihood: this.fb.control(false),
    algorithm: this.fb.control("HMMER", Validators.required),
    job_title: this.fb.control("", [Validators.required, Validators.maxLength(100)]),
    searchTerm: this.fb.control(""),
    searchTermPDB: this.fb.control(""),
    searchTermMSA: this.fb.control(""),
    email_notification: this.fb.control(false),
    structure_id: this.fb.control<any[]>([]),
    chain: this.fb.control(""),
    msa_id: this.fb.control<any[]>([]),
    query_name: this.fb.control("")
  });

  formErrors = computed(() => {
    const errors: string[] = [];
    if (this.form.controls.job_title.errors?.['required']) {
      errors.push('Job name is required');
    }
    if (this.mode() === 'db') {
      if (this.form.controls.query_sequence.errors?.['required']) {
        errors.push('Sequence is required');
      }
      if (this.form.controls.query_sequence.errors?.['fastaNoHeader']) {
        errors.push('Sequence must start with ">" header');
      }
      if (this.form.controls.fasta_database_id.errors?.['minArrayLength']) {
        errors.push('Please select a FASTA database');
      }
    } else {
      if (this.form.controls.msa_id.errors?.['minArrayLength']) {
        errors.push('Please select an MSA file');
      }
    }
    return errors;
  });

  setMode(mode: 'db' | 'msa'): void {
    this.mode.set(mode);
    if (mode === 'db') {
      this.form.controls.fasta_database_id.setValidators([Validators.required, CustomValidators.minArrayLength(1)]);
      this.form.controls.query_sequence.setValidators([Validators.required, CustomValidators.fastaFormat()]);
      this.form.controls.msa_id.clearValidators();
      this.form.controls.msa_id.setValue([]);
      this.form.controls.query_name.setValue('');
      this.sequence_names.set([]);
    } else {
      this.form.controls.msa_id.setValidators([Validators.required, CustomValidators.minArrayLength(1)]);
      this.form.controls.fasta_database_id.clearValidators();
      this.form.controls.fasta_database_id.setValue([]);
      this.form.controls.query_sequence.clearValidators();
    }
    this.form.controls.fasta_database_id.updateValueAndValidity();
    this.form.controls.msa_id.updateValueAndValidity();
    this.form.controls.query_sequence.updateValueAndValidity();
  }

  readonly limit = 10;
  offset = 0;
  readonly msaLimit = 10;
  msaOffset = 0;
  readonly pdbLimit = 10;
  pdbOffset = 0;

  proteinDatabaseQuery: ProteinFastaDatabaseQuery | undefined;
  msaQuery: MultipleSequenceAlignmentQuery | undefined;
  structureQuery: StructureFileQuery | undefined;

  constructor(
    private sb: MatSnackBar,
    private websocket: WebsocketService,
    private router: Router,
    private fb: FormBuilder,
    private web: WebService,
    private dialog: MatDialog,
    public accountService: AccountService,
    private batchJobService: BatchJobService
  ) {
    this.setupWebsocketListener();
    this.setupFormListeners();
    this.loadInitialData();
  }

  private loadJobData(jobId: number): void {
    this.web.getConsurfJob(jobId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(job => {
        this.populateFormFromJob(job);
        this.log_data.set(job.log_data);
        this.error_data.set(job.error_data);
        this.status.set(job.status);
      });
  }

  private populateFormFromJob(job: any): void {
    const jobMode: 'db' | 'msa' = job.msa && !job.fasta_database ? 'msa' : 'db';
    this.setMode(jobMode);
    this.form.patchValue({
      query_sequence: job.query_sequence,
      alignment_program: job.alignment_program,
      fasta_database_id: job.fasta_database ? [job.fasta_database] : [],
      msa_id: job.msa ? [job.msa] : [],
      query_name: job.query_name,
      structure_id: job.structure_file ? [job.structure_file] : [],
      max_homologs: job.max_homologs,
      closest: job.closest,
      max_id: job.max_id,
      min_id: job.min_id,
      maximum_likelihood: job.maximum_likelihood,
      algorithm: job.algorithm,
      job_title: job.job_title,
      model: job.substitution_model,
      iterations: job.max_iterations,
      cutoff: job.cutoff,
      email_notification: job.email_notification,
      uniprot_id: job.uniprot_accession
    });

    if (job.query_sequence) {
      const count = job.query_sequence.split("\n").filter((a: string) => a[0] === ">").length;
      this.numberOfSequences.set(count);
    }

    if (job.msa) {
      this.web.getAllSequenceNamesFromMSA(job.msa)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(names => this.sequence_names.set(names));
    }
  }

  private setupWebsocketListener(): void {
    const terminalStates = new Set(['completed', 'failed', 'cancelled']);
    this.websocket.jobMessage
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(message => {
        if (message.job_id === parseInt(this.jobid)) {
          this.status.set(message.status);
          if (message.log_data) {
            this.log_data.set(message.log_data);
          }
          if (message.error_data) {
            this.error_data.set(message.error_data);
          }
          if (terminalStates.has(message.status)) {
            this.loadJobData(parseInt(this.jobid));
          }
        }
      });
  }

  private setupFormListeners(): void {
    this.form.controls.query_sequence.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (value) {
          const count = value.split("\n").filter((a: string) => a[0] === ">").length;
          this.numberOfSequences.set(count);
        }
      });

    this.form.controls.searchTerm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        const term = value || '';
        this.offset = 0;
        this.web.getProteinFastaDatabases(this.limit, this.offset, term)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(data => this.proteinDatabaseQuery = data);
      });

    this.form.controls.searchTermMSA.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        const term = value || '';
        this.msaOffset = 0;
        this.web.getMSAs(this.msaLimit, this.msaOffset, term)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(data => this.msaQuery = data);
      });

    this.form.controls.searchTermPDB.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        const term = value || '';
        this.pdbOffset = 0;
        this.web.getStructures(this.pdbLimit, this.pdbOffset, term)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(data => this.structureQuery = data);
      });
  }

  private loadInitialData(): void {
    this.web.getProteinFastaDatabases(this.limit, this.offset)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.proteinDatabaseQuery = data);

    this.web.getMSAs(this.msaLimit, this.msaOffset)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.msaQuery = data);

    this.web.getStructures(this.pdbLimit, this.pdbOffset)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.structureQuery = data);
  }

  onPageChange(event: any, type: string): void {
    const limit = event.pageSize;
    const offset = event.pageIndex * event.pageSize;
    const term = this.getSearchTerm(type);

    const handlers = {
      database: () => {
        this.offset = offset;
        this.web.getProteinFastaDatabases(limit, offset, term)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(data => this.proteinDatabaseQuery = data);
      },
      msa: () => {
        this.msaOffset = offset;
        this.web.getMSAs(limit, offset, term)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(data => this.msaQuery = data);
      },
      structure: () => {
        this.pdbOffset = offset;
        this.web.getStructures(limit, offset, term)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(data => this.structureQuery = data);
      }
    };

    if (type in handlers) {
      handlers[type as keyof typeof handlers]();
    }
  }

  private getSearchTerm(type: string): string {
    const termMap = {
      database: this.form.controls.searchTerm.value,
      msa: this.form.controls.searchTermMSA.value,
      structure: this.form.controls.searchTermPDB.value
    };
    return termMap[type as keyof typeof termMap] || '';
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      const errors = this.formErrors();
      if (errors.length > 0) {
        this.sb.open(errors[0], "Dismiss", { duration: 3000 });
      } else {
        this.sb.open("Please correct the form errors", "Dismiss", { duration: 3000 });
      }
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    if (this.numberOfSequences() > 1) {
      this.submitBatchJobs();
    } else {
      this.submitSingleJob();
    }
  }

  getUniprotErrorMessage(): string {
    const control = this.form.controls.uniprot_id;
    if (control.hasError('invalidUniprot')) {
      return 'Invalid UniProt accession format (e.g., P12345, Q9Y6K9)';
    }
    return '';
  }

  getJobTitleErrorMessage(): string {
    const control = this.form.controls.job_title;
    if (control.hasError('required')) {
      return 'Job name is required';
    }
    if (control.hasError('maxlength')) {
      return 'Job name must be less than 100 characters';
    }
    return '';
  }

  getSequenceErrorMessage(): string {
    const control = this.form.controls.query_sequence;
    if (control.hasError('required')) {
      return 'Sequence is required';
    }
    if (control.hasError('fastaNoHeader')) {
      return 'Sequence must start with a ">" header line';
    }
    if (control.hasError('fastaNoSequence')) {
      return 'Sequence data is missing after the header';
    }
    return '';
  }

  getIterationsErrorMessage(): string {
    const control = this.form.controls.iterations;
    if (control.hasError('min')) {
      return 'Minimum value is 1';
    }
    if (control.hasError('max')) {
      return 'Maximum value is 10';
    }
    return '';
  }

  getIdentityErrorMessage(field: 'max_id' | 'min_id'): string {
    const control = this.form.get(field);
    if (control?.hasError('min')) {
      return 'Minimum value is 0%';
    }
    if (control?.hasError('max')) {
      return 'Maximum value is 100%';
    }
    return '';
  }

  private submitBatchJobs(): void {
    if (this.mode() !== 'db' || !this.form.controls.query_sequence.value) {
      this.isSubmitting.set(false);
      return;
    }

    this.form.controls.msa_id.setValue([]);
    this.form.controls.query_name.setValue("");
    this.form.controls.structure_id.setValue([]);
    this.form.controls.chain.setValue("");

    const batchName = this.form.controls.job_title.value || `Batch ${new Date().toISOString()}`;
    const batchId = this.batchJobService.createBatch(batchName);
    const observables = this.createBatchJobObservables(this.form.controls.query_sequence.value, batchId);

    forkJoin(observables)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (results) => {
          this.sb.open(`${results.length} jobs submitted successfully`, "Dismiss", { duration: 3000 });
          this.isSubmitting.set(false);
        },
        error: () => {
          this.sb.open("Failed to submit jobs", "Dismiss", { duration: 3000 });
          this.isSubmitting.set(false);
        }
      });
  }

  private createBatchJobObservables(querySequence: string, batchId: string): Observable<ConsurfJob>[] {
    const observables: Observable<ConsurfJob>[] = [];
    let sequence = "";
    let sequenceID = ">";

    for (const line of querySequence.split("\n")) {
      if (line[0] === ">") {
        if (sequence.length > 0 && sequenceID.length > 0) {
          observables.push(this.createJobObservable(sequenceID, sequence, batchId));
        }
        sequence = "";
        sequenceID = line;
      } else {
        sequence += line;
      }
    }

    if (sequence.length > 0 && sequenceID.length > 0) {
      observables.push(this.createJobObservable(sequenceID, sequence, batchId));
    }

    return observables;
  }

  private createJobObservable(sequenceID: string, sequence: string, batchId: string): Observable<ConsurfJob> {
    const payload = { ...this.form.value };
    payload.query_sequence = `${sequenceID}\n${sequence}`;
    payload.job_title = `${sequenceID.slice(1)} - ${this.form.controls.job_title.value}`;
    return this.web.submitConsurfJob(payload).pipe(
      tap(job => this.batchJobService.addJobToBatch(batchId, job.id))
    );
  }

  private submitSingleJob(): void {
    this.web.submitConsurfJob(this.form.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.status.set("pending");
          this.router.navigate([`/consurf-job/${result.id}`]).then(() => {
            this.currentTabIndex = 1;
            this.sb.open("Job submitted successfully", "Dismiss", { duration: 3000 });
            this.isSubmitting.set(false);
          });
        },
        error: () => {
          this.sb.open("Failed to submit job", "Dismiss", { duration: 3000 });
          this.isSubmitting.set(false);
        }
      });
  }

  downloadOutput(fileType: string = "zip"): void {
    if (!this.jobid) return;

    const jobID = parseInt(this.jobid);
    this.web.generateJobDownloadToken(jobID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => {
        this.web.downloadJobResults(jobID, response.token, fileType);
      });
  }

  getUniprotSequence(): void {
    const uniprotId = this.form.controls.uniprot_id.value;
    if (!uniprotId) return;

    this.isFetchingSequence.set(true);
    this.web.getUniprot(uniprotId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.uniprot = data;
          if (this.uniprot.sequence) {
            this.form.controls.query_sequence.setValue(
              `>${uniprotId}\n${this.uniprot.sequence.value}`
            );
            this.sb.open('Sequence retrieved successfully', 'Close', { duration: 2000 });
          } else {
            this.sb.open('No sequence found for this UniProt ID', 'Close', { duration: 3000 });
          }
          this.isFetchingSequence.set(false);
        },
        error: (error) => {
          this.sb.open('Failed to retrieve sequence from UniProt', 'Close', { duration: 3000 });
          this.isFetchingSequence.set(false);
        }
      });
  }

  getPDBStructure(): void {
    const uniprotId = this.form.controls.uniprot_id.value;
    if (!uniprotId) return;

    this.isFetchingStructure.set(true);
    this.web.getPDBFileFromUniProtID(uniprotId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pdbContent) => {
          this.isFetchingStructure.set(false);
          this.parsePDBFile(pdbContent);
          const chains = this.chainArray();
          
          const dialogRef = this.dialog.open(SaveStructureFileDialogComponent, {
            data: {
              suggestedName: uniprotId,
              chains: chains
            },
            width: '500px'
          });
          
          dialogRef.afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(name => {
              if (name) {
                this.savePDBFile(name, pdbContent);
              }
            });
          
          this.sb.open('PDB structure retrieved successfully', 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.isFetchingStructure.set(false);
          this.sb.open('Failed to retrieve PDB structure from UniProt', 'Close', { duration: 3000 });
        }
      });
  }

  private savePDBFile(name: string, content: string): void {
    this.web.savePDBContent(name, content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(pdbFile => {
        this.form.controls.structure_id.setValue([pdbFile.id]);
        this.form.controls.chain.setValue(pdbFile.chains[0]);
        this.form.controls.searchTermPDB.setValue(pdbFile.name);
        this.chainArray.set(pdbFile.chains.split(";"));
      });
  }

  private parsePDBFile(file: string): void {
    const chains = new Set<string>();
    
    for (const line of file.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("ATOM") || trimmed.startsWith("HETATM")) {
        const chain = line[21];
        if (chain && chain.trim()) {
          chains.add(chain);
        }
      }
    }
    
    this.chainArray.set(Array.from(chains));
  }

  clearDatabaseFile(): void {
    this.form.controls.fasta_database_id.setValue([]);
  }

  clearAlignmentFile(): void {
    this.form.controls.msa_id.setValue([]);
    this.form.controls.query_name.setValue("");
  }

  clearStructureFile(): void {
    this.form.controls.structure_id.setValue([]);
    this.form.controls.chain.setValue("");
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.currentTabIndex = event.index;
  }

  handleAlignmentClick(msa: MultipleSequenceAlignment): void {
    this.web.getAllSequenceNamesFromMSA(msa.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(names => this.sequence_names.set(names));
  }

  handleClickedJob(jobId: number): void {
    this.router.navigate([`/consurf-job/${jobId}`]).then(() => {
      this.currentTabIndex = 1;
    });
  }
}
