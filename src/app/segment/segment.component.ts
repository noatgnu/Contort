import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {ConSurfData} from "../con-surf-data";
import {DataService} from "../data.service";

@Component({
  selector: 'app-segment',
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.sass']
})
export class SegmentComponent {
  segment: {start: number, end: number, seq: IDataFrame<number, ConSurfData>} = {start: 0, end: 0, seq: new DataFrame()}
  @Input() set data(value: {start: number, end: number, seq: IDataFrame<number, ConSurfData>}) {
    this.segment = value
    this.drawHeatmap()
  }

  graphData: any[] = []
  graphLayout: any = {
    margin: {
      l: 0,
      r: 0,
      b: 20,
      t: 50,
    },
    height: 120,
    width: 50,
    xaxis: {
      title: '',
      type: 'category',
      tickmode: 'array',
      showticklabels: true,
      tickvals: [],
      fixedrange: true,
    },
    yaxis: {
      title: '',
      type: 'category',
      tickmode: 'array',
      fixedrange: true,
    }
  }

  constructor(private dataService: DataService) {
    this.dataService.redrawSubject.subscribe((data) => {
      this.drawHeatmap()
    })
  }

  drawHeatmap() {
    console.log(this.segment)
    // draw sequence using heatmap plotly with colors from the ConSurf Grade column
    const graphData: any[] = []
    const temp: any = {
      x: [],
      y: [1],
      z: [[]],
      text: [[]],
      textposition: 'middle center',
      texttemplate: '%{text}',
      type: 'heatmap',
      colorscale: [],
      xgap: 1,
      ygap: 1,
      showscale: false,
      zmin: 1,
      zmax: 9,
      font: {
        family: 'Arial',
        size: 12,
        color: "black"
      }
    }
    for (const c in this.dataService.color_map) {
      temp.colorscale.push([(parseInt(c)-1)/(9-1), this.dataService.color_map[c]])
    }
    const ticks: number[] = []
    this.segment.seq.forEach((row) => {
      temp.x.push(row.pos)
      temp.z[0].push(row.ConSurf_Grade)
      temp.text[0].push(row.MAX_AA[0])
      ticks.push(row.pos)
    })
    this.graphLayout.title = `${this.segment.start}-${temp.text[0].join("")}-${this.segment.end}`
    graphData.push(temp)
    this.graphData = graphData
    this.graphLayout.width = temp.x.length * 50
    this.graphLayout.xaxis.tickvals = ticks
  }
}
