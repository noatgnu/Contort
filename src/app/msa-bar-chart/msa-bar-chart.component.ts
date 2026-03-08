import {Component, Input, effect} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {ConSurfMSAVar} from "../con-surf-data";
import {DataService} from "../data.service";
import {PlotlyModule} from "angular-plotly.js";
import {ThemeService} from "../theme.service";

@Component({
    selector: 'app-msa-bar-chart',
    imports: [
        PlotlyModule
    ],
    templateUrl: './msa-bar-chart.component.html',
    styleUrl: './msa-bar-chart.component.scss'
})
export class MsaBarChartComponent {
  private _data: ConSurfMSAVar = {
    A: 0,
    C: 0,
    ConSurf_Grade: "",
    D: 0,
    E: 0,
    F: 0,
    G: 0,
    H: 0,
    I: 0,
    K: 0,
    L: 0,
    M: 0,
    MAX_AA: "",
    N: 0,
    OTHER: 0,
    P: 0,
    Q: 0,
    R: 0,
    S: 0,
    T: 0,
    V: 0,
    W: 0,
    Y: 0,
    pos: 0
  }
  @Input() set data(value: ConSurfMSAVar) {
    this._data = value
    this.drawGraph()
  }
  get data(): ConSurfMSAVar {
    return this._data
  }

  graphData: any[] = []
  graphLayout: any = {}

  private getThemedLayout() {
    const isDark = this.themeService.isDark();
    const textColor = isDark ? '#e0e0e0' : '#333333';
    const bgColor = isDark ? 'transparent' : 'transparent';
    const gridColor = isDark ? '#444444' : '#e0e0e0';

    return {
      paper_bgcolor: bgColor,
      plot_bgcolor: bgColor,
      font: {
        color: textColor
      },
      xaxis: {
        title: "Amino Acid",
        type: "category",
        tickmode: "array",
        color: textColor,
        gridcolor: gridColor
      },
      yaxis: {
        title: "Proportion",
        range: [0, 100],
        color: textColor,
        gridcolor: gridColor
      },
    };
  }

  aminoAcids = "ACDEFGHIKLMNPQRSTVWY"
  revision = 0
  constructor(private dataService: DataService, private themeService: ThemeService) {
    this.graphLayout = this.getThemedLayout();

    effect(() => {
      this.themeService.isDark();
      this.graphLayout = {...this.getThemedLayout(), title: this.graphLayout.title};
      this.revision++;
    });
  }

  drawGraph() {
    const temp: any = {
      x: [],
      y: [],
      name: "MSA",
      type: "bar",
      marker: {
        color: this.dataService.defaultColorList[0]
      }
    }


    for (const aa of this.aminoAcids) {
      temp.x.push(aa)
      // @ts-ignore
      if (this.data[aa]) {
        // @ts-ignore
        temp.y.push(this.data[aa])
      } else{
        temp.y.push(0)
      }
    }
    this.graphData = [temp]
    this.graphLayout.title = "MSA Variation Position " + this.data.pos
    this.revision++
  }

}
