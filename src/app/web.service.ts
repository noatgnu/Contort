import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {ConSurfGrade, ConSurfMSAVar} from "./con-surf-data";

@Injectable({
  providedIn: 'root'
})
export class WebService {
  baseUrl: string = environment.baseUrl
  constructor(private http: HttpClient) { }

  getConsurfMSAVar(uniprotId: string) {
    return this.http.get<ConSurfMSAVar[]>(`${this.baseUrl}/api/consurf/${uniprotId}/consurf_msa_variation`, {responseType: 'json', observe: 'body'})
  }

  getConsurfGrade(uniprotId: string) {
    return this.http.get<ConSurfGrade[]>(`${this.baseUrl}/api/consurf/${uniprotId}/consurf_grade`, {responseType: 'json', observe: 'body'})
  }

  getUniprotTypeAhead(query: string) {
    return this.http.get<string[]>(`${this.baseUrl}/api/consurf/typeahead/${query}`, {responseType: 'json', observe: 'body'})
  }

  getCount() {
    return this.http.get<number>(`${this.baseUrl}/api/consurf/count`, {responseType: 'json', observe: 'body'})
  }
}
