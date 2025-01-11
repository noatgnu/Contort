import {Component, Input} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {WebService} from "../web.service";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatCheckbox} from "@angular/material/checkbox";
import {ProteinFastaDatabaseQuery} from "../protein-fasta-database";
import {MatListOption, MatSelectionList} from "@angular/material/list";
import {MatPaginator} from "@angular/material/paginator";
import {MatButton} from "@angular/material/button";
import {AppModule} from "../app.module";

@Component({
  selector: 'app-consurf-job',
  templateUrl: './consurf-job.component.html',
  styleUrl: './consurf-job.component.scss',
  standalone: false,
})
export class ConsurfJobComponent {
  private _jobid: string = ""
  status: string = "unsubmitted"

  @Input() set jobid(value: string) {
    this._jobid = value
    if (value) {
      this.web.getConsurfJob(parseInt(value)).subscribe((value) => {
        this.form.controls.query_sequence.setValue(value.query_sequence)
        this.form.controls.alignment_program.setValue(value.alignment_program)
        // @ts-ignore
        this.form.controls.fasta_database_id.setValue([value.fasta_database])
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
    query_sequence: ['', Validators.required],
    alignment_program: ['MAFFT', Validators.required],
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
    email_notification: [false]
  })

  page = 1
  limit = 10

  proteinDatabaseQuery: ProteinFastaDatabaseQuery|undefined = undefined

  constructor(private fb: FormBuilder, private web: WebService) {
    this.web.getProteinFastaDatabases(this.limit, this.page).subscribe((value) => {
      this.proteinDatabaseQuery = value
    })

    this.form.controls.searchTerm.valueChanges.subscribe((value) => {
      if (value) {
        this.web.getProteinFastaDatabases(this.limit, this.page, value).subscribe((value) => {
          this.proteinDatabaseQuery = value
        })
      }
    })
  }

  onPageChange(event: any) {
    this.page = event.pageIndex
    this.limit = event.pageSize
    let term = ""
    if (this.form.controls.searchTerm.value) {
      term = this.form.controls.searchTerm.value
    }
    this.web.getProteinFastaDatabases(this.limit, this.page, term).subscribe((value) => {
      this.proteinDatabaseQuery = value
    })
  }

  submit() {
    if (this.form.invalid) {
      return
    }
    this.web.submitConsurfJob(this.form.value).subscribe((value) => {
      console.log(value)
    })
  }

  downloadOutput(file_type: string = "zip") {
    if (this.jobid) {
      const jobID = parseInt(this.jobid)
      this.web.generateJobDownloadToken(jobID).subscribe((value) => {
        this.web.downloadJobResults(jobID, value.token, file_type)
      })
    }

  }

}
