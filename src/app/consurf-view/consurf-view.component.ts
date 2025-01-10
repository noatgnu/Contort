import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl,Validators} from "@angular/forms";
import {DataFrame} from "data-forge";
import {debounceTime, forkJoin, map, Observable, tap} from "rxjs";
import {DataService} from "../data.service";
import {WebService} from "../web.service";
import {ConSurfGrade} from "../con-surf-data";

@Component({
    selector: 'app-consurf-view',
    templateUrl: './consurf-view.component.html',
    styleUrl: './consurf-view.component.scss',
    standalone: false
})
export class ConsurfViewComponent implements OnInit{
  @Input() set accid(value: string) {
    if (value !== "") {
      this.form.controls["term"].setValue(value)
      this.getCONSURF()
    }
  }

  grades = Object.keys(this.dataService.color_map)

  form = this.fb.group(
    {
      "term": new FormControl<string>("", Validators.required)
    }
  )

  formSegment = this.fb.group({
    cellSize: new FormControl<number>(this.dataService.segmentSettings["cell-size"], [Validators.required, Validators.min(1)]),
    marginTop: new FormControl<number>(this.dataService.segmentSettings["margin-top"], [Validators.required, Validators.min(1)]),
    marginBottom: new FormControl<number>(this.dataService.segmentSettings["margin-bottom"], [Validators.required, Validators.min(1)]),
    aaPerRow: new FormControl<number>(this.dataService.segmentSettings["number-of-aa-per-row"], [Validators.required, Validators.min(1)]),
  })
  filteredOptions: Observable<string[]> = new Observable<string[]>()

  searching: boolean = false
  retrieving: boolean = false

  constructor(public dataService: DataService, private fb: FormBuilder, private web: WebService) {
    this.dataCount = this.web.getCount()
    this.dataService.segmentSelection.subscribe((data) => {
      for (const d of data) {
        const seq = d.seq.getSeries("GRADE").toArray().map((a: ConSurfGrade) => a.SEQ).join("")
        const uniqueID = d.start+ seq + d.end
        if (!this.dataService.selectedSeqs.includes(uniqueID)) {
          this.dataService.selectedSeqs.push(uniqueID)
          for (let i = d.start; i <= d.end; i++) {
            if (!this.dataService.selectionMap[i]) {
              this.dataService.selectionMap[i] = []
            }
            this.dataService.selectionMap[i].push(uniqueID)
            this.dataService.selectionMap[i].sort((a, b) => b.length - a.length)
          }
          this.dataService.segments.push(d)
          if (!this.dataService.segmentColorMap[uniqueID]) {
            this.dataService.segmentColorMap[uniqueID] = this.dataService.defaultColorList[this.dataService.selectedSeqs.length % this.dataService.defaultColorList.length]
          }
        }

      }
      this.dataService.redrawSubject.next(true)
    })

  }

  dataCount: Observable<number>|undefined = undefined

  ngOnInit(): void {
    this.form.controls["term"].valueChanges.pipe(
      debounceTime(200),
      tap(() => this.searching = true),
      map(value => this.web.getUniprotTypeAhead(value||'')),
      tap(() => this.searching = false)
    ).subscribe((data) => {
      this.filteredOptions = data
    })
  }

  triggerUpdate() {
    if (this.formSegment.valid) {
      this.dataService.segmentSettings["cell-size"] = this.formSegment.controls["cellSize"].value
      this.dataService.segmentSettings["margin-top"] = this.formSegment.controls["marginTop"].value
      this.dataService.segmentSettings["margin-bottom"] = this.formSegment.controls["marginBottom"].value
      if (this.dataService.segmentSettings["number-of-aa-per-row"] !== this.formSegment.controls["aaPerRow"].value) {
        this.dataService.segmentSettings["number-of-aa-per-row"] = this.formSegment.controls["aaPerRow"].value
        this.dataService.aaPerRowSubject.next(true)
      }
      this.dataService.redrawSubject.next(true)
    }

  }

  getCONSURF() {
    if (this.form.value.term &&this.form.value.term !== "") {
      this.retrieving = true
      forkJoin([this.web.getConsurfGrade(this.form.value.term), this.web.getConsurfMSAVar(this.form.value.term)]).subscribe((data) => {
        const grades = data[0]
        const msaVar = data[1]
        this.dataService.dataMSA = new DataFrame(msaVar)
        this.dataService.dataGrade = new DataFrame(grades)


        this.dataService.combinedData = this.dataService.dataGrade.join(
          this.dataService.dataMSA,
          row => row.POS,
          row => row.pos,
          (left, right) => {
            return {
              MSA: right,
              GRADE: left
            }
          }).bake()
        this.dataService.displayData = this.dataService.combinedData
        this.dataService.redrawSubject.next(true)
        this.retrieving = false
      }, (error) => {

        this.retrieving = false
      })
    }

  }

  handleFilterRange(event: {start: number, end: number}) {
    this.dataService.displayData = this.dataService.combinedData.between(event.start-1, event.end-1).resetIndex().bake()
  }

  downloadMSA() {
    const a = document.createElement('a')
    a.href = `${this.web.baseUrl}/api/consurf/files/msa/${this.form.value.term}`
    a.download = `${this.form.value.term}.phy`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

  }
}
