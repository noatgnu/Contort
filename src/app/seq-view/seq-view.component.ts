import {Component, Input} from '@angular/core';
import {ConSurfData, ConSurfGrade, ConSurfMSAVar} from "../con-surf-data";
import {DataService} from "../data.service";
import {DataFrame, IDataFrame} from "data-forge";

@Component({
    selector: 'app-seq-view',
    templateUrl: './seq-view.component.html',
    styleUrls: ['./seq-view.component.sass'],
    standalone: false
})
export class SeqViewComponent {
  private _data: IDataFrame<number, ConSurfData> = new DataFrame()
  @Input() set data(value: IDataFrame<number, ConSurfData>) {
    this._data = value
    // break the data into segments of 50 amino acids
    this.segmentize()
  }

  get data(): IDataFrame<number, ConSurfData> {
    return this._data
  }

  segments: {start: number, end: number, seq: IDataFrame<number, ConSurfData>}[] = []
  selected: ConSurfData|undefined = undefined
  constructor(public dataService: DataService) {
    this.dataService.aaPerRowSubject.asObservable().subscribe((data) => {
      if (data) {
        this.segmentize()
      }
    })
  }

  handleSelection(data: ConSurfData) {
    this.selected = data
  }

  segmentize() {
    const segments = []
    const segmentSize = this.dataService.segmentSettings["number-of-aa-per-row"]
    const segmentCount = Math.ceil(this.data.count() / segmentSize)
    for (let i = 0; i < segmentCount; i++) {
      const start = i*segmentSize
      const end = Math.min((i+1) * segmentSize, this.data.count())
      const seq = this.data.between(start, end-1)
      segments.push({start: start, end: end, seq: seq})
    }
    this.segments = segments
  }
}
