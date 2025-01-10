import { Component } from '@angular/core';
import {DataService} from "../data.service";

@Component({
    selector: 'app-segments-viewer',
    templateUrl: './segments-viewer.component.html',
    styleUrls: ['./segments-viewer.component.sass'],
    standalone: false
})
export class SegmentsViewerComponent {

  constructor(public dataService: DataService) {
  }

}
