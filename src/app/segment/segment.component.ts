import {Component, EventEmitter, Input, Output, effect} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {ConSurfData, ConSurfGrade, ConSurfMSAVar} from "../con-surf-data";
import {DataService} from "../data.service";
import {ThemeService} from "../theme.service";

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
    toImageButtonOptions: {
      format: 'svg',
      scale: 1
    }
  }

  graphData: any[] = []
  graphLayout: any = {}

  private getThemedLayout() {
    const isDark = this.themeService.isDark();
    const textColor = isDark ? '#e0e0e0' : '#333333';
    const bgColor = isDark ? 'transparent' : 'transparent';

    return {
      margin: {
        l: 0,
        r: 0,
        b: 40,
        t: 0,
      },
      height: 120,
      width: 50,
      paper_bgcolor: bgColor,
      plot_bgcolor: bgColor,
      font: {
        color: textColor,
        size: 10
      },
      xaxis: {
        title: '',
        type: 'category',
        tickmode: 'array',
        showticklabels: true,
        tickvals: [],
        tickangle: 0,
        fixedrange: true,
        color: textColor,
        tickfont: {
          size: 9
        }
      },
      yaxis: {
        title: '',
        type: 'category',
        tickmode: 'array',
        showticklabels: false,
        fixedrange: true,
        color: textColor
      },
      shapes: [],
      annotations: [],
    };
  }

  revision = 0
  constructor(private dataService: DataService, private themeService: ThemeService) {
    this.graphLayout = this.getThemedLayout();

    effect(() => {
      this.themeService.isDark();
      const currentLayout = this.graphLayout;
      const themedLayout = this.getThemedLayout();
      this.graphLayout = {
        ...themedLayout,
        width: currentLayout.width,
        height: currentLayout.height,
        margin: currentLayout.margin,
        shapes: currentLayout.shapes,
        annotations: currentLayout.annotations,
        xaxis: {
          ...themedLayout.xaxis,
          tickvals: currentLayout.xaxis?.tickvals || []
        }
      };
      this.revision++;
    });

    this.dataService.redrawSubject.subscribe((data) => {
      this.drawHeatmap()
    })
  }

  drawHeatmap() {
    const isDark = this.themeService.isDark();
    const annotationColor = isDark ? '#e0e0e0' : '#333333';

    const cellSize = this.dataService.segmentSettings["cell-size"]
    const marginBottom = this.dataService.segmentSettings["margin-bottom"] || 40
    const marginTop = this.dataService.segmentSettings["margin-top"] || 0

    this.graphLayout.margin.b = marginBottom
    this.graphLayout.margin.t = marginTop
    this.graphLayout.width = cellSize
    this.graphLayout.height = cellSize + marginBottom + marginTop
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
    const tickvals: number[] = []
    const ticktext: string[] = []
    this.segment.seq.forEach((row, index) => {
      temp.x.push(row.GRADE.POS)
      if (this.dataService.customScore[row.GRADE.POS]) {
        temp.z[0].push(this.dataService.customScore[row.GRADE.POS])
      } else {
        temp.z[0].push(row.GRADE.COLOR[0])
      }
      temp.text[0].push(row.GRADE.SEQ)
      if (index === 0 || index === this.segment.seq.count() - 1 || row.GRADE.POS % 10 === 0) {
        tickvals.push(index)
        ticktext.push(row.GRADE.POS.toString())
      }
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
      if (annotationText !== "") {
        annotations.push({
          xref: 'x',
          yref: 'paper',
          x: current,
          y: -0.6,
          text: annotationText,
          showarrow: false,
          font: {
            family: 'Arial',
            size: 12,
            color: annotationColor
          }
        })
      }

      if (this.dataService.selectionMap[row.GRADE.POS]) {
        for (const seq of this.dataService.selectionMap[row.GRADE.POS]) {
          const x0 = current - 0.5
          const x1 = current + 0.5
          shapes.push({
            type: 'line',
            yref: 'paper',
            xref: 'x',
            x0: x0,
            x1: x1,
            y0: -0.15,
            y1: -0.15,
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
    this.graphLayout.width = temp.x.length * cellSize
    this.graphLayout.height = cellSize + marginBottom + marginTop

    this.graphLayout.xaxis.tickvals = tickvals
    this.graphLayout.xaxis.ticktext = ticktext
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
