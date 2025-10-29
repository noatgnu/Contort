import {Component, Input, OnDestroy, signal} from '@angular/core';
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
import {forkJoin, Observable, Subject, debounceTime, distinctUntilChanged, takeUntil} from "rxjs";
import {ConsurfJob} from "../consurf-job";
import {AccountService} from "../account.service";

@Component({
  selector: 'app-consurf-job',
  templateUrl: './consurf-job.component.html',
  styleUrl: './consurf-job.component.scss',
  standalone: false,
})
export class ConsurfJobComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
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
  form = this.fb.group({
    uniprot_id: this.fb.control(''),
    query_sequence: this.fb.control('', Validators.required),
    alignment_program: this.fb.control('MAFFT'),
    fasta_database_id: this.fb.control<any[]>([], Validators.required),
    model: this.fb.control("BEST", Validators.required),
    iterations: this.fb.control(1, Validators.required),
    cutoff: this.fb.control(0.0001, Validators.required),
    max_homologs: this.fb.control(150, Validators.required),
    closest: this.fb.control(false),
    max_id: this.fb.control(95, Validators.required),
    min_id: this.fb.control(35, Validators.required),
    maximum_likelihood: this.fb.control(false),
    algorithm: this.fb.control("HMMER", Validators.required),
    job_title: this.fb.control("", Validators.required),
    searchTerm: this.fb.control(""),
    searchTermPDB: this.fb.control(""),
    searchTermMSA: this.fb.control(""),
    email_notification: this.fb.control(false),
    structure_id: this.fb.control<any[]>([]),
    chain: this.fb.control(""),
    msa_id: this.fb.control<any[]>([]),
    query_name: this.fb.control("")
  });

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
    public accountService: AccountService
  ) {
    this.setupWebsocketListener();
    this.setupFormListeners();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadJobData(jobId: number): void {
    this.web.getConsurfJob(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(job => {
        this.populateFormFromJob(job);
        this.log_data.set(job.log_data);
        this.error_data.set(job.error_data);
        this.status.set(job.status);
      });
  }

  private populateFormFromJob(job: any): void {
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
        .pipe(takeUntil(this.destroy$))
        .subscribe(names => this.sequence_names.set(names));
    }
  }

  private setupWebsocketListener(): void {
    this.websocket.jobMessage
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.job_id === parseInt(this.jobid)) {
          this.status.set(message.status);
          this.loadJobData(parseInt(this.jobid));
        }
      });
  }

  private setupFormListeners(): void {
    this.form.controls.query_sequence.valueChanges
      .pipe(takeUntil(this.destroy$))
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
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        const term = value || '';
        this.offset = 0;
        this.web.getProteinFastaDatabases(this.limit, this.offset, term)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.proteinDatabaseQuery = data);
      });

    this.form.controls.searchTermMSA.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        const term = value || '';
        this.msaOffset = 0;
        this.web.getMSAs(this.msaLimit, this.msaOffset, term)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.msaQuery = data);
      });

    this.form.controls.searchTermPDB.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        const term = value || '';
        this.pdbOffset = 0;
        this.web.getStructures(this.pdbLimit, this.pdbOffset, term)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.structureQuery = data);
      });
  }

  private loadInitialData(): void {
    this.web.getProteinFastaDatabases(this.limit, this.offset)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.proteinDatabaseQuery = data);

    this.web.getMSAs(this.msaLimit, this.msaOffset)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.msaQuery = data);

    this.web.getStructures(this.pdbLimit, this.pdbOffset)
      .pipe(takeUntil(this.destroy$))
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
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.proteinDatabaseQuery = data);
      },
      msa: () => {
        this.msaOffset = offset;
        this.web.getMSAs(limit, offset, term)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => this.msaQuery = data);
      },
      structure: () => {
        this.pdbOffset = offset;
        this.web.getStructures(limit, offset, term)
          .pipe(takeUntil(this.destroy$))
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
    if (this.form.invalid) {
      this.sb.open("Form is invalid", "Dismiss", { duration: 3000 });
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

  private submitBatchJobs(): void {
    if (!this.form.controls.query_sequence.value) {
      this.isSubmitting.set(false);
      return;
    }

    this.form.controls.msa_id.setValue([]);
    this.form.controls.query_name.setValue("");
    this.form.controls.structure_id.setValue([]);
    this.form.controls.chain.setValue("");

    const observables = this.createBatchJobObservables(this.form.controls.query_sequence.value);

    forkJoin(observables)
      .pipe(takeUntil(this.destroy$))
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

  private createBatchJobObservables(querySequence: string): Observable<ConsurfJob>[] {
    const observables: Observable<ConsurfJob>[] = [];
    let sequence = "";
    let sequenceID = ">";

    for (const line of querySequence.split("\n")) {
      if (line[0] === ">") {
        if (sequence.length > 0 && sequenceID.length > 0) {
          observables.push(this.createJobObservable(sequenceID, sequence));
        }
        sequence = "";
        sequenceID = line;
      } else {
        sequence += line;
      }
    }

    if (sequence.length > 0 && sequenceID.length > 0) {
      observables.push(this.createJobObservable(sequenceID, sequence));
    }

    return observables;
  }

  private createJobObservable(sequenceID: string, sequence: string): Observable<ConsurfJob> {
    const payload = { ...this.form.value };
    payload.query_sequence = `${sequenceID}\n${sequence}`;
    payload.job_title = `${sequenceID.slice(1)} - ${this.form.controls.job_title.value}`;
    return this.web.submitConsurfJob(payload);
  }

  private submitSingleJob(): void {
    this.web.submitConsurfJob(this.form.value)
      .pipe(takeUntil(this.destroy$))
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
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.web.downloadJobResults(jobID, response.token, fileType);
      });
  }

  getUniprotSequence(): void {
    const uniprotId = this.form.controls.uniprot_id.value;
    if (!uniprotId) return;

    this.web.getUniprot(uniprotId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.uniprot = data;
        if (this.uniprot.sequence) {
          this.form.controls.query_sequence.setValue(
            `>${uniprotId}\n${this.uniprot.sequence.value}`
          );
        }
      });
  }

  getPDBStructure(): void {
    const uniprotId = this.form.controls.uniprot_id.value;
    if (!uniprotId) return;

    this.web.getPDBFileFromUniProtID(uniprotId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(pdbContent => {
        this.parsePDBFile(pdbContent);
        const dialogRef = this.dialog.open(SaveStructureFileDialogComponent);
        
        dialogRef.afterClosed()
          .pipe(takeUntil(this.destroy$))
          .subscribe(name => {
            if (name) {
              this.savePDBFile(name, pdbContent);
            }
          });
      });
  }

  private savePDBFile(name: string, content: string): void {
    this.web.savePDBContent(name, content)
      .pipe(takeUntil(this.destroy$))
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
      .pipe(takeUntil(this.destroy$))
      .subscribe(names => this.sequence_names.set(names));
  }

  handleClickedJob(jobId: number): void {
    this.router.navigate([`/consurf-job/${jobId}`]).then(() => {
      this.currentTabIndex = 1;
    });
  }
}
