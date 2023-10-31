import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {ConSurfData} from "../con-surf-data";
import {DataService} from "../data.service";

@Component({
  selector: 'app-consurf-plot',
  templateUrl: './consurf-plot.component.html',
  styleUrls: ['./consurf-plot.component.sass']
})
export class ConsurfPlotComponent {
  private _data: IDataFrame<number, ConSurfData> = new DataFrame()

  @Input() set data (value: IDataFrame<number, ConSurfData>) {
    this._data = value
    this.drawGraph()
  }

  get data(): IDataFrame<number, ConSurfData> {
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


  constructor(public dataService: DataService) {
    this.dataService.segmentSelection.subscribe((data) => {
      this.dataService.segments.push(...data)
    })
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
      temp.x.push(row.pos)
      temp.y.push(1)
      temp.text.push(row.MAX_AA[0])
      temp.marker.color.push(this.dataService.color_map[row.ConSurf_Grade])
      ticklabels.push(row.pos)
    })
    graphData.push(temp)
    this.graphData = graphData

  }

  triggerUpdate() {
    this.dataService.redrawSubject.next(true)
  }
}
