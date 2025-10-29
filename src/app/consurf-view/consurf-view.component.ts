import {Component, Input, OnInit, OnDestroy, signal} from '@angular/core';
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {DataFrame} from "data-forge";
import {debounceTime, forkJoin, map, Observable, tap, Subject, takeUntil, distinctUntilChanged} from "rxjs";
import {DataService} from "../data.service";
import {WebService} from "../web.service";
import {ConSurfGrade} from "../con-surf-data";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-consurf-view',
    templateUrl: './consurf-view.component.html',
    styleUrl: './consurf-view.component.scss',
    standalone: false
})
export class ConsurfViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Helper to convert RGB to Hex for color picker
  rgbToHex(rgb: string): string {
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
  
  // Helper to convert Hex to RGB for storage
  hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'rgb(0, 0, 0)';
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // Get color for picker
  getColor(grade: string): string {
    return this.rgbToHex(this.dataService.color_map[grade]);
  }
  
  // Set color from picker
  setColor(grade: string, hex: string): void {
    this.dataService.color_map[grade] = this.hexToRgb(hex);
  }
  @Input() set accid(value: string) {
    if (value !== "") {
      this.form.controls.term.setValue(value);
      this.getCONSURF();
    }
  }
  
  _jobid: string = "";
  
  @Input() set jobid(value: string) {
    this._jobid = value;
    if (value) {
      this.getConsurfFromJob(parseInt(value));
    }
  }

  readonly grades = Object.keys(this.dataService.color_map);

  form = this.fb.group({
    term: new FormControl<string>("", Validators.required)
  });

  formSegment = this.fb.group({
    cellSize: new FormControl<number>(this.dataService.segmentSettings["cell-size"], [Validators.required, Validators.min(1)]),
    marginTop: new FormControl<number>(this.dataService.segmentSettings["margin-top"], [Validators.required, Validators.min(1)]),
    marginBottom: new FormControl<number>(this.dataService.segmentSettings["margin-bottom"], [Validators.required, Validators.min(1)]),
    aaPerRow: new FormControl<number>(this.dataService.segmentSettings["number-of-aa-per-row"], [Validators.required, Validators.min(1)]),
  });
  
  filteredOptions: Observable<string[]> = new Observable<string[]>();
  dataCount: Observable<number> | undefined;

  searching = signal<boolean>(false);
  retrieving = signal<boolean>(false);
  hasData = signal<boolean>(false);

  constructor(
    public dataService: DataService,
    private fb: FormBuilder,
    private web: WebService,
    private sb: MatSnackBar
  ) {
    this.dataCount = this.web.getCount();
    this.setupSegmentSelectionListener();
  }

  ngOnInit(): void {
    this.setupSearchTypeahead();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSegmentSelectionListener(): void {
    this.dataService.segmentSelection
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        for (const d of data) {
          const seq = d.seq.getSeries("GRADE").toArray().map((a: ConSurfGrade) => a.SEQ).join("");
          const uniqueID = d.start + seq + d.end;
          
          if (!this.dataService.selectedSeqs.includes(uniqueID)) {
            this.dataService.selectedSeqs.push(uniqueID);
            
            for (let i = d.start; i <= d.end; i++) {
              if (!this.dataService.selectionMap[i]) {
                this.dataService.selectionMap[i] = [];
              }
              this.dataService.selectionMap[i].push(uniqueID);
              this.dataService.selectionMap[i].sort((a, b) => b.length - a.length);
            }
            
            this.dataService.segments.push(d);
            
            if (!this.dataService.segmentColorMap[uniqueID]) {
              this.dataService.segmentColorMap[uniqueID] = 
                this.dataService.defaultColorList[this.dataService.selectedSeqs.length % this.dataService.defaultColorList.length];
            }
          }
        }
        
        this.dataService.redrawSubject.next(true);
      });
  }

  private setupSearchTypeahead(): void {
    this.form.controls.term.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching.set(true)),
      map(value => this.web.getUniprotTypeAhead(value || '')),
      tap(() => this.searching.set(false)),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.filteredOptions = data;
    });
  }

  triggerUpdate(): void {
    if (!this.formSegment.valid) {
      this.sb.open('Invalid segment settings', 'Close', { duration: 2000 });
      return;
    }

    const cellSize = this.formSegment.controls.cellSize.value;
    const marginTop = this.formSegment.controls.marginTop.value;
    const marginBottom = this.formSegment.controls.marginBottom.value;
    const aaPerRow = this.formSegment.controls.aaPerRow.value;

    this.dataService.segmentSettings["cell-size"] = cellSize;
    this.dataService.segmentSettings["margin-top"] = marginTop;
    this.dataService.segmentSettings["margin-bottom"] = marginBottom;

    if (this.dataService.segmentSettings["number-of-aa-per-row"] !== aaPerRow) {
      this.dataService.segmentSettings["number-of-aa-per-row"] = aaPerRow;
      this.dataService.aaPerRowSubject.next(true);
    }

    this.dataService.redrawSubject.next(true);
    this.sb.open('Settings updated', 'Close', { duration: 2000 });
  }

  getCONSURF(): void {
    const term = this.form.value.term;
    
    if (!term || term === "") {
      this.sb.open('Please enter a UniProt accession ID', 'Close', { duration: 3000 });
      return;
    }

    this.retrieving.set(true);
    this.hasData.set(false);

    forkJoin([
      this.web.getConsurfGrade(term),
      this.web.getConsurfMSAVar(term)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([grades, msaVar]) => {
          this.processConsurfData(grades, msaVar);
          this.retrieving.set(false);
          this.hasData.set(true);
          this.sb.open('Data loaded successfully', 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.retrieving.set(false);
          this.sb.open('Failed to load ConSurf data', 'Close', { duration: 3000 });
        }
      });
  }

  getConsurfFromJob(jobId: number): void {
    this.retrieving.set(true);
    this.hasData.set(false);

    forkJoin([
      this.web.getConsurfGradeFromJob(jobId),
      this.web.getConeurfMSAVarFromJob(jobId)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([grades, msaVar]) => {
          this.processConsurfData(grades, msaVar);
          this.retrieving.set(false);
          this.hasData.set(true);
        },
        error: (error) => {
          this.retrieving.set(false);
          this.sb.open('Failed to load ConSurf data from job', 'Close', { duration: 3000 });
        }
      });
  }

  private processConsurfData(grades: any[], msaVar: any[]): void {
    this.dataService.dataMSA = new DataFrame(msaVar);
    this.dataService.dataGrade = new DataFrame(grades);

    this.dataService.combinedData = this.dataService.dataGrade.join(
      this.dataService.dataMSA,
      row => row.POS,
      row => row.pos,
      (left, right) => ({
        MSA: right,
        GRADE: left
      })
    ).bake();

    this.dataService.displayData = this.dataService.combinedData;
    this.dataService.redrawSubject.next(true);
  }

  handleFilterRange(event: { start: number; end: number }): void {
    if (!this.dataService.combinedData) return;
    
    this.dataService.displayData = this.dataService.combinedData
      .between(event.start - 1, event.end - 1)
      .resetIndex()
      .bake();
    
    this.sb.open(`Filtered to positions ${event.start}-${event.end}`, 'Close', { duration: 2000 });
  }

  downloadMSA(): void {
    const term = this.form.value.term;
    
    if (!term) {
      this.sb.open('No sequence term available', 'Close', { duration: 2000 });
      return;
    }

    const a = document.createElement('a');
    a.href = `${this.web.baseUrl}/api/consurf/files/msa/${term}`;
    a.download = `${term}.phy`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    this.sb.open('Download started', 'Close', { duration: 2000 });
  }
}
