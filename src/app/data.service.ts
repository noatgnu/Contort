import { Injectable, signal } from '@angular/core';
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
  redrawSubject: Subject<boolean> = new Subject<boolean>()
  aaPerRowSubject: Subject<boolean> = new Subject<boolean>()

  private _segments = signal<{start: number, end: number, seq: IDataFrame<number, ConSurfData>}[]>([]);
  private _selectionMap = signal<{[key: string]: string[]}>({});
  private _segmentColorMap = signal<{[key: string]: string}>({});
  private _selectedSeqs = signal<string[]>([]);
  private _dataGrade = signal<IDataFrame<number, ConSurfGrade>>(new DataFrame());
  private _dataMSA = signal<IDataFrame<number, ConSurfMSAVar>>(new DataFrame());
  private _combinedData = signal<IDataFrame<number, ConSurfData>>(new DataFrame());
  private _displayData = signal<IDataFrame<number, ConSurfData>>(new DataFrame());

  get segments(): {start: number, end: number, seq: IDataFrame<number, ConSurfData>}[] {
    return this._segments();
  }
  set segments(value: {start: number, end: number, seq: IDataFrame<number, ConSurfData>}[]) {
    this._segments.set(value);
  }

  get selectionMap(): {[key: string]: string[]} {
    return this._selectionMap();
  }
  set selectionMap(value: {[key: string]: string[]}) {
    this._selectionMap.set(value);
  }

  get segmentColorMap(): {[key: string]: string} {
    return this._segmentColorMap();
  }
  set segmentColorMap(value: {[key: string]: string}) {
    this._segmentColorMap.set(value);
  }

  get selectedSeqs(): string[] {
    return this._selectedSeqs();
  }
  set selectedSeqs(value: string[]) {
    this._selectedSeqs.set(value);
  }

  get dataGrade(): IDataFrame<number, ConSurfGrade> {
    return this._dataGrade();
  }
  set dataGrade(value: IDataFrame<number, ConSurfGrade>) {
    this._dataGrade.set(value);
  }

  get dataMSA(): IDataFrame<number, ConSurfMSAVar> {
    return this._dataMSA();
  }
  set dataMSA(value: IDataFrame<number, ConSurfMSAVar>) {
    this._dataMSA.set(value);
  }

  get combinedData(): IDataFrame<number, ConSurfData> {
    return this._combinedData();
  }
  set combinedData(value: IDataFrame<number, ConSurfData>) {
    this._combinedData.set(value);
  }

  get displayData(): IDataFrame<number, ConSurfData> {
    return this._displayData();
  }
  set displayData(value: IDataFrame<number, ConSurfData>) {
    this._displayData.set(value);
  }

  updateSelectionMap(key: string, value: string[]): void {
    this._selectionMap.update(map => ({ ...map, [key]: value }));
  }

  updateSegmentColorMap(key: string, value: string): void {
    this._segmentColorMap.update(map => ({ ...map, [key]: value }));
  }

  addSegment(segment: {start: number, end: number, seq: IDataFrame<number, ConSurfData>}): void {
    this._segments.update(segments => [...segments, segment]);
  }

  addSelectedSeq(seq: string): void {
    this._selectedSeqs.update(seqs => [...seqs, seq]);
  }

  constructor() {}
}
