import {Component, Input} from '@angular/core';
import {ConSurfData, ConSurfGrade, ConSurfMSAVar} from "../con-surf-data";
import {DataService} from "../data.service";
import {DataFrame, IDataFrame} from "data-forge";

@Component({
  selector: 'app-seq-view',
  templateUrl: './seq-view.component.html',
  styleUrls: ['./seq-view.component.sass']
})
export class SeqViewComponent {
  private _data: IDataFrame<number, ConSurfData> = new DataFrame()
  @Input() set data(value: IDataFrame<number, ConSurfData>) {
    this._data = value
    console.log(value)
    // break the data into segments of 50 amino acids
    const segments = []
    const segmentSize = 50
    const segmentCount = Math.ceil(this.data.count() / segmentSize)
    for (let i = 0; i < segmentCount; i++) {
      const start = i*segmentSize
      const end = Math.min((i+1) * segmentSize, this.data.count())
      const seq = this.data.between(start, end-1)
      segments.push({start: start, end: end, seq: seq})
    }
    this.segments = segments
    console.log(this.segments)
  }

  get data(): IDataFrame<number, ConSurfData> {
    return this._data
  }

  segments: {start: number, end: number, seq: IDataFrame<number, ConSurfData>}[] = []
  selected: ConSurfData|undefined = undefined
  constructor(public dataService: DataService) {

  }

  handleSelection(data: ConSurfData) {
    this.selected = data
  }
}
