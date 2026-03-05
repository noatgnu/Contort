import { Component } from '@angular/core';
import { DataService } from "../data.service";
import { IDataFrame } from "data-forge";
import { ConSurfData } from "../con-surf-data";

@Component({
  selector: 'app-segments-viewer',
  templateUrl: './segments-viewer.component.html',
  styleUrls: ['./segments-viewer.component.scss'],
  standalone: false
})
export class SegmentsViewerComponent {

  constructor(public dataService: DataService) {
  }

  getItemHeight(): number {
    const cellSize = this.dataService.segmentSettings["cell-size"] || 50;
    const marginTop = this.dataService.segmentSettings["margin-top"] || 20;
    const marginBottom = this.dataService.segmentSettings["margin-bottom"] || 20;
    return cellSize + marginTop + marginBottom + 20;
  }

  trackSegment(index: number, item: { start: number; end: number; seq: IDataFrame<number, ConSurfData> }): string {
    const seq = item.seq.getSeries("GRADE").toArray().map((a: any) => a.SEQ).join("");
    return item.start + seq + item.end;
  }
}
