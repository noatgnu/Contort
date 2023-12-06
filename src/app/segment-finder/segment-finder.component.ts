import {Component, Input} from '@angular/core';
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {DataFrame, IDataFrame} from "data-forge";
import {ConSurfData, ConSurfGrade, ConSurfMSAVar} from "../con-surf-data";
import {DataService} from "../data.service";

@Component({
  selector: 'app-segment-finder',
  templateUrl: './segment-finder.component.html',
  styleUrls: ['./segment-finder.component.sass']
})
export class SegmentFinderComponent {
  private _data: IDataFrame<number, ConSurfData> = new DataFrame()
  @Input() set data(value: IDataFrame<number, ConSurfData>) {
    this.sequence = value.getSeries("GRADE").bake().toArray().map((a: ConSurfGrade) => a.SEQ).join("")
    this._data = value
  }

  sequence: string = ""

  formSequence = this.fb.group({
    sequence: new FormControl<string>("", Validators.required)
  })
  formStartEnd = this.fb.group({
    start: new FormControl<number>(1, Validators.min(1)),
    end: new FormControl<number>(1, Validators.min(1))
  })

  constructor(private fb: FormBuilder, private dataService: DataService) {
  }

  searchSequence() {
    if (this.formSequence.valid) {
      const sequence = this.formSequence.controls['sequence'].value
      if (sequence) {
        const regex = new RegExp(sequence, "g")
        const matches: {start: number, end: number, seq: IDataFrame<number, ConSurfData>}[] = []
        let match: any
        while ((match = regex.exec(this.sequence)) != null) {
          const exist = this.dataService.segments.filter((s) => {
            return s.start === match.index && s.end === match.index + sequence.length
          })
          if (exist.length > 0) {
            continue
          }
          const seq = this._data.where((row) => {
            return row.GRADE.POS >= match.index && row.GRADE.POS < match.index + sequence.length
          }).bake()
          matches.push({start: match.index + 1, end: match.index + sequence.length, seq: seq})
        }
        if (matches.length > 0) {
          this.dataService.segmentSelection.next(matches)
        }
      }
    }
  }

  searchStartEnd() {
    if (this.formStartEnd.valid) {
      const start = this.formStartEnd.controls['start'].value
      const end = this.formStartEnd.controls['end'].value
      if (start && end) {
        if (end <= this.sequence.length) {
          const exist = this.dataService.segments.filter((s) => {
            return s.start ===  start-1 && s.end === end
          })
          if (exist.length === 0) {
            const seq = this._data.where((row) => {
              return row.GRADE.POS >= start && row.GRADE.POS <= end
            }).bake()
            this.dataService.segmentSelection.next([{start: start, end: end, seq: seq}])
          }
        }
      }
    }

  }
}
