import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {ConSurfGrade, ConSurfMSAVar} from "../con-surf-data";
import {DataService} from "../data.service";

@Component({
    selector: 'app-consurf-plot',
    templateUrl: './consurf-plot.component.html',
    styleUrls: ['./consurf-plot.component.sass'],
    standalone: false
})
export class ConsurfPlotComponent {
  private _data: IDataFrame<number, ConSurfGrade> = new DataFrame()

  @Input() set data (value: IDataFrame<number, ConSurfGrade>) {
    this._data = value
    this.drawGraph()
  }

  get data(): IDataFrame<number, ConSurfGrade> {
    return this._data
  }

  graphData: any[] = []
  graphLayout: any = {
    margin: {
      l: 0,
      r: 0,
      b: 100,
      t: 0,
    },
    title: "",
    autosize: true,
    height: 400,
    hovermode: false,
    xaxis: {
      title: "Position",
      type: "category",
      tickmode: "array",
      rangeslider: {},
    },
    yaxis: {
      title: "",
      showticklabels: false,
      range: [0,1],
      fixedrange: true,
    }
  }


  grades = Object.keys(this.dataService.color_map)

  @Output() filterRange: EventEmitter<{start: number, end: number}> = new EventEmitter<{start: number, end: number}>()
  constructor(public dataService: DataService) {

    this.dataService.redrawSubject.subscribe((data) => {
      this.drawGraph()
    })
  }

  drawGraph() {
    // draw barchart where each bar is a position of the protein from the pos column in data and the color is from the ConSurf Grade column from data
    // the x axis should be the position and the y axis can be the ConSurf Grade or fixed to a single height indepedent of the ConSurf Grade

    const graphData: any[] = []
    const temp: any = {
      x: [],
      y: [],
      text: [],
      mode: 'markers',
      type: 'bar',
      marker: {
        color: []
      }
    }
    const ticklabels: number[] = []
    this.data.forEach((row) => {
      temp.x.push(row.POS)
      temp.y.push(1)
      temp.text.push(row.SEQ)
      temp.marker.color.push(this.dataService.color_map[row.COLOR[0]])
      ticklabels.push(row.POS)
    })
    graphData.push(temp)
    this.graphData = graphData

  }
  handleRelayout(event: any) {
    console.log(event)
    if (event["xaxis.range[0]"] && event["xaxis.range[1]"]) {
      this.filterRange.emit({start: Math.ceil(event["xaxis.range[0]"]+1), end: Math.ceil(event["xaxis.range[1]"])})
    } else if (event["xaxis.range"]) {
      this.filterRange.emit({start: Math.ceil(event["xaxis.range"][0]+1), end: Math.ceil(event["xaxis.range"][1])})
    } else if (event["xaxis.autorange"]) {
      this.filterRange.emit({start: 1, end: this.data.count()})
    }
  }

}
