import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {ConSurfData, ConSurfGrade, ConSurfMSAVar} from "./con-surf-data";
import {DataFrame, IDataFrame} from "data-forge";

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
  segmentSettings: any = {
    "margin-top": 30,
    "margin-bottom": 50,
    "cell-size": 30,
    "number-of-aa-per-row": 50
  }

  customScore: {[key: string]: number} = {}

  defaultColorList: string[] = [
    "#fd7f6f",
    "#7eb0d5",
    "#b2e061",
    "#bd7ebe",
    "#ffb55a",
    "#ffee65",
    "#beb9db",
    "#fdcce5",
    "#8bd3c7",
  ]

  segmentSelection: Subject<{start: number, end: number, seq: IDataFrame<number, ConSurfData>}[]> = new Subject<{start: number, end: number, seq: IDataFrame<number, ConSurfData>}[]>()
  segments: {start: number, end: number, seq: IDataFrame<number, ConSurfData>}[] = []
  redrawSubject: Subject<boolean> = new Subject<boolean>()
  selectionMap: {[key: string]: string[]} = {}
  segmentColorMap: {[key: string]: string} = {}
  selectedSeqs: string[] = []
  dataGrade: IDataFrame<number, ConSurfGrade> = new DataFrame()
  dataMSA: IDataFrame<number, ConSurfMSAVar> = new DataFrame()
  combinedData: IDataFrame<number, ConSurfData> = new DataFrame()
  displayData: IDataFrame<number, ConSurfData> = new DataFrame()
  aaPerRowSubject: Subject<boolean> = new Subject<boolean>()

  constructor() {

  }
}
