import {Component, OnInit, inject, DestroyRef, signal} from '@angular/core';
import {DataFrame, fromCSV, IDataFrame} from "data-forge";
import {ConSurfGrade, ConSurfMSAVar} from "../con-surf-data";
import {DataService} from "../data.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {debounceTime, forkJoin, switchMap, startWith, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {WebService} from "../web.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  handleFileImport(event: Event) {
    if (event.target) {
      const target = event.target as HTMLInputElement
      if (target.files) {
        const file = target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target) {
            const text =  <string>reader.result
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
  filteredOptions = signal<string[]>([])

  constructor(public dataService: DataService, private fb: FormBuilder, private web: WebService) {
    this.dataService.segmentSelection
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        for (const d of data) {
          const seq = d.seq.getSeries("GRADE").toArray().map((a: ConSurfGrade) => a.SEQ).join("")
          const uniqueID = d.start + seq + d.end
          if (!this.dataService.selectedSeqs.includes(uniqueID)) {
            this.dataService.addSelectedSeq(uniqueID)
            for (let i = d.start; i <= d.end; i++) {
              const currentMap = this.dataService.selectionMap[i] || []
              const newMap = [...currentMap, uniqueID].sort((a, b) => b.length - a.length)
              this.dataService.updateSelectionMap(i.toString(), newMap)
            }
            this.dataService.addSegment(d)
            if (!this.dataService.segmentColorMap[uniqueID]) {
              this.dataService.updateSegmentColorMap(
                uniqueID,
                this.dataService.defaultColorList[this.dataService.selectedSeqs.length % this.dataService.defaultColorList.length]
              )
            }
          }
        }
        this.dataService.redrawSubject.next(true)
      })
  }

  ngOnInit(): void {
    this.form.controls["term"].valueChanges.pipe(
      debounceTime(200),
      switchMap(value => this.web.getUniprotTypeAhead(value || '')),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((data) => {
      this.filteredOptions.set(data)
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
