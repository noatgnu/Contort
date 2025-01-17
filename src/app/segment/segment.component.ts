import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {ConSurfData, ConSurfGrade, ConSurfMSAVar} from "../con-surf-data";
import {DataService} from "../data.service";

@Component({
    selector: 'app-segment',
    templateUrl: './segment.component.html',
    styleUrls: ['./segment.component.scss'],
    standalone: false
})
export class SegmentComponent {
  segment: {start: number, end: number, seq: IDataFrame<number, ConSurfData>} = {start: 0, end: 0, seq: new DataFrame()}
  @Input() set data(value: {start: number, end: number, seq: IDataFrame<number, ConSurfData>}) {
    this.segment = value
    this.drawHeatmap()
  }
  @Output() selectedData: EventEmitter<ConSurfData> = new EventEmitter<ConSurfData>()
  config: any = {
    //modeBarButtonsToRemove: ["toImage"]
    toImageButtonOptions: {
      format: 'svg',
      scale: 1
    }
  }

  graphData: any[] = []
  graphLayout: any = {
    margin: {
      l: 0,
      r: 0,
      b: 20,
      t: 0,
    },
    height: 120,
    width: 50,
    xaxis: {
      title: '',
      type: 'category',
      tickmode: 'array',
      showticklabels: true,
      tickvals: [],
      ticktext: [],
      fixedrange: true,
    },
    yaxis: {
      title: '',
      type: 'category',
      tickmode: 'array',
      fixedrange: true,
    },
    shapes: [],
    annotations: [],
  }
  revision = 0
  constructor(private dataService: DataService) {
    this.dataService.redrawSubject.subscribe((data) => {
      this.drawHeatmap()
    })
  }

  drawHeatmap() {
    this.graphLayout.margin.b = this.dataService.segmentSettings["margin-bottom"]
    this.graphLayout.margin.t = this.dataService.segmentSettings["margin-top"]
    this.graphLayout.width = this.dataService.segmentSettings["cell-size"]
    this.graphLayout.height = this.dataService.segmentSettings["cell-size"] + this.dataService.segmentSettings["margin-bottom"] + this.dataService.segmentSettings["margin-top"]
    // draw sequence using heatmap plotly with colors from the ConSurf Grade column
    const graphData: any[] = []
    const annotations: any[] = []
    const temp: any = {
      x: [],
      y: [1],
      z: [[]],
      text: [[]],
      data: [],
      textposition: 'middle center',
      texttemplate: '%{text}',
      hovertemplate: 'Position: %{x}<br>Grade: %{z}<extra></extra>',
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
    const shapes: any[] = []
    this.segment.seq.forEach((row) => {
      temp.x.push(row.GRADE.POS)
      if (this.dataService.customScore[row.GRADE.POS]) {
        temp.z[0].push(this.dataService.customScore[row.GRADE.POS])
      } else {
        temp.z[0].push(row.GRADE.COLOR[0])
      }
      temp.text[0].push(row.GRADE.SEQ)
      ticks.push(row.GRADE.POS)
      temp.data.push(row)

    })
    //this.graphLayout.title = `${this.segment.start}-${temp.text[0].join("")}-${this.segment.end}`
    graphData.push(temp)
    //draw a line under the square that has been selected
    const total = this.segment.seq.count()
    let current = 0
    this.segment.seq.forEach((row) => {
      let annotationText = ""
      if (row.GRADE.COLOR.length > 1) {
        annotationText += "*"
      }
      if (row.GRADE.FUNCTION !== "") {
        annotationText += row.GRADE.FUNCTION
      }
      if (row.GRADE.BE !== "") {
        annotationText += row.GRADE.BE
      }
      const xloc = 1/total * current
      if (annotationText !== "") {
        annotations.push({
          xref: 'paper',
          yref: 'paper',
          x: xloc + 1/total/2,
          y: -1.5,
          text: annotationText,
          showarrow: false,
          font: {
            family: 'Arial',
            size: 12,
            color: "black"
          }
        })
      }

      if (this.dataService.selectionMap[row.GRADE.POS]) {
        for (const seq of this.dataService.selectionMap[row.GRADE.POS]) {
          const x0Paper = xloc
          const x1Paper = xloc + 1/total
          shapes.push({
            type: 'line',
            yref: 'paper',
            xref: 'paper',
            x0: x0Paper,
            x1: x1Paper,
            y0: -1,
            y1: -1,
            line: {
              color: this.dataService.segmentColorMap[seq],
              width: 2,
            }
          })
        }
      }
      current++
    })

    this.graphData = graphData
    this.graphLayout.width = temp.x.length * this.dataService.segmentSettings["cell-size"]
    //this.graphLayout.xaxis.tickvals =[ticks[0], ticks[Math.round(ticks.length/2)], ticks[ticks.length-1]]
    this.graphLayout.xaxis.tickvals = ticks.filter((_, index) => index % 5 === 0 || index === ticks.length-1);
    this.graphLayout.annotations = annotations
    this.graphLayout.shapes = shapes
    this.revision++
  }

  handleSelection(event: any) {
    if (event.points[0].pointIndex) {
      const data = event.points[0].data.data[event.points[0].pointIndex[1]]
      this.selectedData.emit(data)
    }

  }
}
