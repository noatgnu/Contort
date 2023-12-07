import {Component, OnInit} from '@angular/core';
import {DataFrame, fromCSV, IDataFrame} from "data-forge";
import {ConSurfGrade, ConSurfMSAVar} from "../con-surf-data";
import {DataService} from "../data.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {debounceTime, forkJoin, map, Observable, startWith, tap} from "rxjs";
import {WebService} from "../web.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit{

  handleFileImport(event: Event) {
    if (event.target) {
      const target = event.target as HTMLInputElement
      if (target.files) {
        const file = target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target) {
            const text =  <string>reader.result
            // skip 4 first line
            const lines = text.split("\n")
            lines.splice(0, 4)
            lines[0] = lines[0].replace(/\s/g, "_")
            const data = lines.join("\n")
            this.dataService.dataMSA = fromCSV(data)
          }
        }
        reader.readAsText(file)
      }
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
  constructor(public dataService: DataService, private fb: FormBuilder, private web: WebService) {
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
      console.log(this.dataService.selectionMap)
    })

  }

  ngOnInit(): void {
    this.form.controls["term"].valueChanges.pipe(
      debounceTime(200),
      map(value => this.web.getUniprotTypeAhead(value||'')),
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
      })
    }

  }

  handleFilterRange(event: {start: number, end: number}) {
    this.dataService.displayData = this.dataService.combinedData.between(event.start-1, event.end-1).resetIndex().bake()
  }
}
