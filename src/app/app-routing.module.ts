import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ConsurfViewComponent} from "./consurf-view/consurf-view.component";
import {HomeComponent} from "./home/home.component";
import {ConsurfJobComponent} from "./consurf-job/consurf-job.component";

const routes: Routes = [
  {path: 'consurf-view/:accid', component: ConsurfViewComponent},
  {path: 'consurf-view', component: ConsurfViewComponent},
  {path: 'consurf-job/:jobid', component: ConsurfJobComponent},
  {path: 'consurf-job', component: ConsurfJobComponent},
  {path: 'home', component: HomeComponent},
  {path: '', redirectTo: '/consurf-view', pathMatch: 'full'}
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, bindToComponentInputs: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
