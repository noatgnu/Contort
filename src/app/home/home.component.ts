import { Component } from '@angular/core';
import {DataFrame, fromCSV, IDataFrame} from "data-forge";
import {ConSurfData} from "../con-surf-data";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent {
  data: IDataFrame<number, ConSurfData> = new DataFrame()
  handleFileImport(event: Event) {
    if (event.target) {
      const target = event.target as HTMLInputElement
      if (target.files) {
        const file = target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target) {
            const text =  <string>reader.result
            // skip 4 first line
            const lines = text.split("\n")
            lines.splice(0, 4)
            lines[0] = lines[0].replace(/\s/g, "_")

            const data = lines.join("\n")
            // @ts-ignore
            const df: IDataFrame<number, ConSurfData> = fromCSV(data)
            this.data = df
          }
        }
        reader.readAsText(file)
      }
    }
  }

  constructor() { }
}
