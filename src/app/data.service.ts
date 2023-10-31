import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {ConSurfData} from "./con-surf-data";
import {IDataFrame} from "data-forge";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  color_map: any = {
    1: "rgb(15, 199, 207)",
    2: "rgb(143, 255, 255)",
    3: "rgb(208, 255, 255)",
    4: "rgb(224, 255, 255)",
    5: "rgb(255, 255, 255)",
    6: "rgb(255, 232, 240)",
    7: "rgb(240, 199, 223)",
    8: "rgb(239, 120, 160)",
    9: "rgb(159, 32, 95)"
  }

  segmentSelection: Subject<{start: number, end: number, seq: IDataFrame<number, ConSurfData>}[]> = new Subject<{start: number, end: number, seq: IDataFrame<number, ConSurfData>}[]>()
  segments: {start: number, end: number, seq: IDataFrame<number, ConSurfData>}[] = []
  redrawSubject: Subject<boolean> = new Subject<boolean>()
  constructor() {

  }
}
