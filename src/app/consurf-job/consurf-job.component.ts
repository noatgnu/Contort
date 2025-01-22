import {Component, Input} from '@angular/core';
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
import {forkJoin, Observable} from "rxjs";
import {ConsurfJob} from "../consurf-job";
import {AccountService} from "../account.service";

@Component({
  selector: 'app-consurf-job',
  templateUrl: './consurf-job.component.html',
  styleUrl: './consurf-job.component.scss',
  standalone: false,
})
export class ConsurfJobComponent {
  private _jobid: string = ""
  status: string = "unsubmitted"
  log_data: string = ""
  error_data: string = ""
  uniprot: any = {}

  chainArray: string[] = []
  currentTabIndex: number = 0
  sequence_names: string[] = []

  @Input() set jobid(value: string) {
    this._jobid = value
    if (value) {
      this.currentTabIndex = 1
      this.web.getConsurfJob(parseInt(value)).subscribe((value) => {
        this.form.controls.query_sequence.setValue(value.query_sequence)
        if (value.query_sequence) {
          this.numberOfSequences = value.query_sequence.split("\n").filter((a) => a[0] === ">").length
        }
        this.form.controls.alignment_program.setValue(value.alignment_program)
        // @ts-ignore
        this.form.controls.fasta_database_id.setValue([value.fasta_database])
        // @ts-ignore
        this.form.controls.msa_id.setValue([value.msa])
        if (value.msa) {
          this.web.getAllSequenceNamesFromMSA(value.msa).subscribe((value) => {
            this.sequence_names = value
          })
        }
        this.form.controls.query_name.setValue(value.query_name)
        // @ts-ignore
        this.form.controls.structure_id.setValue([value.structure_file])
        this.form.controls.max_homologs.setValue(value.max_homologs)
        this.form.controls.closest.setValue(value.closest)
        this.form.controls.max_id.setValue(value.max_id)
        this.form.controls.min_id.setValue(value.min_id)
        this.form.controls.maximum_likelihood.setValue(value.maximum_likelihood)
        this.form.controls.algorithm.setValue(value.algorithm)
        this.form.controls.job_title.setValue(value.job_title)
        this.form.controls.model.setValue(value.substitution_model)
        this.form.controls.iterations.setValue(value.max_iterations)
        this.form.controls.cutoff.setValue(value.cutoff)
        this.form.controls.email_notification.setValue(value.email_notification)
        this.form.controls.uniprot_id.setValue(value.uniprot_accession)
        this.log_data = value.log_data
        this.error_data = value.error_data
        this.status = value.status
      })
    }
  }

  get jobid(): string {
    return this._jobid
  }

  model_options = ["BEST", "JTT", "LG", "mtREV", "cpREV", "WAG", "Dayhoff"]
  alignment_options = ["MAFFT", "CLUSTALW", "PRANK", "MUSCLE"]
  algorithm_options = ["HMMER", "BLAST", "MMseqs2"]
  form = this.fb.group({
    uniprot_id: [''],
    query_sequence: ['', Validators.required],
    alignment_program: ['MAFFT'],
    fasta_database_id: ["", Validators.required],
    model: ["BEST", Validators.required],
    iterations: [1, Validators.required],
    cutoff: [0.0001, Validators.required],
    max_homologs: [150, Validators.required],
    closest: [false],
    max_id: [95, Validators.required],
    min_id: [35, Validators.required],
    maximum_likelihood: [false],
    algorithm: ["HMMER", Validators.required],
    job_title: ["", Validators.required],
    searchTerm: [""],
    searchTermPDB: [""],
    searchTermMSA: [""],
    email_notification: [false],
    structure_id: [""],
    chain: [""],
    msa_id: [""],
    query_name: [""]
  })

  page = 1
  limit = 10
  msaPage = 1
  msaLimit = 10
  pdbPage = 1
  pdbLimit = 10

  proteinDatabaseQuery: ProteinFastaDatabaseQuery|undefined = undefined
  msaQuery: MultipleSequenceAlignmentQuery|undefined = undefined
  structureQuery: StructureFileQuery|undefined = undefined
  numberOfSequences: number = 0

  constructor(private sb: MatSnackBar, private websocket: WebsocketService, private router: Router, private fb: FormBuilder, private web: WebService, private dialog: MatDialog, public accountService: AccountService) {
    this.websocket.jobMessage.subscribe((value) => {
      if (value.job_id === parseInt(this.jobid)) {
        this.status = value.status
        this.web.getConsurfJob(parseInt(this.jobid)).subscribe((value) => {
          this.log_data = value.log_data
          this.error_data = value.error_data
          this.status = value.status
        })
      }
    })

    this.form.controls.query_sequence.valueChanges.subscribe((value) => {
      if (value) {
        this.numberOfSequences = value.split("\n").filter((a) => a[0] === ">").length
      }
    })

    this.web.getProteinFastaDatabases(this.limit, this.page).subscribe((value) => {
      this.proteinDatabaseQuery = value
    })
    this.web.getMSAs(this.msaLimit, this.msaPage).subscribe((value) => {
      this.msaQuery = value
    })
    this.web.getStructures(this.pdbLimit, this.pdbPage).subscribe((value) => {
      this.structureQuery = value
    })

    this.form.controls.searchTerm.valueChanges.subscribe((value) => {
      if (value) {
        this.web.getProteinFastaDatabases(this.limit, this.page, value).subscribe((value) => {
          this.proteinDatabaseQuery = value
        })
      }
    })
    this.form.controls.searchTermMSA.valueChanges.subscribe((value) => {
      if (value) {
        this.web.getMSAs(this.msaLimit, this.msaPage, value).subscribe((value) => {
          this.msaQuery = value
        })
      }
    })
    this.form.controls.searchTermPDB.valueChanges.subscribe((value) => {
      if (value) {
        this.web.getStructures(this.pdbLimit, this.pdbPage, value).subscribe((value) => {
          this.structureQuery = value
        })
      }
    })
  }

  onPageChange(event: any, type: string) {
    this.page = event.pageIndex
    this.limit = event.pageSize
    let term = ""
    if (type === "database") {
      if (this.form.controls.searchTerm.value) {
        term = this.form.controls.searchTerm.value
      }
      this.web.getProteinFastaDatabases(this.limit, this.page, term).subscribe((value) => {
        this.proteinDatabaseQuery = value
      })
    } else if (type === "msa") {
      if (this.form.controls.searchTermMSA.value) {
        term = this.form.controls.searchTermMSA.value
      }
      this.web.getMSAs(this.limit, this.page, term).subscribe((value) => {
        this.msaQuery = value
      })
    } else if (type === "structure") {
      if (this.form.controls.searchTermPDB.value) {
        term = this.form.controls.searchTermPDB.value
      }
      this.web.getStructures(this.limit, this.page, term).subscribe((value) => {
        this.structureQuery = value
      })
    }

  }

  submit() {
    if (this.form.invalid) {
      this.sb.open("Form is invalid", "Dismiss")
      return
    }
    if (this.numberOfSequences > 1) {

      if (this.form.controls.query_sequence.value) {
        let sequence = ""
        let sequenceID = ">"
        let observable: Observable<ConsurfJob>[] = []
        for (const line of this.form.controls.query_sequence.value.split("\n")) {
          if (line[0] === ">") {
            if (sequence.length > 0 && sequenceID.length > 0) {
              const payload = this.form.value
              payload.query_sequence = `${sequenceID}\n${sequence}`
              payload.job_title = `${sequenceID.slice(1)} - ${this.form.controls.job_title.value}`
              observable.push(this.web.submitConsurfJob(payload))
            }
            sequence = ""
            sequenceID = line
          } else {
            sequence += line
          }
        }
        const payload = this.form.value
        payload.query_sequence = `${sequenceID}\n${sequence}`
        payload.job_title = `${sequenceID.slice(1)} - ${this.form.controls.job_title.value}`
        observable.push(this.web.submitConsurfJob(payload))
        forkJoin(observable).subscribe((value) => {
          this.sb.open( `${value.length} Jobs submitted`, "Dismiss")
        })
      }


    } else {
      this.web.submitConsurfJob(this.form.value).subscribe((value) => {
        this.status = "pending"
        this.router.navigate([`/consurf-job/${value.id}`]).then((r) => {
          this.currentTabIndex = 1
          this.sb.open("Job submitted", "Dismiss")
        })
      })
    }
  }

  downloadOutput(file_type: string = "zip") {
    if (this.jobid) {
      const jobID = parseInt(this.jobid)
      this.web.generateJobDownloadToken(jobID).subscribe((value) => {
        this.web.downloadJobResults(jobID, value.token, file_type)
      })
    }
  }

  getUniprotSequence() {
    if (this.form.controls.uniprot_id.value) {
      this.web.getUniprot(this.form.controls.uniprot_id.value).subscribe((value) => {
        this.uniprot = value
        if (this.uniprot.sequence) {
          this.form.controls.query_sequence.setValue(`>${this.form.controls.uniprot_id.value}\n${this.uniprot.sequence.value}`)
        }
      })
    }
  }

  getPDBStructure() {
    if (this.form.controls.uniprot_id.value) {
      this.web.getPDBFileFromUniProtID(this.form.controls.uniprot_id.value).subscribe((value) => {
        this.parsePDBFile(value)
        const ref = this.dialog.open(SaveStructureFileDialogComponent)
        ref.afterClosed().subscribe((name) => {
          if (name) {
            this.web.savePDBContent(name, value).subscribe((pdbFile) => {
              // @ts-ignore
              this.form.controls.structure_id.setValue([pdbFile.id])
              this.form.controls.chain.setValue(pdbFile.chains[0])
              this.form.controls.searchTermPDB.setValue(pdbFile.name)
              this.chainArray = pdbFile.chains.split(";")
            })
          }
        })
      })
    }
  }

  parsePDBFile(file: string) {
    for (const l of file.split("\n")) {
      const line = l.trim()
      if (line.slice(0, 4) === "ATOM" || line.slice(0, 6) === "HETATM") {
        const chain = line[21]
        if (!this.chainArray.includes(chain)) {
          this.chainArray.push(chain)
        }
      }
    }
  }

  clearDatabaseFile() {
    this.form.controls.fasta_database_id.setValue("")
  }

  clearAlignmentFile() {
    this.form.controls.msa_id.setValue("")
    this.form.controls.query_name.setValue("")
  }

  clearStructureFile() {
    this.form.controls.structure_id.setValue("")
    this.form.controls.chain.setValue("")
  }

  onTabChange(event: MatTabChangeEvent) {
    console.log(event.index)
    this.currentTabIndex = event.index
  }

  handleAlignmentClick(msa: MultipleSequenceAlignment) {
    this.web.getAllSequenceNamesFromMSA(msa.id).subscribe((value) => {
      this.sequence_names = value
    })
  }

  handleClickedJob(jobId: number){
    this.router.navigate([`/consurf-job/${jobId}`]).then(
      (r) => {
        this.currentTabIndex = 1
      }
    )
  }

  batchSubmit() {

  }
}
